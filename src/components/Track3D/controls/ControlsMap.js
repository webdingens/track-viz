import ControlsBase from './ControlsBase';

import * as THREE from 'three';
import _ from 'lodash';

import { MapControls } from 'three/examples/jsm/controls/OrbitControls';

// TODO: move things from context to options
// TODO: use dispatch in controls instead of using the props actions

const EYE_HEIGHT = 1.7;

class ControlsMap extends ControlsBase {
  constructor(options) {
    super(options);

    let { renderer, camera, context } = options;
    this.camera = camera;
    this.renderer = renderer;
    this.context = context;

    this.animate = this.animate.bind(this);
    this.requestAnimate = this.requestAnimate.bind(this);
    this._animateWithDamping = this._animateWithDamping.bind(this);
    this._onMapInteractionEnd = this._onMapInteractionEnd.bind(this);

    this.setupControls();
  }

  setupControls() {
    this.controls = new MapControls( this.camera, this.renderer.domElement );
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.target = new THREE.Vector3(...this.context.props.controls.target);

    this.controls.addEventListener('end', this._onMapInteractionEnd);

    if (this.context.props.mapControlsDampingEnabled) {
      this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
      this.controls.dampingFactor = 0.05;
      this.controls.addEventListener('start', this.requestAnimate);
      this.controls.addEventListener('change', this.requestAnimate);
    } else {
      this.controls.addEventListener('change', this.requestAnimate);
    }
  }

  _onMapInteractionEnd() {
    // persist camera/controls changes to the store
    this.context.props.setCamera({
      position: this.camera.position.toArray(),
      rotation: this.camera.rotation.toArray()
    });
    this.context.props.setControls({
      target: this.controls.target.toArray()
    });
  }

  animate() {
    if (this.context.props.mapControlsDampingEnabled) {
      this._animateWithDamping();
    } else {
      this._animateWithoutDamping();
    }
  }

  _animateWithoutDamping() {
    this.controls.update();

    this.renderer.render( this.context.scene, this.camera );

    this.animationRequest = null;
  }

  _animateWithDamping() {
    let updated = this.controls.update();
    this.renderer.render( this.context.scene, this.camera );

    if (!updated) {
      // stop animating if nothing happens to save energy
      this.animationRequest = null;
    } else {
      this.animationRequest = requestAnimationFrame( this._animateWithDamping );
    }
  }

  requestAnimate() {
    if (this.animationRequest) return;
    this.animationRequest = requestAnimationFrame( this.animate );
  }

  update() {
    this.controls.update();
  }

  _didTargetChange(prevProps, nextProps) {
    let val = _.difference(
      prevProps.controls.target,
      nextProps.controls.target).length > 0;
    return val;
  }

  syncProps(prevProps, nextProps) {
    if (this._didTargetChange(prevProps, nextProps)) {
      this.controls.target.fromArray(nextProps.controls.target);
      this.requestAnimate();
    }
  }

  destroy() {
    if (this.context.props.mapControlsDampingEnabled) {
      this.controls.removeEventListener('start', this.requestAnimate);
      this.controls.removeEventListener('change', this.requestAnimate);
    } else {
      this.controls.removeEventListener('change', this.requestAnimate);
    }
    this.controls.removeEventListener('end', this._onMapInteractionEnd);
    this.controls.dispose();
    this.controls = null;

    if (this.animationRequest) {
      cancelAnimationFrame(this.animationRequest);
      this.animationRequest = null;
    }
  }

  /**
   *  Prepares the setup during a switch
   *  Look down 6 meters ahead
   *
   * @static
   */
  static switchTo(context = {}) {
    // update target based on the current camera and
    // make camera look ahead onto the floor with a falloff of 1/5

    let { props } = context;

    let camRot = new THREE.Euler(...props.camera.rotation).reorder('YXZ');

    let camPos = new THREE.Vector3(...props.camera.position); // we will probably move viewer later so we can walk through the XR-scape

    // look ahead onto the floor with m=1.7/6
    let m = EYE_HEIGHT/6;
    let aheadDist = camPos.y / m;

    let toNewTarget = (new THREE.Vector3(0, 0, -aheadDist)).applyEuler(new THREE.Euler(0, camRot.y, 0, 'YXZ')); // rotate around center, yes?
    let newTarget = toNewTarget.add(new THREE.Vector3(camPos.x, 0, camPos.z)); // add to new position

    // setting new Controls
    props.setControls({
      target: newTarget.toArray()
    });
  }
}

export default ControlsMap;