import React from 'react';
import * as THREE from 'three';

const TICK_WIDTH = .6;
const TICK_DISTANCE = 3.05;
const TICK_STROKE_WIDTH = .05;

class Track3DMarkings extends React.PureComponent {

  getTrackMarkings() {
    let trackMarkings = new THREE.Group();

    const addPath = (path, options = {}) => {
      let points = path.getPoints();

      let geometry = new THREE.BufferGeometry().setFromPoints( points );
      let material;

      if (options.striped) {
        material = new THREE.LineDashedMaterial({
          color: 0x000000,
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

    const addShape = (points) => {
      let shape = new THREE.Shape(points);
      let options3D = {
        // curveSegments: 200,
        color: 0x000000,
        // opacity: .5,
        // transparent: true,
        metalness: 0,
        roughness: .5,
        // wireframe: true,
      }
      let geometry = new THREE.ShapeGeometry( shape );
      let material = new THREE.MeshStandardMaterial(options3D);
      let mesh = new THREE.Mesh( geometry, material );
      trackMarkings.add( mesh );
    }

    const addLineShape = (p1, p2) => {
      let dir = p2.clone().sub(p1);
      let unit = new THREE.Vector2(1, 0);
      let perp = unit.rotateAround(new THREE.Vector2(0, 0), dir.angle() + Math.PI / 2);
      perp.multiplyScalar(TICK_STROKE_WIDTH / 2);

      addShape([
        p1.clone().add(perp),
        p1.clone().sub(perp),
        p2.clone().sub(perp),
        p2.clone().add(perp),
      ]);
    }

    let p;
    let shape;

    // Logic from components/Track/TrackMarkings.js

    // inner boundaries
    shape = new THREE.Shape();
    shape.moveTo(5.33, -3.81 + TICK_STROKE_WIDTH / 2)
      .lineTo(5.33, -3.81 - TICK_STROKE_WIDTH / 2)
      .absarc(5.33, 0, 3.81 + TICK_STROKE_WIDTH / 2, -Math.PI / 2, Math.PI / 2, false)
      .lineTo(-5.33, 3.81 + TICK_STROKE_WIDTH / 2)
      .absarc(-5.33, 0, 3.81 + TICK_STROKE_WIDTH / 2, Math.PI / 2, 3 * Math.PI / 2, false)
      .lineTo(5.33, -3.81 - TICK_STROKE_WIDTH / 2)
      .lineTo(5.33, -3.81 + TICK_STROKE_WIDTH / 2)
      .lineTo(-5.33, -3.81 + TICK_STROKE_WIDTH / 2)
      .absarc(-5.33, 0, 3.81 - TICK_STROKE_WIDTH / 2, 3 * Math.PI / 2, Math.PI / 2, true)
      .lineTo(5.33, 3.81 - TICK_STROKE_WIDTH / 2)
      .absarc(5.33, 0, 3.81 - TICK_STROKE_WIDTH / 2, Math.PI / 2, -Math.PI / 2, true)
      .closePath();
    addShape(shape.getPoints(18));

    // outer boundaries
    shape = new THREE.Shape();
    shape.moveTo(5.33, .305 - 8.08 + TICK_STROKE_WIDTH / 2)
      .lineTo(5.33, .305 - 8.08 - TICK_STROKE_WIDTH / 2)
      .absarc(5.33, .305, 8.08 + TICK_STROKE_WIDTH / 2, -Math.PI / 2, Math.PI / 2, false)
      .lineTo(-5.33, 7.775 + TICK_STROKE_WIDTH / 2)
      .absarc(-5.33, -.305, 8.08 + TICK_STROKE_WIDTH / 2, Math.PI / 2,  3 * Math.PI / 2, false)
      .lineTo(5.33, -7.775 - TICK_STROKE_WIDTH / 2)
      .lineTo(5.33, -7.775 + TICK_STROKE_WIDTH / 2)
      .lineTo(-5.33, -8.385 + TICK_STROKE_WIDTH / 2)
      .absarc(-5.33, -.305, 8.08 - TICK_STROKE_WIDTH / 2, 3 * Math.PI / 2, Math.PI / 2, true)
      .lineTo(5.33, 8.385 - TICK_STROKE_WIDTH / 2)
      .absarc(5.33, .305, 8.08 - TICK_STROKE_WIDTH / 2, Math.PI / 2, -Math.PI / 2, true)
      .closePath();
    addShape(shape.getPoints(30));

    // pivot line
    addLineShape(
      new THREE.Vector2(5.33, -3.81),
      new THREE.Vector2(5.33, -7.775)
    );

    // Ticks
    addLineShape(
      new THREE.Vector2(5.33 - TICK_DISTANCE, -5.41 + TICK_WIDTH/2),
      new THREE.Vector2(5.33 - TICK_DISTANCE, -5.41 - TICK_WIDTH/2)
    );

    addLineShape(
      new THREE.Vector2(5.33 - 2 * TICK_DISTANCE, -5.41 + TICK_WIDTH/2),
      new THREE.Vector2(5.33 - 2 * TICK_DISTANCE, -5.41 - TICK_WIDTH/2)
    );

    // jammer line
    addLineShape(
      new THREE.Vector2(5.33 - 3 * TICK_DISTANCE, -3.81),
      new THREE.Vector2(5.33 - 3 * TICK_DISTANCE, -(7.775 - 8.385) / (2*5.33) * (5.33 - 3 * TICK_DISTANCE) - 8.08)
    );

    // Ticks
    [0,1,2,3].forEach((el, idx) => {
      addLineShape(
        new THREE.Vector2(-5.33 + el * TICK_DISTANCE, 5.41 + TICK_WIDTH/2),
        new THREE.Vector2(-5.33 + el * TICK_DISTANCE, 5.41 - TICK_WIDTH/2)
      );
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

      addLineShape(
        new THREE.Vector2(p1[0], -p1[1]),
        new THREE.Vector2(p2[0], -p2[1])
      );
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

      addLineShape(
        new THREE.Vector2(p1[0], -p1[1]),
        new THREE.Vector2(p2[0], -p2[1])
      );
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
    this.trackMarkings.name = 'Track Markings';

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