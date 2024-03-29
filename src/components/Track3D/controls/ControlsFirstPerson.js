import * as THREE from "three";
import _ from "lodash";

import ControlsBase from "./ControlsBase";

import { PointerLockControls } from "./threejs/PointerLockControls";

// TODO: move things from context to options
// TODO: use dispatch in controls instead of using the props actions

class ControlsFirstPerson extends ControlsBase {
  constructor(options) {
    super(options);

    let { renderer, camera, context, props } = options;
    this.camera = camera;
    this.renderer = renderer;
    this.context = context;

    this.animate = this.animate.bind(this);
    this.requestAnimate = this.requestAnimate.bind(this);
    this.onFirstPersonLock = this.onFirstPersonLock.bind(this);
    this.enterFirstPersonControls = this.enterFirstPersonControls.bind(this);
    this.onKeyDownFP = this.onKeyDownFP.bind(this);
    this.onKeyUpFP = this.onKeyUpFP.bind(this);
    this._storeCamera = _.throttle(this._storeCamera.bind(this), 50, {
      leading: false,
      trailing: true,
    });

    this.eyeHeight = props.settings.track3D.eyeHeight;

    this.setupControls();
  }

  setupControls() {
    // set to ground level
    let newCameraPosition = this.camera.position.toArray();
    newCameraPosition[1] = this.eyeHeight;
    this.camera.position.fromArray(newCameraPosition);

    this.controls = new PointerLockControls(
      this.camera,
      this.renderer.domElement.parentNode
    );

    this.controls.addEventListener("lock", this.onFirstPersonLock);

    this.controls.addEventListener("unlock", this.onFirstPersonUnlock);

    this.controls.addEventListener("change", this.requestAnimate);

    // this.scene.add( this.controls.getObject() ); // Camera already added

    this.controlsFP = {
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      canJump: false,
      prevTime: performance.now(),
      velocity: new THREE.Vector3(),
      direction: new THREE.Vector3(),
      keysDown: 0,
    };
  }

  syncProps(prevProps, nextProps) {
    this.eyeHeight = nextProps.settings.track3D.eyeHeight;
    if (
      prevProps.settings.track3D.eyeHeight !==
      nextProps.settings.track3D.eyeHeight
    ) {
      this.controlsFP.velocity.y = 0;
      this.camera.position.y = this.eyeHeight;
      this.controlsFP.canJump = true;
      this.renderer.render(this.context.scene, this.camera);
    }
    this.props = nextProps;
  }

  _storeCamera() {
    // persist camera/controls changes to the store
    this.context.props.setCamera({
      position: this.camera.position.toArray(),
      rotation: this.camera.rotation.toArray(),
    });
  }

  onFirstPersonLock = () => {
    document.addEventListener("keydown", this.onKeyDownFP, false);
    document.addEventListener("keyup", this.onKeyUpFP, false);

    this.context.setState({
      firstPersonControlsActive: true,
    });
  };

  onFirstPersonUnlock = () => {
    document.removeEventListener("keydown", this.onKeyDownFP, false);
    document.removeEventListener("keyup", this.onKeyUpFP, false);

    // persist camera/controls changes to the store
    this.context.props.setCamera({
      position: this.camera.position.toArray(),
      rotation: this.camera.rotation.toArray(),
    });

    this.context.setState({
      firstPersonControlsActive: false,
    });
  };

  enterFirstPersonControls() {
    this.controls.lock();
  }

  animate() {
    this.updateFirstPersonControlsBasedOnKeys();

    if (
      this.controls.isLocked &&
      (this.controlsFP.keysDown > 0 || !this.controlsFP.canJump)
    ) {
      // if we are pressing buttons or we can't jump yet (haven't landed)
      // we request another animation frame
      this.animationRequest = requestAnimationFrame(this.animate);
    } else {
      this.animationRequest = null;
    }

    this.renderer.render(this.context.scene, this.camera);
    this._storeCamera();
  }

  updateFirstPersonControlsBasedOnKeys() {
    let cfp = this.controlsFP;

    let keysDown =
      cfp.moveForward || cfp.moveBackward || cfp.moveLeft || cfp.moveRight;

    if (this.controls.isLocked === true) {
      var time = performance.now();
      var delta = (time - cfp.prevTime) / 1000; // t in seconds

      delta = Math.min(0.1, delta);

      let counterForce = Math.min(10.0 * delta, 1);

      cfp.velocity.x -= cfp.velocity.x * counterForce;
      cfp.velocity.z -= cfp.velocity.z * counterForce;

      cfp.velocity.y -= 9.8 * 10.0 * delta; // 100.0 = mass

      if (keysDown) {
        cfp.direction.z = Number(cfp.moveForward) - Number(cfp.moveBackward);
        cfp.direction.x = Number(cfp.moveRight) - Number(cfp.moveLeft);
        cfp.direction.normalize(); // this ensures consistent movements in all directions
      }

      if (cfp.moveForward || cfp.moveBackward)
        cfp.velocity.z -= cfp.direction.z * 200.0 * delta;
      if (cfp.moveLeft || cfp.moveRight)
        cfp.velocity.x -= cfp.direction.x * 200.0 * delta;

      this.controls.moveRight(-cfp.velocity.x * delta);
      this.controls.moveForward(-cfp.velocity.z * delta);

      this.controls.getObject().position.y += cfp.velocity.y * delta; // new behavior

      if (this.controls.getObject().position.y < this.eyeHeight) {
        cfp.velocity.y = 0;
        this.controls.getObject().position.y = this.eyeHeight;

        cfp.canJump = true;
      }

      cfp.prevTime = time;
    }
  }

  onKeyDownFP(evt) {
    this.controlsFP.keysDown++;
    this.controlsFP.prevTime = performance.now();

    switch (evt.keyCode) {
      case 38: // up
      case 87: // w
        this.controlsFP.moveForward = true;
        break;

      case 37: // left
      case 65: // a
        this.controlsFP.moveLeft = true;
        break;

      case 40: // down
      case 83: // s
        this.controlsFP.moveBackward = true;
        break;

      case 39: // right
      case 68: // d
        this.controlsFP.moveRight = true;
        break;

      case 32: // space
        if (this.controlsFP.canJump === true) this.controlsFP.velocity.y += 20;
        this.controlsFP.canJump = false;
        break;
      default:
        break;
    }

    this.requestAnimate();
  }

  onKeyUpFP(evt) {
    this.controlsFP.keysDown--;

    switch (evt.keyCode) {
      case 38: // up
      case 87: // w
        this.controlsFP.moveForward = false;
        break;

      case 37: // left
      case 65: // a
        this.controlsFP.moveLeft = false;
        break;

      case 40: // down
      case 83: // s
        this.controlsFP.moveBackward = false;
        break;

      case 39: // right
      case 68: // d
        this.controlsFP.moveRight = false;
        break;

      default:
        break;
    }
  }

  destroy() {
    this._storeCamera.flush();
    this.controls.dispose();
    this.controls = null;

    this.renderer.domElement.removeEventListener("keydown", this.onKeyDownFP);
    this.renderer.domElement.removeEventListener("keyup", this.onKeyUpFP);

    if (this.animationRequest) {
      cancelAnimationFrame(this.animationRequest);
      this.animationRequest = null;
    }
  }
}

export default ControlsFirstPerson;
