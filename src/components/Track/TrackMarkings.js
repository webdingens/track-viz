import React from 'react';

import styles from './TrackMarkings.module.scss';

const TICK_WIDTH = .6;
const TICK_DISTANCE = 3.05;
const MEASUREMENT_RADIUS = 5.41;

export default (props) => (
  <>
    {/* Figure 2 */}
    {/* <line x1="-5.33" x2="5.33" y1="0" y2="0" />
    <circle cx="0" cy="0" r=".1" /> */}
    {/* <circle cx="-5.33" cy="0" r=".1" />
    <circle cx="5.33" cy="0" r=".1" /> */}

    {/* Inner Track Boundary */}

    {/* Figure 3 */}
    {/* A: rx, ry, angle, largearc ? 1/0, clockwise ? 1/0 */}
    <path d="M-5.33,-3.81 A 3.81 3.81 180 1 0 -5.33,3.81" />
    <path d="M5.33,3.81 A 3.81 3.81 180 1 0 5.33,-3.81" />

    {/* Outer Track Boundary */}

    {/* Figure 4 */}
    {/* <line x1="5.33" x2="5.33" y1="0" y2="-.305" />
    <circle cx="5.33" cy="-.305" r=".1" />
    <circle cx="5.33" cy="0" r=".1" /> */}
    <path d="M5.33,7.775 A 8.08 8.08 180 0 0 5.33,-8.385" />

    {/* Figure 4a */}
    {/* <line x1="-5.33" x2="-5.33" y1="0" y2=".305" />
    <circle cx="-5.33" cy=".305" r=".1" />
    <circle cx="-5.33" cy="0" r=".1" /> */}
    <path d="M-5.33,-7.775 A 8.08 8.08 180 0 0 -5.33,8.385" />

    {/* Figure 5 */}
    <path d="M5.33,3.81 L-5.33,3.81" />
    <path d="M5.33,-3.81 L-5.33,-3.81" />
    <path d="M5.33,7.775 L-5.33,8.385" />
    <path d="M5.33,-8.385 L-5.33,-7.775" />

    {/* Track Marker */}

    {/* Figure 6 Pivot Line*/}
    <path d="M5.33,3.81 L5.33,7.775" />

    {/* Figure 7 Ticks */}
    <path d={`M${5.33 - TICK_DISTANCE},${5.41 - TICK_WIDTH/2} L${5.33 - TICK_DISTANCE},${5.41 + TICK_WIDTH/2}`} />
    <path d={`M${5.33 - 2 * TICK_DISTANCE},${5.41 - TICK_WIDTH/2} L${5.33 - 2 * TICK_DISTANCE},${5.41 + TICK_WIDTH/2}`} />

    {/* Figure 7 Jammer Line */}
    {/* get y of 5.33 - 3 * TICK_DISTANCE (outside boundary)
      -5.33, 8.385 -> 5.33,7.775
      m = (7.775 - 8.385) / (2*5.33)
      8.385 = m * -5.33 + c
      c= 8.08
      f(x) = m * x + 8.08
      f(5.33 - 3 * TICK_DISTANCE) = whatever
    */}
    <path d={`M${5.33 - 3 * TICK_DISTANCE},3.81 L${5.33 - 3 * TICK_DISTANCE},${(7.775 - 8.385) / (2*5.33) * (5.33 - 3 * TICK_DISTANCE) + 8.08}`} />

    {/* Figure 8 Ticks */}
    {[0,1,2,3].map((el, idx) => (
      <path key={`figure-8-tick-${idx}`} d={`M${-5.33 + el * TICK_DISTANCE},${-5.41 - TICK_WIDTH/2} L${-5.33 + el * TICK_DISTANCE},${-5.41 + TICK_WIDTH/2}`} />
    ))}

    {/* Figure 10 Ticks */}
    {[1,2,3,4,5].map((el, idx) => {
      var p1 = [5.33, 5.41 - TICK_WIDTH/2];
      var p2 = [5.33, 5.41 + TICK_WIDTH/2];
      var cR = [5.33, 0];
      // U = 2*PI * r
      // 3.05 = alpha * 5.41
      var measurementRadius = MEASUREMENT_RADIUS;
      var angle = el * -TICK_DISTANCE / measurementRadius;  // minus because of the flipped coordinate system
      // Rotate
      p1 = [p1[0] - cR[0], p1[1] - cR[1]];
      p1 = [
        p1[0]*Math.cos(angle) - p1[1]*Math.sin(angle),
        p1[0]*Math.sin(angle) + p1[1]*Math.cos(angle)
      ];
      p1 = [p1[0] + cR[0], p1[1] + cR[1]];
      p2 = [p2[0] - cR[0], p2[1] - cR[1]];
      p2 = [
        p2[0]*Math.cos(angle) - p2[1]*Math.sin(angle),
        p2[0]*Math.sin(angle) + p2[1]*Math.cos(angle)
      ];
      p2 = [p2[0] + cR[0], p2[1] + cR[1]];

      return (
        <path key={`figure-10-tick-${idx}`} d={`M${p1[0]},${p1[1]} L${p2[0]},${p2[1]}`} />
      )
    })}

    {/* Figure 11 Ticks */}
    {[1,2,3,4,5].map((el, idx) => {
      var p1 = [-5.33, -5.41 - TICK_WIDTH/2];
      var p2 = [-5.33, -5.41 + TICK_WIDTH/2];
      var cR = [-5.33, 0];
      // U = 2*PI * r
      // 3.05 = alpha * 5.41
      var measurementRadius = 5.41
      var angle = el * -TICK_DISTANCE / measurementRadius;  // minus because of the flipped coordinate system
      // Rotate
      p1 = [p1[0] - cR[0], p1[1] - cR[1]];
      p1 = [
        p1[0]*Math.cos(angle) - p1[1]*Math.sin(angle),
        p1[0]*Math.sin(angle) + p1[1]*Math.cos(angle)
      ];
      p1 = [p1[0] + cR[0], p1[1] + cR[1]];
      p2 = [p2[0] - cR[0], p2[1] - cR[1]];
      p2 = [
        p2[0]*Math.cos(angle) - p2[1]*Math.sin(angle),
        p2[0]*Math.sin(angle) + p2[1]*Math.cos(angle)
      ];
      p2 = [p2[0] + cR[0], p2[1] + cR[1]];

      return (
        <path key={`figure-11-tick-${idx}`} d={`M${p1[0]},${p1[1]} L${p2[0]},${p2[1]}`} />
      )
    })}


    {/* Outside Track */}
    {props.showRefLane ? (
      <g className={styles.outsideOfficiatingBoundary}>
        <path d={`M5.33,${7.775 + 3.05} A ${8.08 + 3.05} ${8.08 + 3.05} 180 1 0 5.33,${-8.385 - 3.05}`} />
        <path d={`M-5.33,${-7.775 - 3.05} A ${8.08 + 3.05} ${8.08 + 3.05} 180 1 0 -5.33,${8.385 + 3.05}`} />
        {/* Line closure, top then bottom */}
        <path d={`M-5.33,${-7.775 - 3.05} L5.33,${-8.385 - 3.05}`} />
        <path d={`M5.33,${7.775 + 3.05} L-5.33,${+8.385 + 3.05}`} />
      </g>
    ) : null}


    {/* Measurement Line */}
    {/* <path className={styles.measurementLine}
      d={`M-5.33,-${MEASUREMENT_RADIUS} A ${MEASUREMENT_RADIUS} ${MEASUREMENT_RADIUS} 180 1 0 -5.33,${MEASUREMENT_RADIUS}`}
    />
    <path className={styles.measurementLine}
      d={`M5.33,${MEASUREMENT_RADIUS} A ${MEASUREMENT_RADIUS} ${MEASUREMENT_RADIUS} 180 1 0 5.33,-${MEASUREMENT_RADIUS}`}
    />
    <path className={styles.measurementLine}
      d={`M5.33,${MEASUREMENT_RADIUS} L-5.33,${MEASUREMENT_RADIUS}`}
    />
    <path className={styles.measurementLine}
      d={`M5.33,-${MEASUREMENT_RADIUS} L-5.33,-${MEASUREMENT_RADIUS}`}
    /> */}
    
  </>
)