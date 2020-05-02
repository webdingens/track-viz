import React from 'react';
import { Vector2 } from 'three';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { skaterPropTypes } from '../../app/reducers/skatersSlice';

import styles from './TrackPackMarkings.module.scss';

const C1 = new Vector2(5.33, 0);
const C2 = new Vector2(-5.33, 0);
const C1_OUTER = new Vector2(5.33, -.305);
const C2_OUTER = new Vector2(-5.33, .305);
const RADIUS_INNER = 3.81;
const RADIUS_OUTER = 8.08;
const MEASUREMENT_RADIUS = 3.81 + 1.6;
const CIRCUMFERENCE_HALF_CIRCLE = Math.PI * MEASUREMENT_RADIUS;
const ENGAGEMENT_ZONE_DISTANCE_TO_PACK = 6.10;

const F_OUTER_TOP = (x) => {
  let m = -.61/10.66;
  let c = -8.385 - m * 5.33;
  return x * m + c;
}
const F_OUTER_BOTTOM = (x) => {
  let m = -.61/10.66;
  let c = 8.385 + m * 5.33;
  return x * m + c;
}

const LINE1 = {
  p1: new Vector2(5.33,-MEASUREMENT_RADIUS),
  p2: new Vector2(-5.33,-MEASUREMENT_RADIUS)
}
const LINE2 = {
  p1: new Vector2(-5.33,MEASUREMENT_RADIUS),
  p2: new Vector2(5.33,MEASUREMENT_RADIUS)
}
const LINE_DIST = LINE1.p1.distanceTo(LINE1.p2);

const MEASUREMENT_LENGTH = 2 * CIRCUMFERENCE_HALF_CIRCLE + 2 * LINE_DIST;


const getInBoundSkaters = (blockers) => {
  return blockers.filter((blocker) => {
    let pos = new Vector2(blocker.x, blocker.y);  // blocker position

    // first half circle
    if (pos.x > C1.x) {
      // not inside the track nor outside
      if (C1.distanceTo(pos) < RADIUS_INNER || C1_OUTER.distanceTo(pos) > RADIUS_OUTER) return false;
    }

    // straightaway -y
    if (pos.x <= C1.x && pos.x >= C2.x && pos.y <= 0) {
      // not inside the track nor outside
      if (pos.y > -RADIUS_INNER || F_OUTER_TOP(pos.x) > pos.y) {
        return false;
      }
    }

    // second half circle
    if (pos.x < C2.x) {
      // not inside the track nor outside
      if (C2.distanceTo(pos) < RADIUS_INNER || C2_OUTER.distanceTo(pos) > RADIUS_OUTER) return false;
    }

    // straightaway y
    if (pos.x <= C1.x && pos.x >= C2.x && pos.y > 0) {
      // not inside the track nor outside
      if (pos.y < RADIUS_INNER || F_OUTER_BOTTOM(pos.x) < pos.y)
        return false;
    }

    return true;
  });
}

const getSkatersWithPivotLineDistance = (blockers) => {
  let ret = _.cloneDeep(blockers);
  ret.forEach((blocker, idx, array) => {
    let dist = 0; // distance to pivot line (+y)
    let pos = new Vector2(blocker.x, blocker.y);  // blocker position

    // first half circle
    if (pos.x > C1.x) {
      // compute angle of skater to C1
      let p = pos.clone().sub(C1);
      let angle = p.angle();
      angle = -angle + Math.PI / 2; // correct orientation
      angle = (angle + 2 * Math.PI) % (2 * Math.PI);  // make positive

      dist += angle * MEASUREMENT_RADIUS;

      array[idx].pivotLineDist = dist;
      return;
    } else {
      // add circumference of half circle past the pivot line
      dist += CIRCUMFERENCE_HALF_CIRCLE;
    }

    // straightaway -y
    if (pos.x <= C1.x && pos.x >= C2.x && pos.y <= 0) {
      dist += C1.x - pos.x;

      array[idx].pivotLineDist = dist;
      return;
    } else {
      dist += LINE_DIST;
    }

    // second half circle
    if (pos.x < C2.x) {
      // compute angle of skater to C1
      let p = pos.clone().sub(C2);
      let angle = p.angle();
      angle = -angle - Math.PI / 2; // correct orientation
      angle = (angle + 2 * Math.PI) % (2 * Math.PI);  // make positive

      dist += angle * MEASUREMENT_RADIUS;

      array[idx].pivotLineDist = dist;
      return;
    } else {
      // add circumference of half circle past the pivot line
      dist += CIRCUMFERENCE_HALF_CIRCLE;
    }

    // straightaway y
    if (pos.x <= C1.x && pos.x >= C2.x && pos.y > 0) {
      dist += pos.x - C2.x;
    }

    array[idx].pivotLineDist = dist;
  })

  return ret;
}

/*
* Computes the groups of skaters with a maximum distance of 3.05m
*/
const groupBlockers = (blockers) => {
  let ret = [];
  let skaters = _.cloneDeep(blockers);
  let closeSkaters = [];
  for (let i=0;i<skaters.length-1;i++) {
    for (let j=i+1;j<skaters.length;j++) {
      let dist = getDistanceOfTwoSkaters(skaters[j], skaters[i]);

      if (dist < 3.05) {
        closeSkaters.push([i, j]);
      }
    }
  }

  let toGroup = closeSkaters;

  // console.log(_.cloneDeep(toGroup));

  while (toGroup.length > 0) {
    // console.log('outer while loop');
    let tuple = toGroup[0];
    let newGroup = [tuple[0]];
    let checkedIdx = -1;
    // console.log(_.cloneDeep(toGroup));
    // console.log(_.cloneDeep(newGroup));

    while (checkedIdx < newGroup.length -1) {

      // console.log('inner while loop');
      // console.log(_.cloneDeep(newGroup));
      // console.log(checkedIdx)

      let checking = newGroup[checkedIdx + 1];

      for(let i=0;i<toGroup.length;i++) {
        let t = toGroup[i];
        if (t[0] === checking || t[1] === checking) {
          let idxNew = t[0] === checking ? t[1] : t[0];
          // console.log('idxNew: ', idxNew);
          if (newGroup.indexOf(idxNew) !== -1)  continue;
          // console.log('pushing idxNew: ', idxNew);
          newGroup.push(idxNew);
        }
      }
      checkedIdx++;
    }
    // console.log('endwhile');
    // console.log(_.cloneDeep(newGroup));
    toGroup = toGroup.filter((el) => {
      return newGroup.indexOf(el[0]) === -1 && newGroup.indexOf(el[1]) === -1 
    });
    // console.log(_.cloneDeep(toGroup));
    ret.push(newGroup.map((skaterIdx) => skaters[skaterIdx]));
  }

  return ret;
}

const filterOutGroupsWithOnlyOneTeam = (groupedBlockers) => {
  return groupedBlockers.filter((group) => {
    let teamA = group.filter((g) => g.team === 'A');
    let teamB = group.filter((g) => g.team === 'B');
    return teamA.length && teamB.length;
  })
}

const getLargestGroup = (groups = []) => {
  let ret = false;
  let size = 1;

  groups.forEach((group) => {
    let length = group.length;
    if (length > size) {
      ret = group;
      size = length;
    }
  });

  // find all the groups with determined largest group size
  let largestGroups = groups.filter((group) => group.length === size);

  // check if the largest group is unique, else not a pack
  let notAUniqueLargestGroup = largestGroups.length > 1;

  return notAUniqueLargestGroup ? false : ret;
}

const getSkatersFurthestApart = (pack) => {
  if (pack.length <= 1) return pack;  // should not happen
  let blockers = _.cloneDeep(pack);

  let blockerA = blockers[0];
  let blockerB;
  let distMax = -1;
  let newDist = 0;

  let computeNewDistance = () => {
    // dist blockerA to all
    blockers.forEach((blocker) => {
      if (blocker === blockerA) return;

      let dist = getDistanceOfTwoSkaters(blocker, blockerA);
      if (dist > newDist) {
        blockerB = blocker;
        newDist = dist;
      }
    });

    // switch players
    let tmp = blockerA;
    blockerA = blockerB;
    blockerB = tmp;

    return newDist;
  }

  while (newDist > distMax) {
    distMax = newDist;
    newDist = -1;
    newDist = computeNewDistance();
  }

  return [
    blockerA,
    blockerB
  ]
}

const distanceSortFunction = (a, b) => a - b;

const getDistanceOfTwoSkaters = (skaterA, skaterB) => {
  let distances = [skaterA.pivotLineDist, skaterB.pivotLineDist];
  distances.sort(distanceSortFunction);

  // Minimize distance going counter- and clockwise
  let dist = Math.min(distances[1] - distances[0], distances[0] - (distances[1] - MEASUREMENT_LENGTH));

  return dist;
}

const getOutermostSkatersOfPack = (blockers) => {
  let possiblePack = getInBoundSkaters(blockers);
  possiblePack = getSkatersWithPivotLineDistance(possiblePack);
  possiblePack = groupBlockers(possiblePack);
  console.dir(possiblePack)
  possiblePack = filterOutGroupsWithOnlyOneTeam(possiblePack);
  console.dir(possiblePack)
  let pack = getLargestGroup(possiblePack);
  console.dir(pack)

  if (!pack) return [];

  return getSkatersFurthestApart(pack);
}

const getSortedClosestPointsOnLine = (furthestSkaters = []) => {
  if (furthestSkaters.length < 2) return;

  let distToPivotLine1 = furthestSkaters[0].pivotLineDist;
  let distToPivotLine2 = furthestSkaters[1].pivotLineDist;
  let distances = [distToPivotLine1, distToPivotLine2];
  distances.sort(distanceSortFunction);

  // set starting point of pack marking
  if ((distances[1] - distances[0]) >= (distances[0] - (distances[1] - MEASUREMENT_LENGTH))) {
    return [distances[1] - MEASUREMENT_LENGTH, distances[0]];  // switch
  }
  // return switched for smaller arc
  return [distances[0], distances[1]];
}

/**
 * Generate the shape of the track having the start and end point
 * of the pack on the measurement line
 *
 * @param Number p1
 * @param Number p2
 * @returns PathData / Polyline?
 */
const computePartialTrackShape = (p1, p2) => {
  // console.log('computePartialTrackShape');

  let data = '';
  // console.log('p1: ', p1);
  // console.log('p2: ', p2);

  let start = p1;
  let end = p2;
  while (start < 0 || end < 0) {
    start += MEASUREMENT_LENGTH
    end += MEASUREMENT_LENGTH
  }

  // console.log('start: ', start);
  // console.log('end: ', end);

  let drawLength = 0;
  let currentIdx = 0;

  while (drawLength < 4 * MEASUREMENT_LENGTH) {
    let newDrawLength = drawLength + drawShapes[currentIdx].length;
    let startBeforeEndOfSection = start < newDrawLength;
    let endBeforeEndOfSection = end < newDrawLength;

    // console.log('draw loop')
    // console.log('newDrawLength: ', newDrawLength)
    // console.log('start before end of section ', startBeforeEndOfSection);
    // console.log('end before end of section ', endBeforeEndOfSection);
    
    // console.log('draw Outer Line')
    // console.log('with Start at: ', start - drawLength)
    // console.log('with Starting Line?: ', start >= drawLength && startBeforeEndOfSection)
    // console.log('with End at: ', endBeforeEndOfSection ? end - drawLength : false)
    // console.log('sectionLength: ', drawShapes[currentIdx].length)

    if (startBeforeEndOfSection) {
      data += ' ' + drawShapes[currentIdx].drawOuterLine({
        start: start - drawLength,
        startNeedsDrawing: start >= drawLength && startBeforeEndOfSection,
        end: endBeforeEndOfSection ? end - drawLength : false
      });
    }
    drawLength = newDrawLength;

    if (endBeforeEndOfSection) break;
    currentIdx = (currentIdx + 1) % drawShapes.length;  // not increment
  }

  // console.log(currentIdx)
  // console.log(drawLength)

  // switching drawing direction
  // swap start and end
  let tmp = start;
  start = end;
  end = tmp;

  // console.log('start: ', start);
  // console.log('end: ', end);

  // draw the inside lines (drat, counterclockwise)
  while (drawLength > 0) {
    let newDrawLength = drawLength - drawShapes[currentIdx].length;
    let stillNeedsDrawing = drawLength >= end;
    let startBeforeEndOfSection = start >= drawLength;
    let endBeforeStartOfSection = end < newDrawLength;

    // console.log('newDrawLength: ', newDrawLength);

    // console.log(stillNeedsDrawing)
    // console.log(currentIdx)

    if (stillNeedsDrawing) {
      data += ' ' + drawShapes[currentIdx].drawInnerLine({
        start: startBeforeEndOfSection ? drawLength : start - newDrawLength,
        end: endBeforeStartOfSection ? 0 : end - newDrawLength
      });
    }
    drawLength = newDrawLength;

    currentIdx = ((currentIdx - 1) + drawShapes.length) % drawShapes.length;
  }

  data += 'Z';

  return (
    <path className={styles.pack} d={data} />
  )
}

const angleToLineFirstHalfCircle = (angle) => {
  let ret;
  let direction = new Vector2(Math.cos(angle), Math.sin(angle));
  let pInner = C1.clone().add(direction.multiplyScalar(RADIUS_INNER));
  /*
  *   CIRCLE LINE INTERSECTION
  *   https://mathworld.wolfram.com/Circle-LineIntersection.html
  */
  let p1 = C1.clone().add(direction).clone().sub(C1_OUTER);
  let p2 = C1.clone().sub(C1_OUTER);
  let d = p2.clone().sub(p1);
  let dr = d.length();
  let D = p1.x * p2.y - p2.x * p1.y;

  let determinant = RADIUS_OUTER*RADIUS_OUTER * dr * dr - D * D;

  // console.log('startNeedsDrawing: ', startNeedsDrawing);
  // console.log('angle: ', angle * 180 / Math.PI + 'deg');
  // console.log('pInner: ', pInner);
  // console.log('p1: ', p1);
  // console.log('p2: ', p2);
  // console.log('d: ', d);
  // console.log('dr: ', dr);
  // console.log('D: ', D);

  if (determinant !== 0) {
    const sgn = (x) => x < 0 ? -1 : 1;

    let x1 = (D * d.y + sgn(d.y) * d.x * Math.sqrt(determinant)) / (dr * dr);
    let x2 = (D * d.y - sgn(d.y) * d.x * Math.sqrt(determinant)) / (dr * dr);

    let y1 = (-D * d.x + Math.abs(d.y) * Math.sqrt(determinant)) / (dr * dr);
    let y2 = (-D * d.x - Math.abs(d.y) * Math.sqrt(determinant)) / (dr * dr);

    let pOuter1 = (new Vector2(x1, y1)).add(C1_OUTER);
    let pOuter2 = (new Vector2(x2, y2)).add(C1_OUTER);

    // console.log('pOuter1: ', pOuter1)
    // console.log('pOuter2: ', pOuter2)

    let pOuter = pOuter1.x > pOuter2.x ? pOuter1 : pOuter2;
    // console.log('pOuter: ', pOuter)
    // console.log(C1_OUTER)

    ret = [pInner, pOuter];
  }

  return ret;
}

const angleToLineSecondHalfCircle = (angle) => {
  let ret;
  let direction = new Vector2(Math.cos(angle), Math.sin(angle));
  let pInner = C2.clone().add(direction.multiplyScalar(RADIUS_INNER));
  /*
  *   CIRCLE LINE INTERSECTION
  *   https://mathworld.wolfram.com/Circle-LineIntersection.html
  */
  let p1 = C2.clone().add(direction).clone().sub(C2_OUTER);
  let p2 = C2.clone().sub(C2_OUTER);
  let d = p2.clone().sub(p1);
  let dr = d.length();
  let D = p1.x * p2.y - p2.x * p1.y;

  let determinant = RADIUS_OUTER*RADIUS_OUTER * dr * dr - D * D;

  // console.log('startNeedsDrawing: ', startNeedsDrawing);
  // console.log('angle: ', angle * 180 / Math.PI + 'deg');
  // console.log('pInner: ', pInner);
  // console.log('p1: ', p1);
  // console.log('p2: ', p2);
  // console.log('d: ', d);
  // console.log('dr: ', dr);
  // console.log('D: ', D);

  if (determinant !== 0) {
    const sgn = (x) => x < 0 ? -1 : 1;

    let x1 = (D * d.y + sgn(d.y) * d.x * Math.sqrt(determinant)) / (dr * dr);
    let x2 = (D * d.y - sgn(d.y) * d.x * Math.sqrt(determinant)) / (dr * dr);

    let y1 = (-D * d.x + Math.abs(d.y) * Math.sqrt(determinant)) / (dr * dr);
    let y2 = (-D * d.x - Math.abs(d.y) * Math.sqrt(determinant)) / (dr * dr);

    let pOuter1 = (new Vector2(x1, y1)).add(C2_OUTER);
    let pOuter2 = (new Vector2(x2, y2)).add(C2_OUTER);

    // console.log('pOuter1: ', pOuter1)
    // console.log('pOuter2: ', pOuter2)

    let pOuter = pOuter1.x < pOuter2.x ? pOuter1 : pOuter2;
    // console.log('pOuter: ', pOuter)
    // console.log(C1_OUTER)

    ret = [pInner, pOuter];
  }

  return ret;
}

const drawShapes = [
  {
    part: 'First Half Circle',
    length: CIRCUMFERENCE_HALF_CIRCLE,
    drawOuterLine({ start, startNeedsDrawing, end }) {
      let angle = start / MEASUREMENT_RADIUS;
      angle = -angle + Math.PI / 2;  // correct orientiation
      let data = '';

      if (startNeedsDrawing) {
        let [pInner, pOuter] = angleToLineFirstHalfCircle(angle);

        if (pOuter && pOuter.x > C1_OUTER.x) {
          data = `M${pInner.x},${pInner.y}L${pOuter.x},${pOuter.y}`;
        } else {
          console.log('didn\'t find an intersection');
        }
      }

      if (end) {
        let endAngle = ((end / MEASUREMENT_RADIUS)) * (180 / Math.PI);
        let startAngle = ((start / MEASUREMENT_RADIUS)) * (180 / Math.PI);
        let [pInner, pOuter] = angleToLineFirstHalfCircle(-(end / MEASUREMENT_RADIUS) + Math.PI / 2);

        data += ` A ${RADIUS_OUTER} ${RADIUS_OUTER} ${endAngle - startAngle} 0 0 ${pOuter.x},${pOuter.y}`;

        // draw inward line
        data += ` L${pInner.x},${pInner.y}`;
      } else {
        let endAngle = ((start / MEASUREMENT_RADIUS)) * (180 / Math.PI);
        // draw remaining arc
        data += ` A ${RADIUS_OUTER} ${RADIUS_OUTER} ${180 - endAngle} 0 0 5.33,-8.385`;
      }

      // console.log(data)

      return data;
    },
    drawInnerLine({ start, end }) {
      // console.log('drawInnerLine First Apex')
      // console.log('start: ', start);
      // console.log('end: ', end);
      let data = '';
      let startAngle;
      let endAngle;

      if (start) {
        startAngle = ((start / MEASUREMENT_RADIUS)) * (180 / Math.PI);
      } else {
        startAngle = 180;
      }

      if (end) {
        endAngle = ((end / MEASUREMENT_RADIUS)) * (180 / Math.PI);
      } else {
        endAngle = 0;
      }

      let endAngleRad = -(endAngle * Math.PI / 180) + Math.PI / 2;
      // console.log(startAngle)
      // console.log(endAngle)
      // console.log(endAngleRad)
      let direction = new Vector2(Math.cos(endAngleRad), Math.sin(endAngleRad));
      let pInner = C1.clone().add(direction.multiplyScalar(RADIUS_INNER));

      // console.dir(pInner)

      data += ` A ${RADIUS_INNER} ${RADIUS_INNER} ${endAngle - startAngle} 0 1 ${pInner.x},${pInner.y}`;

      // console.log(data);

      return data;
    },
  },
  {
    part: 'First Straightaway',
    length: LINE_DIST,
    drawOuterLine({ start, startNeedsDrawing, end }) {
      // console.log('drawOuterLine')
      let data = '';
      let xEnd = end ? end : LINE_DIST;
      let pEnd = new Vector2(C1_OUTER.x - xEnd, F_OUTER_TOP(C1_OUTER.x  - xEnd));

      if (startNeedsDrawing) {
        let pStart = new Vector2(C1_OUTER.x - start, F_OUTER_TOP(C1_OUTER.x - start));
        let pStartInner = new Vector2(C1.x - start, -RADIUS_INNER);
        data = `M${pStartInner.x},${pStartInner.y}L${pStart.x},${pStart.y}`;
      }

      data += ` L${pEnd.x},${pEnd.y}`;

      if (end) {
        let pEndInner = new Vector2(C1_OUTER.x - xEnd, -RADIUS_INNER);
        data += ` L${pEndInner.x},${pEndInner.y}`;
      }

      return data;
    },
    drawInnerLine({ start, end }) {
      // console.log('drawInnerLine First Straightaway')
      // console.log('start: ', start)
      // console.log('end: ', end)
      let pEnd = new Vector2(C1.x - end, -RADIUS_INNER);

      return ` L${pEnd.x},${pEnd.y}`;
    },
  },
  {
    part: 'Second Half Circle',
    length: CIRCUMFERENCE_HALF_CIRCLE,
    drawOuterLine({ start, startNeedsDrawing, end }) {
      let angle = start / MEASUREMENT_RADIUS;
      angle = -angle + Math.PI / 2 + Math.PI;  // correct orientiation
      let data = '';

      if (startNeedsDrawing) {
        let [pInner, pOuter] = angleToLineSecondHalfCircle(angle);

        if (pOuter && pOuter.x < C2_OUTER.x) {
          data = `M${pInner.x},${pInner.y}L${pOuter.x},${pOuter.y}`;
        } else {
          console.log('didn\'t find an intersection');
        }
      }

      if (end) {
        let endAngle = ((end / MEASUREMENT_RADIUS)) * (180 / Math.PI);
        let startAngle = ((start / MEASUREMENT_RADIUS)) * (180 / Math.PI);
        let [pInner, pOuter] = angleToLineSecondHalfCircle(-(end / MEASUREMENT_RADIUS) + Math.PI / 2  + Math.PI);

        data += ` A ${RADIUS_OUTER} ${RADIUS_OUTER} ${endAngle - startAngle} 0 0 ${pOuter.x},${pOuter.y}`;

        // draw inward line
        data += ` L${pInner.x},${pInner.y}`;
      } else {
        let endAngle = ((start / MEASUREMENT_RADIUS)) * (180 / Math.PI);
        // draw remaining arc
        data += ` A ${RADIUS_OUTER} ${RADIUS_OUTER} ${180 - endAngle} 0 0 -5.33,8.385`;
      }

      // console.log(data)

      return data;
    },
    drawInnerLine({ start, end }) {
      // console.log('drawInnerLine First Apex')
      // console.log('start: ', start);
      // console.log('end: ', end);
      let data = '';
      let startAngle;
      let endAngle;

      if (start) {
        startAngle = ((start / MEASUREMENT_RADIUS)) * (180 / Math.PI);
      } else {
        startAngle = 180;
      }

      if (end) {
        endAngle = ((end / MEASUREMENT_RADIUS)) * (180 / Math.PI);
      } else {
        endAngle = 0;
      }

      let endAngleRad = -(endAngle * Math.PI / 180) + Math.PI / 2 + Math.PI;
      // console.log(startAngle)
      // console.log(endAngle)
      // console.log(endAngleRad)
      let direction = new Vector2(Math.cos(endAngleRad), Math.sin(endAngleRad));
      let pInner = C2.clone().add(direction.multiplyScalar(RADIUS_INNER));

      // console.dir(pInner)

      data += ` A ${RADIUS_INNER} ${RADIUS_INNER} ${endAngle - startAngle} 0 1 ${pInner.x},${pInner.y}`;

      // console.log(data);

      return data;
    },
  },
  {
    part: 'Second Straightaway',
    length: LINE_DIST,
    drawOuterLine({ start, startNeedsDrawing, end }) {
      // console.log('drawOuterLine Second Straightaway')
      let data = '';
      let xEnd = end ? end : LINE_DIST;
      let pEnd = new Vector2(C2_OUTER.x + xEnd, F_OUTER_BOTTOM(C2_OUTER.x  + xEnd));

      if (startNeedsDrawing) {
        let pStart = new Vector2(C2_OUTER.x + start, F_OUTER_BOTTOM(C2_OUTER.x + start));
        let pStartInner = new Vector2(C2.x + start, RADIUS_INNER);
        data = `M${pStartInner.x},${pStartInner.y}L${pStart.x},${pStart.y}`;
      }

      data += ` L${pEnd.x},${pEnd.y}`;

      // console.log('start: ', start);
      // console.log('end: ', end);
      if (end) {
        let pEndInner = new Vector2(C2_OUTER.x + xEnd, RADIUS_INNER);
        // console.log('pEndInner', pEndInner);
        data += ` L${pEndInner.x},${pEndInner.y}`;
      }


      return data;
    },
    drawInnerLine({ start, end }) {
      // console.log('drawInnerLine Second Straightaway')
      // console.log('start: ', start)
      // console.log('end: ', end)
      let pEnd = new Vector2(C2.x + end, RADIUS_INNER);

      return ` L${pEnd.x},${pEnd.y}`;
    },
  }
];

const renderPackShape = (skaters) => {
  let blockers = skaters.filter((skater) => !skater.isJammer);
  let outermostSkaters = getOutermostSkatersOfPack(blockers);

  let packPresent = outermostSkaters.length === 2;
  let packBounds;
  let engangementZoneBounds;
  
  if (packPresent) {
    packBounds = getSortedClosestPointsOnLine(outermostSkaters);
    engangementZoneBounds = [packBounds[0] - ENGAGEMENT_ZONE_DISTANCE_TO_PACK, packBounds[1] + ENGAGEMENT_ZONE_DISTANCE_TO_PACK];
  }

  return (
    <>
    {packPresent ? computePartialTrackShape(...packBounds) : null}
    {packPresent ? computePartialTrackShape(...engangementZoneBounds) : null}
    </>
  )
}

const TrackPackMarkings = (props) => {
  return (
    <>
    <text fontSize="1" textAnchor="middle">Where is the pack?</text>
    {renderPackShape(props.skaters)}
    </>
  )
}

TrackPackMarkings.propTypes = {
  skaters: PropTypes.arrayOf(skaterPropTypes).isRequired
}

export default TrackPackMarkings;