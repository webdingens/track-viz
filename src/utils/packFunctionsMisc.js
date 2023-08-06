import _ from "lodash";
import { Vector2 } from "three/src/math/Vector2";

import {
  C1,
  C2,
  CIRCUMFERENCE_HALF_CIRCLE,
  LINE_DIST,
  MEASUREMENT_LENGTH,
  MEASUREMENT_RADIUS,
} from "roller-derby-track-utils";

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

  console.error("pivotLineDist wrong");
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
