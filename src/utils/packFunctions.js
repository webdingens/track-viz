import _ from "lodash";
import * as THREE from "three";
const { Vector2 } = THREE;

export const C1 = new Vector2(5.33, 0);
export const C2 = new Vector2(-5.33, 0);
export const C1_OUTER = new Vector2(5.33, -0.305);
export const C2_OUTER = new Vector2(-5.33, 0.305);
export const RADIUS_INNER = 3.81;
export const RADIUS_OUTER = 8.08;
export const MEASUREMENT_RADIUS = 3.81 + 1.6;
export const CIRCUMFERENCE_HALF_CIRCLE = Math.PI * MEASUREMENT_RADIUS;
export const ENGAGEMENT_ZONE_DISTANCE_TO_PACK = 6.1;
export const SKATER_RADIUS = 0.3;

export const F_OUTER_TOP = (x) => {
  let m = -0.61 / 10.66;
  let c = -8.385 - m * 5.33;
  return x * m + c;
};
export const F_OUTER_BOTTOM = (x) => {
  let m = -0.61 / 10.66;
  let c = 8.385 + m * 5.33;
  return x * m + c;
};

export const LINE1 = {
  p1: new Vector2(5.33, -MEASUREMENT_RADIUS),
  p2: new Vector2(-5.33, -MEASUREMENT_RADIUS),
};
export const LINE2 = {
  p1: new Vector2(-5.33, MEASUREMENT_RADIUS),
  p2: new Vector2(5.33, MEASUREMENT_RADIUS),
};
export const LINE_DIST = LINE1.p1.distanceTo(LINE1.p2);

export const MEASUREMENT_LENGTH = 2 * CIRCUMFERENCE_HALF_CIRCLE + 2 * LINE_DIST;

export const PACK_MEASURING_METHODS = {
  SECTOR: "sector",
  RECTANGLE: "rectangle",
};

/**
 * Get Skaters with Derived Property inBounds
 * @param {object} skaters
 */
export const getSkatersWDPInBounds = (skaters) => {
  return skaters.map((skater) => {
    let pos = new Vector2(skater.x, skater.y); // blocker position
    let ret = _.cloneDeep(skater);

    // first half circle
    if (pos.x > C1.x) {
      // not inside the track nor outside
      if (
        C1.distanceTo(pos) < RADIUS_INNER + SKATER_RADIUS ||
        C1_OUTER.distanceTo(pos) > RADIUS_OUTER - SKATER_RADIUS
      ) {
        ret.inBounds = false;
        return ret;
      }
    }

    // straightaway -y
    if (pos.x <= C1.x && pos.x >= C2.x && pos.y <= 0) {
      // not inside the track nor outside
      if (
        pos.y > -RADIUS_INNER - SKATER_RADIUS ||
        F_OUTER_TOP(pos.x) + SKATER_RADIUS > pos.y
      ) {
        ret.inBounds = false;
        return ret;
      }
    }

    // second half circle
    if (pos.x < C2.x) {
      // not inside the track nor outside
      if (
        C2.distanceTo(pos) < RADIUS_INNER + SKATER_RADIUS ||
        C2_OUTER.distanceTo(pos) > RADIUS_OUTER - SKATER_RADIUS
      ) {
        ret.inBounds = false;
        return ret;
      }
    }

    // straightaway y
    if (pos.x <= C1.x && pos.x >= C2.x && pos.y > 0) {
      // not inside the track nor outside
      if (
        pos.y < RADIUS_INNER + SKATER_RADIUS ||
        F_OUTER_BOTTOM(pos.x) - SKATER_RADIUS < pos.y
      ) {
        ret.inBounds = false;
        return ret;
      }
    }

    ret.inBounds = true;
    return ret;
  });
};

/**
 * Get Skaters with Derived Property pivotLineDistance
 * @param {object} skaters
 */
export const getSkatersWDPPivotLineDistance = (skaters) => {
  return _.cloneDeep(skaters).map((skater) => {
    let dist = 0; // distance to pivot line (+y)
    let pos = new Vector2(skater.x, skater.y); // blocker position

    // first half circle
    if (pos.x > C1.x) {
      // compute angle of skater to C1
      let p = pos.clone().sub(C1);
      let angle = p.angle();
      angle = -angle + Math.PI / 2; // correct orientation
      angle = (angle + 2 * Math.PI) % (2 * Math.PI); // make positive

      dist += angle * MEASUREMENT_RADIUS;

      skater.pivotLineDist = dist;
      return skater;
    } else {
      // add circumference of half circle past the pivot line
      dist += CIRCUMFERENCE_HALF_CIRCLE;
    }

    // straightaway -y
    if (pos.x <= C1.x && pos.x >= C2.x && pos.y <= 0) {
      dist += C1.x - pos.x;

      skater.pivotLineDist = dist;
      return skater;
    } else {
      dist += LINE_DIST;
    }

    // second half circle
    if (pos.x < C2.x) {
      // compute angle of skater to C1
      let p = pos.clone().sub(C2);
      let angle = p.angle();
      angle = -angle - Math.PI / 2; // correct orientation
      angle = (angle + 2 * Math.PI) % (2 * Math.PI); // make positive

      dist += angle * MEASUREMENT_RADIUS;

      skater.pivotLineDist = dist;
      return skater;
    } else {
      // add circumference of half circle past the pivot line
      dist += CIRCUMFERENCE_HALF_CIRCLE;
    }

    // straightaway y
    if (pos.x <= C1.x && pos.x >= C2.x && pos.y > 0) {
      dist += pos.x - C2.x;
    }

    skater.pivotLineDist = dist;
    return skater;
  });
};

/*
 * Computes the groups of skaters with a maximum distance of 3.05m
 */
const groupBlockers = (
  blockers,
  { method = PACK_MEASURING_METHODS.SECTOR } = {}
) => {
  let ret = [];
  let skaters = _.cloneDeep(blockers);
  let closeSkaters = [];
  for (let i = 0; i < skaters.length - 1; i++) {
    for (let j = i + 1; j < skaters.length; j++) {
      let dist = getDistanceOfTwoSkaters(skaters[j], skaters[i], {
        method,
      });

      // Inf values in case of rectangle method are filtered out here
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

    while (checkedIdx < newGroup.length - 1) {
      // console.log('inner while loop');
      // console.log(_.cloneDeep(newGroup));
      // console.log(checkedIdx)

      let checking = newGroup[checkedIdx + 1];

      for (let i = 0; i < toGroup.length; i++) {
        let t = toGroup[i];
        if (t[0] === checking || t[1] === checking) {
          let idxNew = t[0] === checking ? t[1] : t[0];
          // console.log('idxNew: ', idxNew);
          if (newGroup.indexOf(idxNew) !== -1) continue;
          // console.log('pushing idxNew: ', idxNew);
          newGroup.push(idxNew);
        }
      }
      checkedIdx++;
    }
    // console.log('endwhile');
    // console.log(_.cloneDeep(newGroup));
    toGroup = toGroup.filter((el) => {
      return newGroup.indexOf(el[0]) === -1 && newGroup.indexOf(el[1]) === -1;
    });
    // console.log(_.cloneDeep(toGroup));
    ret.push(newGroup.map((skaterIdx) => skaters[skaterIdx]));
  }

  return ret;
};

/*
 * Given grouped skaters find a singular largest group, return null if multiple or none found
 */
const getLargestGroup = (groups = []) => {
  let ret = null;
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

  // check if there is a singular largest group, else not a pack
  let notAUniqueLargestGroup = largestGroups.length !== 1;

  return notAUniqueLargestGroup ? null : ret;
};

/*
 *   Compute the distance between two skaters
 */
const getDistanceOfTwoSkaters = (
  skaterA,
  skaterB,
  { method = PACK_MEASURING_METHODS.SECTOR } = {}
) => {
  if (method === PACK_MEASURING_METHODS.SECTOR)
    return getDistanceOfTwoSkatersSector(skaterA, skaterB);
  if (method === PACK_MEASURING_METHODS.RECTANGLE)
    return getDistanceOfTwoSkatersRectangle(skaterA, skaterB);
};
const getDistanceOfTwoSkatersSector = (skaterA, skaterB) => {
  let distances = [skaterA.pivotLineDist, skaterB.pivotLineDist];
  distances.sort((a, b) => a - b);

  // Minimize distance going counter- and clockwise
  let dist = Math.min(
    distances[1] - distances[0],
    distances[0] - (distances[1] - MEASUREMENT_LENGTH)
  );

  return dist;
};
const getDistanceOfTwoSkatersRectangle = (skaterA, skaterB) => {
  const P1 = {
    x: skaterA.x,
    y: skaterA.y,
  };
  const P2 = {
    x: skaterB.x,
    y: skaterB.y,
  };

  /*
   *   First Curve
   */

  // Circle Right to P1 vec
  const C1P1 = {
    x: P1.x - C1.x,
    y: P1.y - C1.y,
  };
  // Circle Right to P2 vec
  const C1P2 = {
    x: P2.x - C1.x,
    y: P2.y - C1.y,
  };

  let alphaC1 = Math.atan2(C1P1.y + C1P2.y, C1P1.x + C1P2.x);

  while (alphaC1 < 0) {
    alphaC1 = alphaC1 + 2 * Math.PI;
  }

  if (alphaC1 >= (3 / 2) * Math.PI || alphaC1 <= (1 / 2) * Math.PI) {
    return (
      2 * Math.abs(Math.cos(alphaC1) * C1P1.y - Math.sin(alphaC1) * C1P1.x)
    );
  }

  /*
   *   Second Curve
   */

  // Circle Left to P1 vec
  const C2P1 = {
    x: P1.x - C2.x,
    y: P1.y - C2.y,
  };
  // Circle Left to P2 vec
  const C2P2 = {
    x: P2.x - C2.x,
    y: P2.y - C2.y,
  };

  let alphaC2 = Math.atan2(C2P1.y + C2P2.y, C2P1.x + C2P2.x);

  while (alphaC2 < 0) {
    alphaC2 = alphaC2 + 2 * Math.PI;
  }

  if (alphaC2 >= (1 / 2) * Math.PI && alphaC2 <= (3 / 2) * Math.PI) {
    return (
      2 * Math.abs(Math.cos(alphaC2) * C2P1.y - Math.sin(alphaC2) * C2P1.x)
    );
  }

  /*
   *   Straightaways
   */
  const PMid = {
    x: 0.5 * (P1.x + P2.x),
    y: 0.5 * (P1.y + P2.y),
  };

  if (PMid.x < C1.x && PMid.x > C2.x) {
    if (P1.y * P2.y < 0) {
      return Infinity;
    } else {
      return Math.abs(P1.x - P2.x);
    }
  }
};

const filterOutGroupsWithOnlyOneTeam = (groupedBlockers) => {
  return groupedBlockers.filter((group) => {
    let teamA = group.filter((g) => g.team === "A");
    let teamB = group.filter((g) => g.team === "B");
    return teamA.length && teamB.length;
  });
};

/*
 *   Get Skaters that form the pack
 *   Requires array of skaters with properties inBounds and pivotLineDistanceComputed
 */
export const getPack = (
  skaters,
  { method = PACK_MEASURING_METHODS.SECTOR } = {}
) => {
  let blockers = skaters.filter((skater) => !skater.isJammer);
  // only in bounds blockers
  let possiblePack = blockers.filter((blocker) => blocker.inBounds);
  possiblePack = groupBlockers(possiblePack, { method });
  // console.dir(possiblePack)
  possiblePack = filterOutGroupsWithOnlyOneTeam(possiblePack);
  // console.dir(possiblePack)
  let pack = getLargestGroup(possiblePack);

  if (!pack) return [];
  return pack;
};

/*
 *   Find outermost skaters
 */
export const getOutermostSkaters = (pack) => {
  if (pack.length <= 2) return pack;
  let blockers = _.cloneDeep(pack);

  let blockerA = blockers[0];
  let blockerB;
  let distMax = -1;
  let newDist = 0;

  let computeNewDistance = () => {
    // dist blockerA to all
    blockers.forEach((blocker) => {
      if (blocker === blockerA) return;

      let dist = getDistanceOfTwoSkaters(blocker, blockerA); // relative position uses default sector method
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
  };

  while (newDist > distMax) {
    distMax = newDist;
    newDist = -1;
    newDist = computeNewDistance();
  }

  return [blockerA, blockerB].filter(Boolean);
};

export const getSortedOutermostSkaters = (pack) => {
  const outermostSkaters = getOutermostSkaters(pack);
  if (outermostSkaters.length < 2) return false;

  let distances = [outermostSkaters[0], outermostSkaters[1]];
  distances.sort((a, b) => a.pivotLineDist - b.pivotLineDist);

  // set starting point of pack marking
  if (
    distances[1].pivotLineDist - distances[0].pivotLineDist >=
    distances[0].pivotLineDist -
      (distances[1].pivotLineDist - MEASUREMENT_LENGTH)
  ) {
    return [distances[1], distances[0]]; // switch
  }
  // return switched for smaller arc
  return [distances[0], distances[1]];
};

const getSortedClosestPointsOnLine = (furthestSkaters = []) => {
  if (furthestSkaters.length < 2) return;

  let distToPivotLine1 = furthestSkaters[0].pivotLineDist;
  let distToPivotLine2 = furthestSkaters[1].pivotLineDist;
  let distances = [distToPivotLine1, distToPivotLine2];
  distances.sort((a, b) => a - b);

  // set starting point of pack marking
  if (
    distances[1] - distances[0] >=
    distances[0] - (distances[1] - MEASUREMENT_LENGTH)
  ) {
    return [distances[1] - MEASUREMENT_LENGTH, distances[0]]; // switch
  }
  // return switched for smaller arc
  return [distances[0], distances[1]];
};

/*
 *   Find the range of the pack based on the points on the measurement line
 *   (used by sector measuring method)
 */
export const getSortedPackBoundaries = (pack) => {
  if (pack.length < 2) return false;

  let outermostSkaters = getOutermostSkaters(pack);
  return getSortedClosestPointsOnLine(outermostSkaters);
};

// TODO: add method
const isSkaterInZoneBounds = (skater, packBoundaries) => {
  let p = skater.pivotLineDist;
  let ret = false;
  if (
    (p >= packBoundaries[0] && p <= packBoundaries[1]) ||
    (p < packBoundaries[0] && p + MEASUREMENT_LENGTH <= packBoundaries[1]) ||
    (p > packBoundaries[1] && p - MEASUREMENT_LENGTH >= packBoundaries[0])
  ) {
    ret = true;
  }
  return ret;
};

export const getSkatersWDPInPlayPackSkater = (
  skaters,
  { method = PACK_MEASURING_METHODS.SECTOR } = {}
) => {
  return skaters.map((skater) => {
    let ret = _.cloneDeep(skater);

    // TODO: switch packboundaries based on method

    const pack = getPack(skaters, { method });
    const packBoundaries = getSortedPackBoundaries(pack);

    if (skater.isJammer) {
      ret.inPlay = skater.inBounds;
    } else {
      ret.inPlay =
        skater.inBounds &&
        packBoundaries &&
        isSkaterInZoneBounds(skater, [
          packBoundaries[0] - ENGAGEMENT_ZONE_DISTANCE_TO_PACK,
          packBoundaries[1] + ENGAGEMENT_ZONE_DISTANCE_TO_PACK,
        ]);

      ret.packSkater =
        skater.inBounds &&
        packBoundaries &&
        !!pack.find((entry) => entry.id === skater.id);
    }
    return ret;
  });
};

/*
 *   Get offset from measurement line (sector)
 *   so we can compute a position during an animation
 *   with x being the point on the measuring line, and y the offset from
 *   the measuring line, y axis orthogonal to the measuring line in the
 *   point x
 */
export const getRelativeVPosition = (skater) => {
  let pos = new Vector2(skater.x, skater.y); // blocker position

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
};

/*
 *   Update the x and y coordinates of skater from the pivotLineDist
 *   and v value (pivotLineDist is animated)
 */
export const setPositionFromVAndDist = (skater) => {
  let s = _.cloneDeep(skater);
  let dist = skater.pivotLineDist;
  if (dist < 0) {
    dist += Math.ceil(-dist / MEASUREMENT_LENGTH) * MEASUREMENT_LENGTH;
  }
  dist = dist % MEASUREMENT_LENGTH;

  if (dist < 0) console.log("Dist smaller 0: ", dist);
  if (dist > MEASUREMENT_LENGTH) console.log("Dist too large: ", dist);

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
    let x = C1.x - (dist - CIRCUMFERENCE_HALF_CIRCLE);
    let y = -MEASUREMENT_RADIUS - skater.v;

    s.x = x;
    s.y = y;
    return s;
  }

  // second half circle
  if (dist < 2 * CIRCUMFERENCE_HALF_CIRCLE + LINE_DIST) {
    let angle =
      (dist - (CIRCUMFERENCE_HALF_CIRCLE + LINE_DIST)) / MEASUREMENT_RADIUS;
    let direction = new Vector2(0, -MEASUREMENT_RADIUS - skater.v);

    direction.rotateAround(new Vector2(0, 0), -angle);
    let p = direction.add(C2);

    s.x = p.x;
    s.y = p.y;
    return s;
  }

  // straightaway y
  if (dist <= MEASUREMENT_LENGTH) {
    let x = C2.x + (dist - (2 * CIRCUMFERENCE_HALF_CIRCLE + LINE_DIST));
    let y = MEASUREMENT_RADIUS + skater.v;

    s.x = x;
    s.y = y;
    return s;
  }
};

/**
 * Computes a new distTo that is closest distFrom,
 * not mapped into the range of [0, MEASUREMENT_LENGTH]
 * @param {number} distFrom
 * @param {number} distTo
 */
export const getClosestNextPivotLineDist = (distFrom, distTo) => {
  return getClosestNextCircularValue(distFrom, distTo, MEASUREMENT_LENGTH);
};

export const getClosestNextAngle = (angleFrom, angleTo) => {
  return getClosestNextCircularValue(angleFrom, angleTo, 360);
};

/*
 *   Compute the closest circular value in case of reaching the
 *   end of the period
 *   e.g. 355 to 5 should result in 365, with a limit
 *   of 360
 *   (used in animation, to prevent erratic backwards skating
 *   around the range boundaries)
 */
const getClosestNextCircularValue = (valFrom, valTo, limit) => {
  let d1 = valFrom;
  // bring distFrom in between [0, limit]
  if (d1 < 0) {
    d1 += Math.ceil(-d1 / limit) * limit;
  }
  d1 = d1 % limit;

  let d2 = valTo;
  // bring distFrom in between [0, limit]
  if (d2 < 0) {
    d2 += Math.ceil(-d2 / limit) * limit;
  }
  d2 = d2 % limit;

  // based off getSortedClosestPointsOnLine
  // but computes the vector between both points and adds that to distFrom
  if (d1 < d2) {
    if (d2 - d1 >= d1 - (d2 - limit)) {
      return valFrom + (d2 - limit - d1);
    }
    // return switched for smaller arc
    return valFrom + (d2 - d1);
  } else {
    if (d1 - d2 >= d2 - (d1 - limit)) {
      return valFrom + (d2 + limit - d1); // switch
    }
    return valFrom + (d2 - d1);
  }
};

/*
 *   Get the engagement zone by the 2x2 intersections with the inside and
 *   outside line. (rectangle measurement)
 */
const getEngagementZoneRectangle = (skater, { front = true } = {}) => {
  if (!skater) return false;
  const P1 = new Vector2(skater.x, skater.y);

  /*
   *   First Curve
   */

  // Circle Right to P1 vec
  const C1P1 = {
    x: P1.x - C1.x,
    y: P1.y - C1.y,
  };

  let alphaC1 = Math.asin(
    (0.5 * ENGAGEMENT_ZONE_DISTANCE_TO_PACK) /
      Math.sqrt(C1P1.x * C1P1.x + C1P1.y * C1P1.y)
  );
  while (alphaC1 < 0) {
    alphaC1 = alphaC1 + 2 * Math.PI;
  }

  let alphaSkater = Math.atan2(C1P1.y, C1P1.x);
  while (alphaSkater < 0) {
    alphaSkater = alphaSkater + 2 * Math.PI;
  }

  let alphaC1Middle;
  if (front) {
    alphaC1Middle = alphaSkater - alphaC1;
    while (alphaC1Middle < 0) {
      alphaC1Middle = alphaC1Middle + 2 * Math.PI;
    }
  } else {
    alphaC1Middle = (alphaSkater + alphaC1) % (Math.PI * 2);
  }

  if (
    alphaC1Middle >= (3 / 2) * Math.PI ||
    alphaC1Middle <= (1 / 2) * Math.PI
  ) {
    // console.log("intersection in first curve");
    /*
     *   First compute the point that has the distance of ENGAGEMENT_ZONE_DISTANCE_TO_PACK
     *   then we use that point to create a line and intersect the line with the inner and outer track boundary
     */
    const distanceToMiddlePoint = Math.sqrt(
      C1P1.x * C1P1.x +
        C1P1.y * C1P1.y +
        Math.pow(0.5 * ENGAGEMENT_ZONE_DISTANCE_TO_PACK, 2)
    );

    const direction = new Vector2(
      Math.cos(alphaC1Middle),
      Math.sin(alphaC1Middle)
    );
    const PMiddle = {
      x: C1.x + distanceToMiddlePoint * direction.x,
      y: C1.y + distanceToMiddlePoint * direction.y,
    };
    const POnParallelLine = new Vector2(
      // Parallel to the middle line between the two points, orthogonal to the inside line (same as with distance computation)
      P1.x + 2 * (PMiddle.x - P1.x),
      P1.y + 2 * (PMiddle.y - P1.y)
    );

    /*
     *   Intersect with half circles and adjacent straight aways
     */

    let intersectionsHalfCircle = intersectLineRightHalfCircle(
      POnParallelLine,
      direction
    );

    // console.log("front: ", front);
    // console.log("P1: ", P1);
    // console.log("PMiddle: ", PMiddle);
    // console.log("PONPARALLEL: ", POnParallelLine);

    // console.log("intersect with straightaways");
    let intersectionsStraightAways = front
      ? intersectLineStraightAwaysTop(POnParallelLine, direction)
      : intersectLineStraightAwaysBottom(POnParallelLine, direction);

    // console.dir({
    //   intersectionsHalfCircle,
    //   intersectionsStraightAways,
    // });

    const intersections = {
      outside: intersectionsHalfCircle.outside
        ? intersectionsHalfCircle.outside
        : front
        ? intersectionsStraightAways.top
        : intersectionsStraightAways.bottom,
      inside: intersectionsHalfCircle.inside
        ? intersectionsHalfCircle.inside
        : front
        ? intersectionsStraightAways.bottom
        : intersectionsStraightAways.top,
    };

    return intersections;
  }

  // /*
  //  *   Second Curve
  //  */

  // Circle Left to P1 vec
  const C2P1 = {
    x: P1.x - C2.x,
    y: P1.y - C2.y,
  };

  let alphaC2 = Math.asin(
    (0.5 * ENGAGEMENT_ZONE_DISTANCE_TO_PACK) /
      Math.sqrt(C2P1.x * C2P1.x + C2P1.y * C2P1.y)
  );
  while (alphaC2 < 0) {
    alphaC2 = alphaC2 + 2 * Math.PI;
  }

  alphaSkater = Math.atan2(C2P1.y, C2P1.x);
  while (alphaSkater < 0) {
    alphaSkater = alphaSkater + 2 * Math.PI;
  }

  let alphaC2Middle;
  if (front) {
    alphaC2Middle = alphaSkater - alphaC2;
    while (alphaC2Middle < 0) {
      alphaC2Middle = alphaC2Middle + 2 * Math.PI;
    }
  } else {
    alphaC2Middle = (alphaSkater + alphaC2) % (Math.PI * 2);
  }

  if (
    alphaC2Middle >= (1 / 2) * Math.PI &&
    alphaC2Middle <= (3 / 2) * Math.PI
  ) {
    /*
     *   First compute the point that has the distance of ENGAGEMENT_ZONE_DISTANCE_TO_PACK
     *   then we use that point to create a line and intersect the line with the inner and outer track boundary
     */
    const distanceToMiddlePoint = Math.sqrt(
      C2P1.x * C2P1.x +
        C2P1.y * C2P1.y -
        Math.pow(0.5 * ENGAGEMENT_ZONE_DISTANCE_TO_PACK, 2)
    );
    const direction = new Vector2(
      Math.cos(alphaC2Middle),
      Math.sin(alphaC2Middle)
    );
    const PMiddle = {
      x: C2.x + distanceToMiddlePoint * direction.x,
      y: C2.y + distanceToMiddlePoint * direction.y,
    };
    const POnParallelLine = new Vector2(
      // Parallel to the middle line between the two points, orthogonal to the inside line (same as with distance computation)
      P1.x + 2 * (PMiddle.x - P1.x),
      P1.y + 2 * (PMiddle.y - P1.y)
    );

    /*
     *   Intersect with half circles and adjacent straight aways
     */

    let intersectionsLeftHalfCircle = intersectLineLeftHalfCircle(
      POnParallelLine,
      direction
    );

    let intersectionsStraightAways = front
      ? intersectLineStraightAwaysBottom(POnParallelLine, direction)
      : intersectLineStraightAwaysTop(POnParallelLine, direction);

    const intersections = {
      outside: intersectionsLeftHalfCircle.outside
        ? intersectionsLeftHalfCircle.outside
        : front
        ? intersectionsStraightAways.bottom
        : intersectionsStraightAways.top,
      inside: intersectionsLeftHalfCircle.inside
        ? intersectionsLeftHalfCircle.inside
        : front
        ? intersectionsStraightAways.top
        : intersectionsStraightAways.bottom,
    };

    return intersections;
  }

  // /*
  //  *   Straightaways
  //  */
  const PMid = new Vector2(
    P1.x +
      ((front && P1.y >= 0) || (!front && P1.y < 0) ? 1 : -1) *
        0.5 *
        ENGAGEMENT_ZONE_DISTANCE_TO_PACK,
    P1.y
  );

  if (PMid.x < C1.x && PMid.x > C2.x) {
    const POnParallelLine = P1.clone().add(
      PMid.clone().sub(P1).multiplyScalar(2)
    );
    const direction = new Vector2(0, 1);
    if (POnParallelLine.y >= 0) {
      let intersectionsHalfCircle = front
        ? intersectLineRightHalfCircle(POnParallelLine, direction)
        : intersectLineLeftHalfCircle(POnParallelLine, direction);

      let intersectionsStraightAway = intersectLineStraightAwaysBottom(
        POnParallelLine,
        direction
      );

      const intersections = {
        outside: intersectionsStraightAway.bottom
          ? intersectionsStraightAway.bottom
          : intersectionsHalfCircle.outside,
        inside: intersectionsStraightAway.top
          ? intersectionsStraightAway.top
          : intersectionsHalfCircle.inside,
      };

      return intersections;
    } else {
      let intersectionsHalfCircle = front
        ? intersectLineLeftHalfCircle(POnParallelLine, direction)
        : intersectLineRightHalfCircle(POnParallelLine, direction);

      let intersectionsStraightAway = intersectLineStraightAwaysTop(
        POnParallelLine,
        direction
      );

      const intersections = {
        outside: intersectionsStraightAway.top
          ? intersectionsStraightAway.top
          : intersectionsHalfCircle.outside,
        inside: intersectionsStraightAway.bottom
          ? intersectionsStraightAway.bottom
          : intersectionsHalfCircle.inside,
      };

      return intersections;
    }
  }
  console.error("Should have intersected, but didn't");
  return [];
};

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
export const computePartialTrackShape = (options) => {
  if (options.method === PACK_MEASURING_METHODS.RECTANGLE) {
    return computePartialTrackShapeRectangle(options);
  } else {
    return computePartialTrackShapeSector(options);
  }
};
export const computePartialTrackShapeSector = ({
  p1,
  p2,
  trackIs2D = true,
  options3D = {},
}) => {
  // console.log('computePartialTrackShape');

  const defaultOptions3D = {
    curveSegments: 12,
  };

  const _options3D = Object.assign({}, defaultOptions3D, options3D);

  let shape;

  if (trackIs2D) shape = "";
  else shape = new THREE.Shape();
  // console.log('p1: ', p1);
  // console.log('p2: ', p2);

  let start = p1;
  let end = p2;
  while (start < 0 || end < 0) {
    start += MEASUREMENT_LENGTH;
    end += MEASUREMENT_LENGTH;
  }

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
        path3D: trackIs2D ? false : shape,
      });
      if (trackIs2D) {
        shape += " " + drawing;
      }
    }
    drawLength = newDrawLength;

    if (endBeforeEndOfSection) break;
    currentIdx = (currentIdx + 1) % drawShapes.length; // not increment
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
        path3D: trackIs2D ? false : shape,
      });
      if (trackIs2D) {
        shape += " " + drawing;
      }
    }
    drawLength = newDrawLength;

    currentIdx = (currentIdx - 1 + drawShapes.length) % drawShapes.length;
  }

  if (trackIs2D) {
    // shape closure
    shape += "Z";
  } else {
    // bundle up the shape into a mesh
    let { curveSegments, ...materialOptions } = _options3D;
    let geometry = new THREE.ShapeGeometry(shape, curveSegments);
    let material = new THREE.MeshBasicMaterial(materialOptions);
    let mesh = new THREE.Mesh(geometry, material);
    shape = mesh;
  }

  return shape;
};

/*
 *   Compute the partial track shape for the engagement zone
 */
export const computePartialTrackShapeRectangle = ({
  p1,
  p2,
  trackIs2D = true,
  options3D = {},
}) => {
  // console.log("computePartialTrackShape");

  const defaultOptions3D = {
    curveSegments: 12,
  };

  const _options3D = Object.assign({}, defaultOptions3D, options3D);

  let shape;

  if (trackIs2D) shape = "";
  else shape = new THREE.Shape();
  // console.log('p1: ', p1);
  // console.log('p2: ', p2);

  /*
   *   Setup start and end for outside lines
   *   (Intersect with outside then )
   */
  let start = p1.pivotLineDist;
  let end = p2.pivotLineDist;

  // p2 is front, lower pivot Line Dist
  const engagementZoneFront = getEngagementZoneRectangle(p2, {
    front: true,
  });
  const engagementZoneBack = getEngagementZoneRectangle(p1, {
    front: false,
  });

  // console.dir({
  //   engagementZoneFront,
  //   engagementZoneBack,
  // });

  // console.log("start: ", start);
  // console.log("end: ", end);

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
        startingPoints: engagementZoneFront,
        endingPoints: engagementZoneBack,
        end: endBeforeEndOfSection ? end - drawLength : false,
        path3D: trackIs2D ? false : shape,
      });
      if (trackIs2D) {
        shape += " " + drawing;
      }
    }
    drawLength = newDrawLength;

    if (endBeforeEndOfSection) break;
    currentIdx = (currentIdx + 1) % drawShapes.length; // not increment
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
        startingPoints: engagementZoneFront,
        endingPoints: engagementZoneBack,
        path3D: trackIs2D ? false : shape,
      });
      if (trackIs2D) {
        shape += " " + drawing;
      }
    }
    drawLength = newDrawLength;

    currentIdx = (currentIdx - 1 + drawShapes.length) % drawShapes.length;
  }

  if (trackIs2D) {
    // shape closure
    shape += "Z";
  } else {
    // bundle up the shape into a mesh
    let { curveSegments, ...materialOptions } = _options3D;
    let geometry = new THREE.ShapeGeometry(shape, curveSegments);
    let material = new THREE.MeshBasicMaterial(materialOptions);
    let mesh = new THREE.Mesh(geometry, material);
    shape = mesh;
  }

  return shape;
};

const getIntersectionsWithCircle = (
  origin,
  direction,
  circleCenter,
  radius
) => {
  const intersections = [];
  /*
   *   CIRCLE LINE INTERSECTION
   *   https://mathworld.wolfram.com/Circle-LineIntersection.html
   */
  let p1 = origin.clone().add(direction).sub(circleCenter);
  let p2 = origin.clone().sub(circleCenter);
  let d = p2.clone().sub(p1);
  let dr = d.length();
  let D = p1.x * p2.y - p2.x * p1.y;

  let determinant = radius * radius * dr * dr - D * D;

  if (determinant > 0) {
    let x1 =
      (D * d.y + Math.sign(d.y) * d.x * Math.sqrt(determinant)) / (dr * dr);
    let x2 =
      (D * d.y - Math.sign(d.y) * d.x * Math.sqrt(determinant)) / (dr * dr);

    let y1 = (-D * d.x + Math.abs(d.y) * Math.sqrt(determinant)) / (dr * dr);
    let y2 = (-D * d.x - Math.abs(d.y) * Math.sqrt(determinant)) / (dr * dr);

    intersections.push(new Vector2(x1, y1).add(circleCenter));
    intersections.push(new Vector2(x2, y2).add(circleCenter));
  } else if (determinant === 0) {
    let x = (D * d.y) / (dr * dr);
    let y = (-D * d.x) / (dr * dr);

    intersections.push(new Vector2(x, y).add(circleCenter));
  }

  return intersections;
};

/**
 * Get the inside and outside intersection of right half circle
 */
const intersectLineRightHalfCircle = (origin, direction) => {
  const intersectionsOuter = getIntersectionsWithCircle(
    origin,
    direction,
    C1_OUTER,
    RADIUS_OUTER
  )
    .filter((entry) => entry.x >= C1.x)
    .reduce((prev, curr) => {
      // check if curr is closer to origin
      if (
        !prev ||
        curr.clone().sub(origin).length < prev.clone().sub(origin).length
      ) {
        return curr;
      }
      return prev;
    }, null);

  const intersectionsInner = getIntersectionsWithCircle(
    origin,
    direction,
    C1,
    RADIUS_INNER
  )
    .filter((entry) => entry.x >= C1.x)
    .reduce((prev, curr) => {
      // check if curr is closer to origin
      if (
        !prev ||
        curr.clone().sub(origin).length < prev.clone().sub(origin).length
      ) {
        return curr;
      }
      return prev;
    }, null);

  return {
    inside: intersectionsInner,
    outside: intersectionsOuter,
  };
};

/**
 * Get the inside and outside intersection of left half circle
 */
const intersectLineLeftHalfCircle = (origin, direction) => {
  const intersectionsOuter = getIntersectionsWithCircle(
    origin,
    direction,
    C2_OUTER,
    RADIUS_OUTER
  )
    .filter((entry) => entry.x <= C2.x)
    .reduce((prev, curr) => {
      // check if curr is closer to origin
      if (
        !prev ||
        curr.clone().sub(origin).length < prev.clone().sub(origin).length
      ) {
        return curr;
      }
      return prev;
    }, null);

  const intersectionsInner = getIntersectionsWithCircle(
    origin,
    direction,
    C2,
    RADIUS_INNER
  )
    .filter((entry) => entry.x <= C2.x)
    .reduce((prev, curr) => {
      // check if curr is closer to origin
      if (
        !prev ||
        curr.clone().sub(origin).length < prev.clone().sub(origin).length
      ) {
        return curr;
      }
      return prev;
    }, null);

  return {
    inside: intersectionsInner,
    outside: intersectionsOuter,
  };
};

const intersectLines = (line1origin, line1dir, line2origin, line2dir) => {
  const P1 = line1origin;
  const P2 = line1origin.clone().add(line1dir);
  const P3 = line2origin;
  const P4 = line2origin.clone().add(line2dir);
  const x =
    ((P1.x * P2.y - P1.y * P2.x) * (P3.x - P4.x) -
      (P1.x - P2.x) * (P3.x * P4.y - P3.y * P4.x)) /
    ((P1.x - P2.x) * (P3.y - P4.y) - (P1.y - P2.y) * (P3.x - P4.x));
  const y =
    ((P1.x * P2.y - P1.y * P2.x) * (P3.y - P4.y) -
      (P1.y - P2.y) * (P3.x * P4.y - P3.y * P4.x)) /
    ((P1.x - P2.x) * (P3.y - P4.y) - (P1.y - P2.y) * (P3.x - P4.x));

  const intersection = new Vector2(x, y);
  return intersection;
};

const intersectLineStraightAwaysTop = (origin, direction) => {
  const yOuterTopC1 = F_OUTER_TOP(C1.x);
  const yOuterTopC2 = F_OUTER_TOP(C2.x);
  const intersectionTop = intersectLines(
    origin,
    direction,
    new Vector2(C1.x, yOuterTopC1),
    new Vector2(C2.x - C1.x, yOuterTopC2 - yOuterTopC1)
  );

  const intersectionBottom = intersectLines(
    origin,
    direction,
    LINE1.p1,
    LINE1.p2.clone().sub(LINE1.p1)
  );

  console.dir({
    intersectionTop,
    intersectionBottom,
  });

  return {
    top:
      intersectionTop.x < C1.x && intersectionTop.x > C2.x
        ? intersectionTop
        : null,
    bottom:
      intersectionBottom.x < C1.x && intersectionBottom.x > C2.x
        ? intersectionBottom
        : null,
  };
};

const intersectLineStraightAwaysBottom = (origin, direction) => {
  const yOuterBottomC1 = F_OUTER_BOTTOM(C1.x);
  const yOuterBottomC2 = F_OUTER_BOTTOM(C2.x);
  const intersectionTop = intersectLines(
    origin,
    direction,
    LINE2.p1,
    LINE2.p2.clone().sub(LINE2.p1)
  );

  const intersectionBottom = intersectLines(
    origin,
    direction,
    new Vector2(C1.x, yOuterBottomC1),
    new Vector2(C2.x - C1.x, yOuterBottomC2 - yOuterBottomC2)
  );

  return {
    top:
      intersectionTop.x < C1.x && intersectionTop.x > C2.x
        ? intersectionTop
        : null,
    bottom:
      intersectionBottom.x < C1.x && intersectionBottom.x > C2.x
        ? intersectionBottom
        : null,
  };
};

const intersectLinesUsingPivotDistance = (pivotDistances) => {
  return pivotDistances.map((pivotDistance) => {
    let distance = pivotDistance % MEASUREMENT_LENGTH;
    while (distance < 0) {
      distance += MEASUREMENT_LENGTH;
    }

    if (distance < CIRCUMFERENCE_HALF_CIRCLE) {
      // first half circle

      let angle = pivotDistance / MEASUREMENT_RADIUS;
      angle = -angle + Math.PI / 2; // correct orientiation
      const [inside, outside] = angleToLineFirstHalfCircle(angle);
      return {
        inside,
        outside,
      };
    }

    if (distance < CIRCUMFERENCE_HALF_CIRCLE + LINE_DIST) {
      // first straightaway
      distance -= CIRCUMFERENCE_HALF_CIRCLE;
      let outside = new Vector2(
        C1_OUTER.x - distance,
        F_OUTER_TOP(C1_OUTER.x - distance)
      );
      let inside = new Vector2(C1.x - distance, -RADIUS_INNER);
      return {
        inside,
        outside,
      };
    }

    if (distance < 2 * CIRCUMFERENCE_HALF_CIRCLE + LINE_DIST) {
      // half circle left
      distance -= CIRCUMFERENCE_HALF_CIRCLE + LINE_DIST;
      let angle = distance / MEASUREMENT_RADIUS;
      angle = -angle + Math.PI / 2 + Math.PI; // correct orientiation
      let [inside, outside] = angleToLineSecondHalfCircle(angle);
      return {
        inside,
        outside,
      };
    }

    if (distance <= 2 * CIRCUMFERENCE_HALF_CIRCLE + 2 * LINE_DIST) {
      // straightaway bottom
      distance -= 2 * CIRCUMFERENCE_HALF_CIRCLE + LINE_DIST;
      let outside = new Vector2(
        C2_OUTER.x + distance,
        F_OUTER_BOTTOM(C2_OUTER.x + distance)
      );
      let inside = new Vector2(C2.x + distance, RADIUS_INNER);
      return {
        inside,
        outside,
      };
    }
  });
};

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

  let determinant = RADIUS_OUTER * RADIUS_OUTER * dr * dr - D * D;

  // console.log('startNeedsDrawing: ', startNeedsDrawing);
  // console.log('angle: ', angle * 180 / Math.PI + 'deg');
  // console.log('pInner: ', pInner);
  // console.log('p1: ', p1);
  // console.log('p2: ', p2);
  // console.log('d: ', d);
  // console.log('dr: ', dr);
  // console.log('D: ', D);

  if (determinant !== 0) {
    let x1 =
      (D * d.y + Math.sign(d.y) * d.x * Math.sqrt(determinant)) / (dr * dr);
    let x2 =
      (D * d.y - Math.sign(d.y) * d.x * Math.sqrt(determinant)) / (dr * dr);

    let y1 = (-D * d.x + Math.abs(d.y) * Math.sqrt(determinant)) / (dr * dr);
    let y2 = (-D * d.x - Math.abs(d.y) * Math.sqrt(determinant)) / (dr * dr);

    let pOuter1 = new Vector2(x1, y1).add(C1_OUTER);
    let pOuter2 = new Vector2(x2, y2).add(C1_OUTER);

    // console.log('pOuter1: ', pOuter1)
    // console.log('pOuter2: ', pOuter2)

    let pOuter = pOuter1.x > pOuter2.x ? pOuter1 : pOuter2;
    // console.log('pOuter: ', pOuter)
    // console.log(C1_OUTER)

    ret = [pInner, pOuter];
  }

  return ret;
};

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

  let determinant = RADIUS_OUTER * RADIUS_OUTER * dr * dr - D * D;

  // console.log('startNeedsDrawing: ', startNeedsDrawing);
  // console.log('angle: ', angle * 180 / Math.PI + 'deg');
  // console.log('pInner: ', pInner);
  // console.log('p1: ', p1);
  // console.log('p2: ', p2);
  // console.log('d: ', d);
  // console.log('dr: ', dr);
  // console.log('D: ', D);

  if (determinant !== 0) {
    let x1 =
      (D * d.y + Math.sign(d.y) * d.x * Math.sqrt(determinant)) / (dr * dr);
    let x2 =
      (D * d.y - Math.sign(d.y) * d.x * Math.sqrt(determinant)) / (dr * dr);

    let y1 = (-D * d.x + Math.abs(d.y) * Math.sqrt(determinant)) / (dr * dr);
    let y2 = (-D * d.x - Math.abs(d.y) * Math.sqrt(determinant)) / (dr * dr);

    let pOuter1 = new Vector2(x1, y1).add(C2_OUTER);
    let pOuter2 = new Vector2(x2, y2).add(C2_OUTER);

    // console.log('pOuter1: ', pOuter1)
    // console.log('pOuter2: ', pOuter2)

    let pOuter = pOuter1.x < pOuter2.x ? pOuter1 : pOuter2;
    // console.log('pOuter: ', pOuter)
    // console.log(C1_OUTER)

    ret = [pInner, pOuter];
  }

  return ret;
};

const angleSVGTo3DFirstHalfCircle = (angle) => {
  return (angle * Math.PI) / 180 - Math.PI / 2;
};
const angleSVGTo3DSecondCircle = (angle) => {
  // console.log(angle)
  return (angle * Math.PI) / 180 + Math.PI / 2;
};

const drawLine = ({ p1, p2, path3D, moveTo = false }) => {
  if (path3D) {
    if (moveTo) path3D.moveTo(p1.x, -p1.y);
    path3D.lineTo(p2.x, -p2.y);
  } else {
    return (moveTo ? `M${p1.x},${p1.y}` : "") + `L${p2.x},${p2.y}`;
  }
};

const drawShapes = [
  {
    part: "First Half Circle",
    length: CIRCUMFERENCE_HALF_CIRCLE,
    drawOuterLine(props) {
      const {
        start,
        startNeedsDrawing,
        startingPoints,
        end,
        endingPoints,
        path3D,
      } = props;
      console.log("First Half Circle");
      console.dir(props);
      let angle = start / MEASUREMENT_RADIUS;
      angle = -angle + Math.PI / 2; // correct orientiation
      let data = "";

      if (startNeedsDrawing) {
        let [pInner, pOuter] = angleToLineFirstHalfCircle(angle);

        if (pOuter && pOuter.x > C1_OUTER.x) {
          data += drawLine({
            p1: pInner,
            p2: pOuter,
            path3D,
            moveTo: true,
          });
        } else {
          console.log("didn't find an intersection");
        }
      }

      if (end) {
        let endAngle = (end / MEASUREMENT_RADIUS) * (180 / Math.PI);
        let startAngle = (start / MEASUREMENT_RADIUS) * (180 / Math.PI);
        let [pInner, pOuter] = angleToLineFirstHalfCircle(
          -(end / MEASUREMENT_RADIUS) + Math.PI / 2
        );

        if (path3D) {
          path3D.absarc(
            C1_OUTER.x,
            -C1_OUTER.y,
            RADIUS_OUTER,
            angleSVGTo3DFirstHalfCircle(startAngle),
            angleSVGTo3DFirstHalfCircle(endAngle),
            false
          );
        } else {
          data += ` A ${RADIUS_OUTER} ${RADIUS_OUTER} ${
            endAngle - startAngle
          } 0 0 ${pOuter.x},${pOuter.y}`;
        }

        // draw inward line
        data += drawLine({
          p1: pOuter,
          p2: pInner,
          path3D,
        });
      } else {
        let endAngle = (start / MEASUREMENT_RADIUS) * (180 / Math.PI);
        // draw remaining arc
        if (path3D) {
          path3D.absarc(
            C1_OUTER.x,
            -C1_OUTER.y,
            RADIUS_OUTER,
            angleSVGTo3DFirstHalfCircle(endAngle),
            angleSVGTo3DFirstHalfCircle(180),
            false
          );
        } else {
          data += ` A ${RADIUS_OUTER} ${RADIUS_OUTER} ${
            180 - endAngle
          } 0 0 5.33,-8.385`;
        }
      }

      // console.log(data)

      return data;
    },
    drawInnerLine({ start, end, path3D }) {
      // console.log('drawInnerLine First Apex')
      // console.log('start: ', start);
      // console.log('end: ', end);
      let data = "";
      let startAngle;
      let endAngle;

      if (start) {
        startAngle = (start / MEASUREMENT_RADIUS) * (180 / Math.PI);
      } else {
        startAngle = 180;
      }

      if (end) {
        endAngle = (end / MEASUREMENT_RADIUS) * (180 / Math.PI);
      } else {
        endAngle = 0;
      }

      let endAngleRad = -((endAngle * Math.PI) / 180) + Math.PI / 2;
      // console.log(startAngle)
      // console.log(endAngle)
      // console.log(endAngleRad)
      let direction = new Vector2(Math.cos(endAngleRad), Math.sin(endAngleRad));
      let pInner = C1.clone().add(direction.multiplyScalar(RADIUS_INNER));

      // console.dir(pInner)

      if (path3D) {
        path3D.absarc(
          C1.x,
          -C1.y,
          RADIUS_INNER,
          angleSVGTo3DFirstHalfCircle(startAngle),
          angleSVGTo3DFirstHalfCircle(endAngle),
          true
        );
      } else {
        data += ` A ${RADIUS_INNER} ${RADIUS_INNER} ${
          endAngle - startAngle
        } 0 1 ${pInner.x},${pInner.y}`;
      }

      // console.log(data);

      return data;
    },
  },
  {
    part: "First Straightaway",
    length: LINE_DIST,
    drawOuterLine({ start, startNeedsDrawing, end, path3D }) {
      // console.log('drawOuterLine')
      let data = "";
      let xEnd = end ? end : LINE_DIST;
      let pEnd = new Vector2(C1_OUTER.x - xEnd, F_OUTER_TOP(C1_OUTER.x - xEnd));

      if (startNeedsDrawing) {
        let pStart = new Vector2(
          C1_OUTER.x - start,
          F_OUTER_TOP(C1_OUTER.x - start)
        );
        let pStartInner = new Vector2(C1.x - start, -RADIUS_INNER);

        data += drawLine({
          p1: pStartInner,
          p2: pStart,
          path3D,
          moveTo: true,
        });
      }

      data += drawLine({
        p1: null,
        p2: pEnd,
        path3D,
      });

      if (end) {
        let pEndInner = new Vector2(C1_OUTER.x - xEnd, -RADIUS_INNER);

        data += drawLine({
          p1: null,
          p2: pEndInner,
          path3D,
        });
      }

      return data;
    },
    drawInnerLine({ start, end, path3D }) {
      // console.log('drawInnerLine First Straightaway')
      // console.log('start: ', start)
      // console.log('end: ', end)
      let pEnd = new Vector2(C1.x - end, -RADIUS_INNER);

      return drawLine({
        p1: null,
        p2: pEnd,
        path3D,
      });
    },
  },
  {
    part: "Second Half Circle",
    length: CIRCUMFERENCE_HALF_CIRCLE,
    drawOuterLine({ start, startNeedsDrawing, end, path3D }) {
      let angle = start / MEASUREMENT_RADIUS;
      angle = -angle + Math.PI / 2 + Math.PI; // correct orientiation
      let data = "";

      if (startNeedsDrawing) {
        let [pInner, pOuter] = angleToLineSecondHalfCircle(angle);

        if (pOuter && pOuter.x < C2_OUTER.x) {
          data += drawLine({
            p1: pInner,
            p2: pOuter,
            path3D,
            moveTo: true,
          });
        } else {
          console.log("didn't find an intersection");
        }
      }

      if (end) {
        let endAngle = (end / MEASUREMENT_RADIUS) * (180 / Math.PI);
        let startAngle = (start / MEASUREMENT_RADIUS) * (180 / Math.PI);
        let [pInner, pOuter] = angleToLineSecondHalfCircle(
          -(end / MEASUREMENT_RADIUS) + Math.PI / 2 + Math.PI
        );

        if (path3D) {
          path3D.absarc(
            C2_OUTER.x,
            -C2_OUTER.y,
            RADIUS_OUTER,
            angleSVGTo3DSecondCircle(startAngle),
            angleSVGTo3DSecondCircle(endAngle),
            false
          );
        } else {
          data += ` A ${RADIUS_OUTER} ${RADIUS_OUTER} ${
            endAngle - startAngle
          } 0 0 ${pOuter.x},${pOuter.y}`;
        }

        // draw inward line
        data += drawLine({
          p1: null,
          p2: pInner,
          path3D,
        });
      } else {
        let endAngle = (start / MEASUREMENT_RADIUS) * (180 / Math.PI);
        // draw remaining arc
        if (path3D) {
          path3D.absarc(
            C2_OUTER.x,
            -C2_OUTER.y,
            RADIUS_OUTER,
            angleSVGTo3DSecondCircle(endAngle),
            angleSVGTo3DSecondCircle(180),
            false
          );
        } else {
          data += ` A ${RADIUS_OUTER} ${RADIUS_OUTER} ${
            180 - endAngle
          } 0 0 -5.33,8.385`;
        }
      }

      // console.log(data)

      return data;
    },
    drawInnerLine({ start, end, path3D }) {
      // console.log('drawInnerLine First Apex')
      // console.log('start: ', start);
      // console.log('end: ', end);
      let data = "";
      let startAngle;
      let endAngle;

      if (start) {
        startAngle = (start / MEASUREMENT_RADIUS) * (180 / Math.PI);
      } else {
        startAngle = 180;
      }

      if (end) {
        endAngle = (end / MEASUREMENT_RADIUS) * (180 / Math.PI);
      } else {
        endAngle = 0;
      }

      let endAngleRad = -((endAngle * Math.PI) / 180) + Math.PI / 2 + Math.PI;
      // console.log(startAngle)
      // console.log(endAngle)
      // console.log(endAngleRad)
      let direction = new Vector2(Math.cos(endAngleRad), Math.sin(endAngleRad));
      let pInner = C2.clone().add(direction.multiplyScalar(RADIUS_INNER));

      // console.dir(pInner)

      if (path3D) {
        path3D.absarc(
          C2.x,
          -C2.y,
          RADIUS_INNER,
          angleSVGTo3DSecondCircle(startAngle),
          angleSVGTo3DSecondCircle(endAngle),
          true
        );
      } else {
        data += ` A ${RADIUS_INNER} ${RADIUS_INNER} ${
          endAngle - startAngle
        } 0 1 ${pInner.x},${pInner.y}`;
      }

      // console.log(data);

      return data;
    },
  },
  {
    part: "Second Straightaway",
    length: LINE_DIST,
    drawOuterLine({ start, startNeedsDrawing, end, path3D }) {
      // console.log('drawOuterLine Second Straightaway')
      let data = "";
      let xEnd = end ? end : LINE_DIST;
      let pEnd = new Vector2(
        C2_OUTER.x + xEnd,
        F_OUTER_BOTTOM(C2_OUTER.x + xEnd)
      );

      if (startNeedsDrawing) {
        let pStart = new Vector2(
          C2_OUTER.x + start,
          F_OUTER_BOTTOM(C2_OUTER.x + start)
        );
        let pStartInner = new Vector2(C2.x + start, RADIUS_INNER);

        data += drawLine({
          p1: pStartInner,
          p2: pStart,
          path3D,
          moveTo: true,
        });
      }

      data += drawLine({
        p1: null,
        p2: pEnd,
        path3D,
      });

      // console.log('start: ', start);
      // console.log('end: ', end);
      if (end) {
        let pEndInner = new Vector2(C2_OUTER.x + xEnd, RADIUS_INNER);
        // console.log('pEndInner', pEndInner);

        data += drawLine({
          p1: null,
          p2: pEndInner,
          path3D,
        });
      }

      return data;
    },
    drawInnerLine({ start, end, path3D }) {
      // console.log('drawInnerLine Second Straightaway')
      // console.log('start: ', start)
      // console.log('end: ', end)
      let pEnd = new Vector2(C2.x + end, RADIUS_INNER);

      return drawLine({
        p1: null,
        p2: pEnd,
        path3D,
      });
    },
  },
];
