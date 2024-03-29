import ControlsBase from "./ControlsBase";

import * as THREE from "three";
import _ from "lodash";
import store from "../../../app/store";

// import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
import { MapControls } from "./threejs/OrbitControls";

import { setTouchEnabledDevice } from "../../../app/reducers/interactionStateSlice";

// TODO: move things from context to options
// TODO: use dispatch in controls instead of using the props actions

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
    this._storeCamera = _.throttle(this._storeCamera.bind(this), 50, {
      leading: false,
      trailing: true,
    });
    this._updateTargetObject = this._updateTargetObject.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);

    this.setupControls();
  }

  _addTargetObject() {
    this.targetObj = new THREE.Group();

    // show target visually
    let geometry = new THREE.ConeGeometry(0.05, 0.1, 20);
    let material = new THREE.MeshPhongMaterial({
      color: 0x00aa00,
      transparent: true,
      opacity: 0.5,
    });
    let targetCone = new THREE.Mesh(geometry, material);

    this.targetObj.add(targetCone);

    let lineMaterial = new THREE.LineBasicMaterial({
      color: 0xaa0000,
      transparent: true,
      opacity: 0.1,
    });
    let points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(0, 10, 0));

    let lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

    let line = new THREE.Line(lineGeometry, lineMaterial);

    this.targetObj.add(line);

    this.targetObj.position.set(
      this.controls.target.x,
      0.05,
      this.controls.target.z
    );
    this.targetObj.name = "Map Controls Target";

    this.context.scene.add(this.targetObj);
  }

  setupControls() {
    this.controls = new MapControls(this.camera, this.renderer.domElement);
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.target = new THREE.Vector3(
      ...this.context.props.controls.target
    );

    this._addTargetObject();

    this.controls.addEventListener("end", this.requestAnimate);

    if (this.context.props.mapControlsDampingEnabled) {
      this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
      this.controls.dampingFactor = 0.05;
      this.controls.addEventListener("start", this.requestAnimate);
      this.controls.addEventListener("change", this.requestAnimate);
    } else {
      this.controls.addEventListener("change", this.requestAnimate);
    }

    document.addEventListener("touchstart", this.onTouchStart, false);
  }

  onTouchStart() {
    store.dispatch(setTouchEnabledDevice(true));

    document.removeEventListener("touchstart", this.onTouchStart);
  }

  _storeCamera() {
    // persist camera/controls changes to the store
    this.context.props.setCamera({
      position: this.camera.position.toArray(),
      rotation: this.camera.rotation.toArray(),
    });
    this.context.props.setControls({
      target: this.controls.target.toArray(),
    });
  }

  animate() {
    if (this.context.props.mapControlsDampingEnabled) {
      this._animateWithDamping();
    } else {
      this._animateWithoutDamping();
    }
    this._storeCamera();
  }

  _updateTargetObject() {
    this.targetObj.position.set(
      this.controls.target.x,
      0.05,
      this.controls.target.z
    );
  }

  _animateWithoutDamping() {
    this.controls.update();
    this._updateTargetObject();
    this.renderer.render(this.context.scene, this.camera);

    this.animationRequest = null;
  }

  _animateWithDamping() {
    let updated = this.controls.update();
    this._updateTargetObject();
    this.renderer.render(this.context.scene, this.camera);

    if (!updated) {
      // stop animating if nothing happens to save energy
      this.animationRequest = null;
    } else {
      this.animationRequest = requestAnimationFrame(this._animateWithDamping);
    }
  }

  update() {
    this.controls.update();
    this._updateTargetObject();
  }

  _didTargetChange(prevProps, nextProps) {
    let val =
      _.difference(prevProps.controls.target, nextProps.controls.target)
        .length > 0;
    return val;
  }

  syncProps(prevProps, nextProps) {
    if (this._didTargetChange(prevProps, nextProps)) {
      this.controls.target.fromArray(nextProps.controls.target);
      this.requestAnimate();
    }
  }

  destroy() {
    this._storeCamera.flush();

    if (this.context.props.mapControlsDampingEnabled) {
      this.controls.removeEventListener("start", this.requestAnimate);
      this.controls.removeEventListener("change", this.requestAnimate);
    } else {
      this.controls.removeEventListener("change", this.requestAnimate);
    }
    this.controls.removeEventListener("end", this.requestAnimate);
    this.controls.dispose();
    this.controls = null;

    if (this.targetObj) {
      this.context.scene.remove(this.targetObj);
    }

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

    let camRot = new THREE.Euler(...props.camera.rotation).reorder("YXZ");

    let camPos = new THREE.Vector3(...props.camera.position); // we will probably move viewer later so we can walk through the XR-scape

    // look ahead onto the floor with m=1.7/6
    let m = props.settings.track3D.eyeHeight / 6;
    let aheadDist = camPos.y / m;

    let toNewTarget = new THREE.Vector3(0, 0, -aheadDist).applyEuler(
      new THREE.Euler(0, camRot.y, 0, "YXZ")
    ); // rotate around center, yes?
    let newTarget = toNewTarget.add(new THREE.Vector3(camPos.x, 0, camPos.z)); // add to new position

    // setting new Controls
    props.setControls({
      target: newTarget.toArray(),
    });
  }
}

export default ControlsMap;
