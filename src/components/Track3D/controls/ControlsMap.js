import ControlsBase from './ControlsBase';

import * as THREE from 'three';

import { MapControls } from 'three/examples/jsm/controls/OrbitControls';

class ControlsMap extends ControlsBase {
  constructor(options) {
    super(options);

    let { renderer, camera } = options;
    this.camera = camera;
    this.renderer = renderer;
    this.context = options.context;

    this.setup();
  }

  setupControls() {
    this.controls = new MapControls( this.camera, this.renderer.domElement );
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.target = new THREE.Vector3(...this.props.controls.target);

    this.controls.addEventListener('end', this.onMapInteractionEnd);

    if (this.props.mapControlsDampingEnabled) {
      this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
      this.controls.dampingFactor = 0.05;
      this.controls.addEventListener('start', this.requestAnimateThrottled);
      this.controls.addEventListener('change', this.requestAnimateThrottled);
    } else {
      this.controls.addEventListener('change', this.requestAnimateThrottled);
    }
    this.controls.update();
  }

  onMapInteractionEnd() {
    if (this.props.vrModeEnabled) return;

    // persist camera/controls changes to the store
    this.props.setCamera({
      position: this.camera.position.toArray(),
      rotation: this.camera.rotation.toArray()
    });
    this.props.setControls({
      target: this.controls.target.toArray()
    });
  }

  destroy() {
    if (this.props.mapControlsDampingEnabled) {
      this.controls.removeEventListener('start', this.requestAnimateThrottled);
      this.controls.removeEventListener('change', this.requestAnimateThrottled);
    } else {
      this.controls.removeEventListener('change', this.requestAnimateThrottled);
    }
    this.controls.removeEventListener('end', this.onMapInteractionEnd);
    this.controls.dispose();
    this.controls = null;
  }
}

export default ControlsMap;