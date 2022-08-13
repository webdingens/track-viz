import * as THREE from "three";
import _ from "lodash";

import ControlsBase from "./ControlsBase";
import GamepadManager from "./gamepad/GamepadManager";

import {
  EYE_HEIGHT_MIN,
  EYE_HEIGHT_MAX,
  EYE_HEIGHT_STEP,
} from "../../../app/reducers/settingsTrack3DSlice";

const PI_2 = Math.PI / 2;

// TODO: move things from context to options
// TODO: use dispatch in controls instead of using the props actions

class ControlsGamepad extends ControlsBase {
  constructor(options) {
    super(options);

    let { renderer, camera, context, props } = options;
    this.camera = camera;
    this.renderer = renderer;
    this.context = context;
    this.props = props;

    this.animate = this.animate.bind(this);
    this.requestAnimate = this.requestAnimate.bind(this);
    this.onButtonPress = this.onButtonPress.bind(this);
    this.controlLoop = this.controlLoop.bind(this);
    this._storeCamera = _.throttle(this._storeCamera.bind(this), 50, {
      leading: false,
      trailing: true,
    });

    this.vec = new THREE.Vector3();

    this.eyeHeight = props.settings.track3D.eyeHeight;
    this.axisThreshold = props.settings.track3D.gamepadThreshold;

    this.setupControls();
  }

  setupControls() {
    // set to ground level
    let newCameraPosition = this.camera.position.toArray();
    newCameraPosition[1] = this.eyeHeight;
    this.camera.position.fromArray(newCameraPosition);

    this.onButtonPressUnsubscribe = GamepadManager.on(
      "button_press",
      this.onButtonPress
    ).unsubscribe;

    this.controlsFP = {
      canJump: false,
      prevTime: performance.now(),
      velocity: new THREE.Vector3(),
      direction: new THREE.Vector3(),
      axisActive: false,
      buttonActive: false,
      needsUpdate: false,
    };
    this.animate();

    if (GamepadManager.getGamepads().length) {
      this.controlLoop();
    } else {
      GamepadManager.on("connect", () => this.controlLoop());
    }
  }

  syncProps(prevProps, nextProps) {
    this.eyeHeight = nextProps.settings.track3D.eyeHeight;
    this.axisThreshold = nextProps.settings.track3D.gamepadThreshold;
    GamepadManager.threshold = this.axisThreshold;

    if (
      prevProps.settings.track3D.eyeHeight !==
        nextProps.settings.track3D.eyeHeight ||
      prevProps.settings.track3D.gamepadThreshold !==
        nextProps.settings.track3D.gamepadThreshold
    ) {
      this.needsUpdate = true;
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

  onButtonPress(e) {
    switch (e.detail.index) {
      case 3: // reduce eye height (X)
        this.props.setTrack3DSetting({
          key: "eyeHeight",
          value: Math.min(EYE_HEIGHT_MAX, this.eyeHeight + EYE_HEIGHT_STEP),
        });
        break;
      case 2: // increase eye height (Y)
        this.props.setTrack3DSetting({
          key: "eyeHeight",
          value: Math.max(EYE_HEIGHT_MIN, this.eyeHeight - EYE_HEIGHT_STEP),
        });
        break;
      case 0: // space
        if (this.controlsFP.canJump === true) this.controlsFP.velocity.y += 20;
        this.controlsFP.canJump = false;
        break;
      default:
        break;
    }
  }

  controlLoop() {
    this.controlLoopRequest = requestAnimationFrame(this.controlLoop);
    if (this.handleInput()) {
      this.animate();
    }
  }

  animate() {
    this.renderer.render(this.context.scene, this.camera);

    this.animationRequest = null;
    this._storeCamera();
  }

  moveForward(distance) {
    // from threejs pointer lock controls
    this.vec.setFromMatrixColumn(this.camera.matrix, 0);
    this.vec.crossVectors(this.camera.up, this.vec);
    this.camera.position.addScaledVector(this.vec, distance);
  }

  moveRight(distance) {
    // from threejs pointer lock controls
    this.vec.setFromMatrixColumn(this.camera.matrix, 0);
    this.camera.position.addScaledVector(this.vec, distance);
  }

  handleInput() {
    const cfp = this.controlsFP;

    const gamepad = GamepadManager.getActiveGamepad();
    cfp.buttonActive = GamepadManager.isButtonActive(gamepad);
    cfp.axisActive = GamepadManager.isAxisActive(gamepad);
    let axesActive;

    if (
      cfp.buttonActive ||
      cfp.axisActive ||
      this.needsUpdate ||
      !cfp.canJump
    ) {
      var time = performance.now();
      var delta = (time - cfp.prevTime) / 1000; // t in seconds

      delta = Math.min(0.1, delta);

      // update position

      let counterForce = Math.min(10.0 * delta, 1);

      cfp.velocity.x -= cfp.velocity.x * counterForce;
      cfp.velocity.z -= cfp.velocity.z * counterForce;

      cfp.velocity.y -= 9.8 * 10.0 * delta; // 100.0 = mass

      if (gamepad) {
        axesActive = gamepad.axes.map(
          (axis) => Math.abs(axis) > this.axisThreshold
        );

        if (cfp.axisActive) {
          let dirZ = axesActive[1] ? -gamepad.axes[1] : 0;
          if (dirZ < 0) {
            dirZ += this.axisThreshold;
          } else if (dirZ > 0) {
            dirZ -= this.axisThreshold;
          }
          let dirX = axesActive[0] ? gamepad.axes[0] : 0;
          if (dirX < 0) {
            dirX += this.axisThreshold;
          } else if (dirX > 0) {
            dirX -= this.axisThreshold;
          }
          cfp.direction.z = dirZ;
          cfp.direction.x = dirX;
        }

        if (axesActive[1]) cfp.velocity.z -= cfp.direction.z * 80.0 * delta;
        if (axesActive[0]) cfp.velocity.x -= cfp.direction.x * 80.0 * delta;

        if (axesActive[2] || axesActive[3]) {
          let dirX = axesActive[2] ? gamepad.axes[2] : 0;
          if (dirX < 0) {
            dirX += this.axisThreshold;
          } else if (dirX > 0) {
            dirX -= this.axisThreshold;
          }
          let dirY = axesActive[3] ? gamepad.axes[3] : 0;
          if (dirY < 0) {
            dirY += this.axisThreshold;
          } else if (dirY > 0) {
            dirY -= this.axisThreshold;
          }
          const euler = new THREE.Euler(0, 0, 0, "YXZ");
          euler.setFromQuaternion(this.camera.quaternion);
          euler.y -= dirX * 0.05;
          euler.x -= dirY * 0.05;

          euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));
          this.camera.quaternion.setFromEuler(euler);
        }
      }

      this.moveRight(-cfp.velocity.x * delta);
      this.moveForward(-cfp.velocity.z * delta);

      this.camera.position.y += cfp.velocity.y * delta;

      if (this.camera.position.y !== this.eyeHeight && cfp.canJump) {
        this.camera.position.y = this.eyeHeight;
      }

      if (this.camera.position.y < this.eyeHeight) {
        cfp.velocity.y = 0;
        this.camera.position.y = this.eyeHeight;

        cfp.canJump = true;
      }

      cfp.prevTime = time;
      this.needsUpdate = false;

      return true;
    }
    return false;
  }

  destroy() {
    this._storeCamera.flush();
    this.onButtonPressUnsubscribe();
    if (this.animationRequest) {
      cancelAnimationFrame(this.animationRequest);
      this.animationRequest = null;
    }
  }
}

export default ControlsGamepad;
