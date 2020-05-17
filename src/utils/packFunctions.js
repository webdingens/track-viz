import { Vector2 } from 'three';
import _ from 'lodash';
import * as THREE from 'three';

export const C1 = new Vector2(5.33, 0);
export const C2 = new Vector2(-5.33, 0);
export const C1_OUTER = new Vector2(5.33, -.305);
export const C2_OUTER = new Vector2(-5.33, .305);
export const RADIUS_INNER = 3.81;
export const RADIUS_OUTER = 8.08;
export const MEASUREMENT_RADIUS = 3.81 + 1.6;
export const CIRCUMFERENCE_HALF_CIRCLE = Math.PI * MEASUREMENT_RADIUS;
export const ENGAGEMENT_ZONE_DISTANCE_TO_PACK = 6.10;
export const SKATER_RADIUS = .3;

export const F_OUTER_TOP = (x) => {
  let m = -.61/10.66;
  let c = -8.385 - m * 5.33;
  return x * m + c;
}
export const F_OUTER_BOTTOM = (x) => {
  let m = -.61/10.66;
  let c = 8.385 + m * 5.33;
  return x * m + c;
}

export const LINE1 = {
  p1: new Vector2(5.33,-MEASUREMENT_RADIUS),
  p2: new Vector2(-5.33,-MEASUREMENT_RADIUS)
}
export const LINE2 = {
  p1: new Vector2(-5.33,MEASUREMENT_RADIUS),
  p2: new Vector2(5.33,MEASUREMENT_RADIUS)
}
export const LINE_DIST = LINE1.p1.distanceTo(LINE1.p2);

export const MEASUREMENT_LENGTH = 2 * CIRCUMFERENCE_HALF_CIRCLE + 2 * LINE_DIST;

/**
 * Get Skaters with Derived Property inBounds
 * @param {object} skaters 
 */
export const getSkatersWDPInBounds = (skaters) => {
  return skaters.map((skater) => {
    let pos = new Vector2(skater.x, skater.y);  // blocker position
    let ret = _.cloneDeep(skater);

    // first half circle
    if (pos.x > C1.x) {
      // not inside the track nor outside
      if (C1.distanceTo(pos) < RADIUS_INNER + SKATER_RADIUS || C1_OUTER.distanceTo(pos) > RADIUS_OUTER - SKATER_RADIUS) {
        ret.inBounds = false;
        return ret;
      }
    }

    // straightaway -y
    if (pos.x <= C1.x && pos.x >= C2.x && pos.y <= 0) {
      // not inside the track nor outside
      if (pos.y > -RADIUS_INNER - SKATER_RADIUS || F_OUTER_TOP(pos.x) + SKATER_RADIUS > pos.y) {
        ret.inBounds = false;
        return ret;
      }
    }

    // second half circle
    if (pos.x < C2.x) {
      // not inside the track nor outside
      if (C2.distanceTo(pos) < RADIUS_INNER + SKATER_RADIUS || C2_OUTER.distanceTo(pos) > RADIUS_OUTER - SKATER_RADIUS) {
        ret.inBounds = false;
        return ret;
      }
    }

    // straightaway y
    if (pos.x <= C1.x && pos.x >= C2.x && pos.y > 0) {
      // not inside the track nor outside
      if (pos.y < RADIUS_INNER + SKATER_RADIUS || F_OUTER_BOTTOM(pos.x) - SKATER_RADIUS < pos.y) {
        ret.inBounds = false;
        return ret;
      }
    }

    ret.inBounds = true;
    return ret;
  });
}

export const getSkatersWDPPivotLineDistance = (skaters) => {
  let ret = _.cloneDeep(skaters);
  ret.forEach((skater, idx, array) => {
    let dist = 0; // distance to pivot line (+y)
    let pos = new Vector2(skater.x, skater.y);  // blocker position

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

const getDistanceOfTwoSkaters = (skaterA, skaterB) => {
  let distances = [skaterA.pivotLineDist, skaterB.pivotLineDist];
  distances.sort(distanceSortFunction);

  // Minimize distance going counter- and clockwise
  let dist = Math.min(distances[1] - distances[0], distances[0] - (distances[1] - MEASUREMENT_LENGTH));

  return dist;
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

const filterOutGroupsWithOnlyOneTeam = (groupedBlockers) => {
  return groupedBlockers.filter((group) => {
    let teamA = group.filter((g) => g.team === 'A');
    let teamB = group.filter((g) => g.team === 'B');
    return teamA.length && teamB.length;
  })
}

export const getPack = (skaters) => {
  let blockers = skaters.filter((skater) => !skater.isJammer);
  // only in bounds blockers
  let possiblePack = blockers.filter((blocker) => blocker.inBounds);
  possiblePack = groupBlockers(possiblePack);
  // console.dir(possiblePack)
  possiblePack = filterOutGroupsWithOnlyOneTeam(possiblePack);
  // console.dir(possiblePack)
  let pack = getLargestGroup(possiblePack);
  // console.dir(pack)

  if (!pack) return [];
  return pack;
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

export const getSortedPackBoundaries = (pack) => {
  if (pack.length < 2) return false;

  let outermostSkaters = getSkatersFurthestApart(pack);
  return getSortedClosestPointsOnLine(outermostSkaters);
}

const isSkaterInZoneBounds = (skater, packBoundaries) => {
  let p = skater.pivotLineDist;
  let ret = false;
  if ((p >= packBoundaries[0] && p <= packBoundaries[1])
  || (p < packBoundaries[0] && (p + MEASUREMENT_LENGTH) <= packBoundaries[1])
  || (p > packBoundaries[1] && (p - MEASUREMENT_LENGTH) >= packBoundaries[0])) {
    ret = true;
  }
  return ret;
}

export const getSkatersWDPInPlayPackSkater = (skaters, packBoundaries) => {
  return skaters.map((skater) => {
    let ret = _.cloneDeep(skater);

    if (skater.isJammer) {
      ret.inPlay = skater.inBounds;
    } else {
      ret.inPlay = skater.inBounds && isSkaterInZoneBounds(skater, [packBoundaries[0] - ENGAGEMENT_ZONE_DISTANCE_TO_PACK, packBoundaries[1] + ENGAGEMENT_ZONE_DISTANCE_TO_PACK]);

      ret.packSkater = skater.inBounds && isSkaterInZoneBounds(skater,packBoundaries);
    }
    return ret;
  })
}

export const getRelativeVPosition = (skater) => {
  let pos = new Vector2(skater.x, skater.y);  // blocker position

  // first half circle
  if (pos.x > C1.x) {
    let p = pos.clone().sub(C1);
    let v = p.length() - MEASUREMENT_RADIUS;
    return v;
  }

  // straightaway -y
  if (pos.x <= C1.x && pos.x >= C2.x && pos.y <= 0) {
    let v = -(pos.y + MEASUREMENT_RADIUS); // move to y=0 then mirror
    return v;
  }

  // second half circle
  if (pos.x < C2.x) {
    // compute angle of skater to C1
    let p = pos.clone().sub(C2);
    let v = p.length() - MEASUREMENT_RADIUS;
    return v;
  }

  // straightaway y
  if (pos.x <= C1.x && pos.x >= C2.x && pos.y > 0) {
    let v = pos.y - MEASUREMENT_RADIUS;
    return v;
  }
}

export const setPositionFromVAndDist = (skater) => {
  let s = _.cloneDeep(skater);
  let dist = skater.pivotLineDist;

  // first half circle
  if (dist < CIRCUMFERENCE_HALF_CIRCLE) {

    let angle = dist / MEASUREMENT_RADIUS;
    let direction = new Vector2(0, MEASUREMENT_RADIUS + skater.v);

    direction.rotateAround(new Vector2(0, 0), -angle);
    let p = direction.add(C1);

    s.x = p.x;
    s.y = p.y;
    return s;
  }

  // straightaway -y
  if (dist < CIRCUMFERENCE_HALF_CIRCLE + LINE_DIST) {
    let x = C1.x - (skater.pivotLineDist - CIRCUMFERENCE_HALF_CIRCLE);
    let y = -MEASUREMENT_RADIUS - skater.v;

    s.x = x;
    s.y = y;
    return s;
  }

  // second half circle
  if (dist < 2 * CIRCUMFERENCE_HALF_CIRCLE + LINE_DIST) {

    let angle = (dist - (CIRCUMFERENCE_HALF_CIRCLE + LINE_DIST)) / MEASUREMENT_RADIUS;
    let direction = new Vector2(0, -MEASUREMENT_RADIUS - skater.v);

    direction.rotateAround(new Vector2(0, 0), -angle);
    let p = direction.add(C2);

    s.x = p.x;
    s.y = p.y;
    return s;
  }

  // straightaway y
  if (dist <= MEASUREMENT_LENGTH) {
    let x = C2.x + (skater.pivotLineDist - (2 * CIRCUMFERENCE_HALF_CIRCLE + LINE_DIST));
    let y = MEASUREMENT_RADIUS + skater.v;

    s.x = x;
    s.y = y;
    return s;
  }
}


/*
*
*         DRAWING PART
*
*/

/**
 * Generate the shape of the track having the start and end point
 * of the pack on the measurement line
 *
 * @param Number p1
 * @param Number p2
 * @returns PathData / Polyline?
 */
export const computePartialTrackShape = ({ p1, p2, trackIs2D=true, options3D={}}) => {
  // console.log('computePartialTrackShape');

  const defaultOptions3D = {
    curveSegments: 12
  }

  const _options3D = Object.assign({}, defaultOptions3D, options3D);

  let shape;
  
  if (trackIs2D) shape = '';
  else shape = new THREE.Shape();
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
    let startBeforeStartOfSection = start < drawLength;

    // console.log('draw loop')
    // console.log('newDrawLength: ', newDrawLength)
    // console.log('start before end of section ', startBeforeEndOfSection);
    // console.log('end before end of section ', endBeforeEndOfSection);
    
    // console.log('draw Outer Line')
    // console.log('with Start at: ', start - drawLength)
    // console.log('with Starting Line?: ', start >= drawLength && startBeforeEndOfSection)
    // console.log('with End at: ', endBeforeEndOfSection ? end - drawLength : false)
    // console.log('sectionLength: ', drawShapes[currentIdx].length)
    // console.log('drawOuterLine with start: ', start - drawLength)

    if (startBeforeEndOfSection) {
      let drawing = drawShapes[currentIdx].drawOuterLine({
        start: startBeforeStartOfSection ? 0 : start - drawLength,
        startNeedsDrawing: start >= drawLength && startBeforeEndOfSection,
        end: endBeforeEndOfSection ? end - drawLength : false,
        path3D: trackIs2D ? false : shape
      });
      if (trackIs2D) { shape += ' ' + drawing; }
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
      let drawing = drawShapes[currentIdx].drawInnerLine({
        start: startBeforeEndOfSection ? 0 : start - newDrawLength,
        end: endBeforeStartOfSection ? 0 : end - newDrawLength,
        path3D: trackIs2D ? false : shape
      });
      if (trackIs2D) { shape += ' ' + drawing; }
    }
    drawLength = newDrawLength;

    currentIdx = ((currentIdx - 1) + drawShapes.length) % drawShapes.length;
  }

  if (trackIs2D) {
    // shape closure
    shape += 'Z';
  } else {
    // bundle up the shape into a mesh
    let { curveSegments, ...materialOptions } = _options3D;
    let geometry = new THREE.ShapeGeometry( shape, curveSegments );
    let material = new THREE.MeshBasicMaterial(materialOptions);
    let mesh = new THREE.Mesh( geometry, material );
    shape = mesh;
  }

  return shape;
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

const angleSVGTo3DFirstHalfCircle = (angle) => {
  return angle * Math.PI / 180 - Math.PI / 2;
}
const angleSVGTo3DSecondCircle = (angle) => {
  // console.log(angle)
  return angle * Math.PI / 180 + Math.PI / 2;
}

const drawShapes = [
  {
    part: 'First Half Circle',
    length: CIRCUMFERENCE_HALF_CIRCLE,
    drawOuterLine({ start, startNeedsDrawing, end, path3D }) {
      let angle = start / MEASUREMENT_RADIUS;
      angle = -angle + Math.PI / 2;  // correct orientiation
      let data = '';

      if (startNeedsDrawing) {
        let [pInner, pOuter] = angleToLineFirstHalfCircle(angle);

        if (pOuter && pOuter.x > C1_OUTER.x) {
          if (path3D) {
            path3D.moveTo(pInner.x, -pInner.y)
              .lineTo(pOuter.x, -pOuter.y)
          } else {
            data = `M${pInner.x},${pInner.y}L${pOuter.x},${pOuter.y}`;
          }
        } else {
          console.log('didn\'t find an intersection');
        }
      }

      if (end) {
        let endAngle = ((end / MEASUREMENT_RADIUS)) * (180 / Math.PI);
        let startAngle = ((start / MEASUREMENT_RADIUS)) * (180 / Math.PI);
        let [pInner, pOuter] = angleToLineFirstHalfCircle(-(end / MEASUREMENT_RADIUS) + Math.PI / 2);

        if (path3D) {
          path3D.absarc(C1_OUTER.x, -C1_OUTER.y, RADIUS_OUTER, angleSVGTo3DFirstHalfCircle(startAngle), angleSVGTo3DFirstHalfCircle(endAngle), false);
        } else {
          data += ` A ${RADIUS_OUTER} ${RADIUS_OUTER} ${endAngle - startAngle} 0 0 ${pOuter.x},${pOuter.y}`;
        }

        // draw inward line
        if (path3D) {
          path3D.lineTo(pInner.x, -pInner.y);
        } else {
          data += ` L${pInner.x},${pInner.y}`;
        }
      } else {
        let endAngle = ((start / MEASUREMENT_RADIUS)) * (180 / Math.PI);
        // draw remaining arc
        if (path3D) {
          path3D.absarc(C1_OUTER.x, -C1_OUTER.y, RADIUS_OUTER, angleSVGTo3DFirstHalfCircle(endAngle), angleSVGTo3DFirstHalfCircle(180), false);
        } else {
          data += ` A ${RADIUS_OUTER} ${RADIUS_OUTER} ${180 - endAngle} 0 0 5.33,-8.385`;
        }
      }

      // console.log(data)

      return data;
    },
    drawInnerLine({ start, end, path3D }) {
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

      if (path3D) {
        path3D.absarc(C1.x, -C1.y, RADIUS_INNER, angleSVGTo3DFirstHalfCircle(startAngle), angleSVGTo3DFirstHalfCircle(endAngle), true);
      } else {
        data += ` A ${RADIUS_INNER} ${RADIUS_INNER} ${endAngle - startAngle} 0 1 ${pInner.x},${pInner.y}`;
      }

      // console.log(data);

      return data;
    },
  },
  {
    part: 'First Straightaway',
    length: LINE_DIST,
    drawOuterLine({ start, startNeedsDrawing, end, path3D }) {
      // console.log('drawOuterLine')
      let data = '';
      let xEnd = end ? end : LINE_DIST;
      let pEnd = new Vector2(C1_OUTER.x - xEnd, F_OUTER_TOP(C1_OUTER.x  - xEnd));

      if (startNeedsDrawing) {
        let pStart = new Vector2(C1_OUTER.x - start, F_OUTER_TOP(C1_OUTER.x - start));
        let pStartInner = new Vector2(C1.x - start, -RADIUS_INNER);
        
        if (path3D) {
          path3D.moveTo(pStartInner.x, -pStartInner.y)
            .lineTo(pStart.x, -pStart.y);
        } else {
          data = `M${pStartInner.x},${pStartInner.y}L${pStart.x},${pStart.y}`;
        }
      }

      if (path3D) {
        path3D.lineTo(pEnd.x, -pEnd.y);
      } else {
        data += ` L${pEnd.x},${pEnd.y}`;
      }

      if (end) {
        let pEndInner = new Vector2(C1_OUTER.x - xEnd, -RADIUS_INNER);
        if (path3D) {
          path3D.lineTo(pEndInner.x, -pEndInner.y)
        } else {
          data += ` L${pEndInner.x},${pEndInner.y}`;
        }
      }

      return data;
    },
    drawInnerLine({ start, end, path3D }) {
      // console.log('drawInnerLine First Straightaway')
      // console.log('start: ', start)
      // console.log('end: ', end)
      let pEnd = new Vector2(C1.x - end, -RADIUS_INNER);

      if (path3D) {
        path3D.lineTo(pEnd.x, -pEnd.y);
        return
      }
      return ` L${pEnd.x},${pEnd.y}`;
    },
  },
  {
    part: 'Second Half Circle',
    length: CIRCUMFERENCE_HALF_CIRCLE,
    drawOuterLine({ start, startNeedsDrawing, end, path3D }) {
      let angle = start / MEASUREMENT_RADIUS;
      angle = -angle + Math.PI / 2 + Math.PI;  // correct orientiation
      let data = '';

      if (startNeedsDrawing) {
        let [pInner, pOuter] = angleToLineSecondHalfCircle(angle);

        if (pOuter && pOuter.x < C2_OUTER.x) {
          if (path3D) {
            path3D.moveTo(pInner.x, -pInner.y)
              .lineTo(pOuter.x, -pOuter.y);
          } else {
            data = `M${pInner.x},${pInner.y}L${pOuter.x},${pOuter.y}`;
          }
        } else {
          console.log('didn\'t find an intersection');
        }
      }

      if (end) {
        let endAngle = ((end / MEASUREMENT_RADIUS)) * (180 / Math.PI);
        let startAngle = ((start / MEASUREMENT_RADIUS)) * (180 / Math.PI);
        let [pInner, pOuter] = angleToLineSecondHalfCircle(-(end / MEASUREMENT_RADIUS) + Math.PI / 2  + Math.PI);

        if (path3D) {
          path3D.absarc(C2_OUTER.x, -C2_OUTER.y, RADIUS_OUTER, angleSVGTo3DSecondCircle(startAngle), angleSVGTo3DSecondCircle(endAngle), false);
        } else {
          data += ` A ${RADIUS_OUTER} ${RADIUS_OUTER} ${endAngle - startAngle} 0 0 ${pOuter.x},${pOuter.y}`;
        }

        // draw inward line
        if (path3D) {
          path3D.lineTo(pInner.x, -pInner.y);
        } else {
          data += ` L${pInner.x},${pInner.y}`;
        }
      } else {
        let endAngle = ((start / MEASUREMENT_RADIUS)) * (180 / Math.PI);
        // draw remaining arc
        if (path3D) {
          path3D.absarc(C2_OUTER.x, -C2_OUTER.y, RADIUS_OUTER, angleSVGTo3DSecondCircle(endAngle), angleSVGTo3DSecondCircle(180), false);
        } else {
          data += ` A ${RADIUS_OUTER} ${RADIUS_OUTER} ${180 - endAngle} 0 0 -5.33,8.385`;
        }
      }

      // console.log(data)

      return data;
    },
    drawInnerLine({ start, end, path3D }) {
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

      if (path3D) {
        path3D.absarc(C2.x, -C2.y, RADIUS_INNER, angleSVGTo3DSecondCircle(startAngle), angleSVGTo3DSecondCircle(endAngle), true);
      } else {
        data += ` A ${RADIUS_INNER} ${RADIUS_INNER} ${endAngle - startAngle} 0 1 ${pInner.x},${pInner.y}`;
      }

      // console.log(data);

      return data;
    },
  },
  {
    part: 'Second Straightaway',
    length: LINE_DIST,
    drawOuterLine({ start, startNeedsDrawing, end, path3D }) {
      // console.log('drawOuterLine Second Straightaway')
      let data = '';
      let xEnd = end ? end : LINE_DIST;
      let pEnd = new Vector2(C2_OUTER.x + xEnd, F_OUTER_BOTTOM(C2_OUTER.x  + xEnd));

      if (startNeedsDrawing) {
        let pStart = new Vector2(C2_OUTER.x + start, F_OUTER_BOTTOM(C2_OUTER.x + start));
        let pStartInner = new Vector2(C2.x + start, RADIUS_INNER);

        if (path3D) {
          path3D.moveTo(pStartInner.x, -pStartInner.y)
            .lineTo(pStart.x, -pStart.y);
        } else {
          data = `M${pStartInner.x},${pStartInner.y}L${pStart.x},${pStart.y}`;
        }
      }

      if (path3D) {
        path3D.lineTo(pEnd.x, -pEnd.y);
      } else {
        data += ` L${pEnd.x},${pEnd.y}`;
      }

      // console.log('start: ', start);
      // console.log('end: ', end);
      if (end) {
        let pEndInner = new Vector2(C2_OUTER.x + xEnd, RADIUS_INNER);
        // console.log('pEndInner', pEndInner);

        if (path3D) {
          path3D.lineTo(pEndInner.x, -pEndInner.y);
        } else {
          data += ` L${pEndInner.x},${pEndInner.y}`;
        }
      }

      return data;
    },
    drawInnerLine({ start, end, path3D }) {
      // console.log('drawInnerLine Second Straightaway')
      // console.log('start: ', start)
      // console.log('end: ', end)
      let pEnd = new Vector2(C2.x + end, RADIUS_INNER);

      if (path3D) {
        return path3D.lineTo(pEnd.x, -pEnd.y);
      }
      return ` L${pEnd.x},${pEnd.y}`;
    },
  }
];