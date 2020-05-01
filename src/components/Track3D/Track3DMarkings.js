import React from 'react';
import * as THREE from 'three';

const TICK_WIDTH = .6;
const TICK_DISTANCE = 3.05;

class Track3DMarkings extends React.PureComponent {

  getTrackMarkings() {
    let trackMarkings = new THREE.Group();

    const addPath = (path, options = {}) => {
      let points = path.getPoints();

      let geometry = new THREE.BufferGeometry().setFromPoints( points );
      let material;

      if (options.striped) {
        material = new THREE.LineDashedMaterial({
          color: 0x999999,
          scale: 1,
          dashSize: .1,
          gapSize: .1,
        })
      } else {
        material = new THREE.LineBasicMaterial( { color: 0x000000 } );
      }

      let line = new THREE.Line( geometry, material );

      // LOL this is why lines were not rendered striped
      if (options.striped) line.computeLineDistances();

      trackMarkings.add( line );
    }

    let p;

    // Logic from components/Track/TrackMarkings.js

    // inner boundaries
    p = new THREE.Path();
    p.absarc(
        5.33,
        0,
        3.81,
        -90 * Math.PI / 180,
        -270 * Math.PI / 180,
        false
      )
      p.lineTo(-5.33, 3.81)
      p.absarc(
        -5.33,
        0,
        3.81,
        90 * Math.PI / 180,
        270 * Math.PI / 180,
        false
      )
      .lineTo(5.33, -3.81);
    addPath(p);

    // outer boundaries
    p = new THREE.Path();
    p.moveTo(5.33, 0)
      .arc(0, .305, 8.08,
        -90 * Math.PI / 180,
        90 * Math.PI / 180,
        false
        )
      .lineTo(-5.33, 7.775)
      .arc(0, -8.08, 8.08,
        90 * Math.PI / 180,
        -90 * Math.PI / 180,
        false
        )
      .lineTo(5.33, -7.775)
    addPath(p);

    // pivot line
    p = new THREE.Path();
    p.moveTo(5.33, -3.81)
      .lineTo(5.33, -7.775)
    addPath(p);

    // Ticks
    p = new THREE.Path();
    p.moveTo(5.33 - TICK_DISTANCE, -5.41 + TICK_WIDTH/2)
      .lineTo(5.33 - TICK_DISTANCE, -5.41 - TICK_WIDTH/2)
    addPath(p);

    p = new THREE.Path();
    p.moveTo(5.33 - 2 * TICK_DISTANCE, -5.41 + TICK_WIDTH/2)
      .lineTo(5.33 - 2 * TICK_DISTANCE, -5.41 - TICK_WIDTH/2)
    addPath(p);

    // jammer line
    p = new THREE.Path();
    p.moveTo(5.33 - 3 * TICK_DISTANCE, -3.81)
      .lineTo(5.33 - 3 * TICK_DISTANCE, -(7.775 - 8.385) / (2*5.33) * (5.33 - 3 * TICK_DISTANCE) - 8.08)
    addPath(p);

    // Ticks
    [0,1,2,3].forEach((el, idx) => {
      p = new THREE.Path();
      p.moveTo(-5.33 + el * TICK_DISTANCE, 5.41 + TICK_WIDTH/2)
        .lineTo(-5.33 + el * TICK_DISTANCE, 5.41 - TICK_WIDTH/2)
      addPath(p);
    });

    [1,2,3,4,5].forEach((el, idx) => {
      var p1 = [5.33, 5.41 - TICK_WIDTH/2];
      var p2 = [5.33, 5.41 + TICK_WIDTH/2];
      var cR = [5.33, 0];
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

      p = new THREE.Path();
      p.moveTo(p1[0], -p1[1])
        .lineTo(p2[0], -p2[1])
      addPath(p);
    });

    [1,2,3,4,5].forEach((el, idx) => {
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

      p = new THREE.Path();
      p.moveTo(p1[0], -p1[1])
        .lineTo(p2[0], -p2[1])
      addPath(p);
    });

    // outside Track
    p = new THREE.Path();
    p.moveTo(5.33, -7.775 - 3.05)
      .arc(0, (8.08 + 3.05), 8.08 + 3.05,
        -90 * Math.PI / 180,
        90 * Math.PI / 180,
        false
      )
      .lineTo(-5.33, 7.775 + 3.05)
      .arc(0, -(8.08 + 3.05), 8.08 + 3.05,
        90 * Math.PI / 180,
        -90 * Math.PI / 180,
        false
      )
      .lineTo(5.33, -7.775 - 3.05)
    addPath(p, { striped: true });

    return trackMarkings;
  }

  componentDidMount() {
    if (!this.props.scene) return;

    this.trackMarkings = this.getTrackMarkings();
    this.trackMarkings.rotateX(-Math.PI / 2);

    this.props.scene.add(this.trackMarkings);
  }

  componentWillUnmount() {
    if (this.props.scene && this.trackMarkings)
      this.props.scene.remove(this.trackMarkings);
  }

  render() {
    return <></>;
  }
}




export default Track3DMarkings;