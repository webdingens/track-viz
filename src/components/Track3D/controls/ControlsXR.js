import * as THREE from "three";

import ControlsBase from "./ControlsBase";
import GamepadManager from "./gamepad/GamepadManager";

import {
  EYE_HEIGHT_MIN,
  EYE_HEIGHT_MAX,
  EYE_HEIGHT_STEP,
} from "../../../app/reducers/settingsTrack3DSlice";

// TODO: move things from context to options
// TODO: use dispatch in controls instead of using the props actions

class ControlsXR extends ControlsBase {
  constructor(options) {
    super(options);

    let { renderer, camera, context, session, onSessionEnded, props } = options;
    this.renderer = renderer;
    this.camera = camera;
    this.context = context;
    this.session = session;
    this.onSessionEnded = onSessionEnded;
    this.props = props;

    this.animateXR = this.animateXR.bind(this);
    this.requestAnimate = this.requestAnimate.bind(this);
    this._onSessionEnded = this._onSessionEnded.bind(this);
    this.onKeyDownFP = this.onKeyDownFP.bind(this);
    this.onKeyUpFP = this.onKeyUpFP.bind(this);

    this.vec = new THREE.Vector3();

    this.eyeHeight = props.settings.track3D.eyeHeight;
    this.axisThreshold = props.settings.track3D.gamepadThreshold;

    this.setupControls();

    this.buttonsPressed = null;

    window.ctrlxr = this;
  }

  setupControls() {
    // init camera
    this.viewerXR = new THREE.Group(); // Viewer, aka. skater, aka. person
    this.xrCamera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.viewerXR.add(this.xrCamera);

    this.context.scene.add(this.viewerXR);

    this.renderer.setAnimationLoop(this.animateXR);
    this.renderer.xr.setSession(this.session);
    // this.renderer.xr.setReferenceSpaceType("viewer"); // TODO: test with vr headset

    this.renderer.xr.addEventListener("sessionend", this._onSessionEnded);

    // set our viewer (head) position to that of the camera
    let currCamRot = this.camera.rotation.clone().reorder("YXZ");
    let currCamPos = this.camera.position.toArray();
    currCamPos[1] = 30;

    this.viewerXR.position.fromArray(currCamPos);
    this.viewerXR.rotation.fromArray([0, currCamRot.y, 0, "YXZ"]); // starting view of our VR session (just the Y rotation)

    this.currentXRSession = this.session;

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
      axisActive: false,
      buttonActive: false,
    };

    window.addEventListener("keydown", this.onKeyDownFP, false);
    window.addEventListener("keyup", this.onKeyUpFP, false);
  }

  syncProps(prevProps, nextProps) {
    this.eyeHeight = nextProps.settings.track3D.eyeHeight;
    this.axisThreshold = nextProps.settings.track3D.gamepadThreshold;
    GamepadManager.threshold = this.axisThreshold;
    this.props = nextProps;

    if (this.viewerXR) {
      this.controlsFP.velocity.y = 0;
      // TODO: disable subtraction of static reference space height for viewer headset
      this.viewerXR.position.y =
        this.eyeHeight - this.currentXRPose
          ? this.currentXRPose.transform.position.y
          : 0;
      this.controlsFP.canJump = true;
    }
  }

  _syncToState() {
    let poseRotation = new THREE.Euler();
    let { x, y, z, w } = this.currentXRPose.transform.orientation;
    poseRotation.setFromQuaternion(new THREE.Quaternion(x, y, z, w));
    poseRotation.reorder("YXZ");

    // Attention: poseRotation.y is inverted

    let currCamRot = this.camera.rotation.clone().reorder("YXZ");

    let newRotation = [
      poseRotation.x,
      currCamRot.y + poseRotation.y, // starting yRot + what we rotated during xr session
      0, // no roll
      "YXZ",
    ];

    let newPosition = this.viewerXR.position; // we will probably move viewer later so we can walk through the XR-scape
    newPosition[1] = this.eyeHeight;

    // don't set before animation loop got destroyed
    this.context.props.setCamera({
      position: newPosition.toArray(),
      rotation: newRotation,
    });
  }

  _onSessionEnded() {
    this._syncToState();
    this.destroy();
    this.onSessionEnded();
  }

  updateButtons() {
    const gamepad = GamepadManager.getActiveGamepad();
    const newButtonsPressed = gamepad ? gamepad.buttons : null;

    if (gamepad) {
      newButtonsPressed.forEach((button, idx) => {
        const pressedNow = button.pressed;
        const pressedPrev =
          this.buttonsPressed && this.buttonsPressed[idx].pressed;
        if (!pressedPrev && pressedNow) {
          // button_press
          switch (idx) {
            case 3: // reduce eye height (X)
              this.props.setTrack3DSetting({
                key: "eyeHeight",
                value: Math.min(
                  EYE_HEIGHT_MAX,
                  this.eyeHeight + EYE_HEIGHT_STEP
                ),
              });
              break;
            case 2: // increase eye height (Y)
              this.props.setTrack3DSetting({
                key: "eyeHeight",
                value: Math.max(
                  EYE_HEIGHT_MIN,
                  this.eyeHeight - EYE_HEIGHT_STEP
                ),
              });
              break;
            case 0: // space
              if (this.controlsFP.canJump === true)
                this.controlsFP.velocity.y += 20;
              this.controlsFP.canJump = false;
              break;
            default:
              break;
          }
        }

        if (pressedPrev && pressedNow) {
          // button_hold
        }

        if (pressedPrev && !pressedNow) {
          // button_release
        }
      });

      this.buttonsPressed = newButtonsPressed.map((button) => ({
        pressed: button.pressed,
      }));
    }

    // if we don't have an active gamepad but buttons were pressed previously
    if (!gamepad && this.buttonsPressed) {
      this.buttonsPressed.forEach((button) => {
        if (button.pressed) {
          // button_release
        }
        button.pressed = false;
      });
    }
  }

  handleInput() {
    let cfp = this.controlsFP;

    const gamepad = GamepadManager.getActiveGamepad();
    cfp.buttonActive = GamepadManager.isButtonActive(gamepad);
    cfp.axisActive = GamepadManager.isAxisActive(gamepad);
    let axesActive;

    let keysDown =
      cfp.moveForward || cfp.moveBackward || cfp.moveLeft || cfp.moveRight;

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

      if (cfp.moveForward || cfp.moveBackward)
        cfp.velocity.z -= cfp.direction.z * 200.0 * delta;
      if (cfp.moveLeft || cfp.moveRight)
        cfp.velocity.x -= cfp.direction.x * 200.0 * delta;
    } else if (gamepad) {
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
    }

    this.moveRight(-cfp.velocity.x * delta);
    this.moveForward(-cfp.velocity.z * delta);

    this.viewerXR.position.y += cfp.velocity.y * delta;

    if (
      this.viewerXR.position.y <
      this.eyeHeight - this.currentXRPose.transform.position.y
    ) {
      cfp.velocity.y = 0;
      this.viewerXR.position.y =
        this.eyeHeight - this.currentXRPose.transform.position.y;

      cfp.canJump = true;
    }

    // update camera rotation
    if (gamepad) {
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
        euler.setFromQuaternion(this.viewerXR.quaternion);
        euler.y -= dirX * 0.05;
        // vertical axis removed since it is controlled by the headset orientation
        this.viewerXR.quaternion.setFromEuler(euler);
      }
    }

    cfp.prevTime = time;
  }

  moveForward(distance) {
    // move forward parallel to the xz-plane
    // assumes camera.up is y-up

    this.vec.setFromMatrixColumn(this.viewerXR.matrix, 0);

    if (this.currentXRPose) {
      let { x, y, z, w } = this.currentXRPose.transform.orientation;
      this.vec.applyQuaternion(new THREE.Quaternion(x, y, z, w));
    }

    this.vec.crossVectors(this.viewerXR.up, this.vec);

    this.viewerXR.position.addScaledVector(this.vec, distance);
  }

  moveRight(distance) {
    this.vec.setFromMatrixColumn(this.viewerXR.matrix, 0);

    if (this.currentXRPose) {
      let { x, y, z, w } = this.currentXRPose.transform.orientation;
      this.vec.applyQuaternion(new THREE.Quaternion(x, y, z, w));
    }

    this.viewerXR.position.addScaledVector(this.vec, distance);
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

  animateXR(t, xrFrame) {
    if (xrFrame)
      this.currentXRPose = xrFrame.getViewerPose(
        this.renderer.xr.getReferenceSpace()
      );
    this.updateButtons();
    this.handleInput();
    // console.log("Frame Details");
    // console.dir(xrFrame);
    // console.log("referenceSpace: ", this.renderer.xr.getReferenceSpace());
    // console.dir(xrFrame.getViewerPose(this.renderer.xr.getReferenceSpace()));
    // console.dir(this.xrCamera.position);
    // console.dir(this.xrCamera.rotation);
    // console.dir(this.viewerXR);
    // console.dir(this.renderer.xr);

    this.renderer.render(this.context.scene, this.xrCamera);
  }

  destroy() {
    window.removeEventListener("keydown", this.onKeyDownFP, false);
    window.removeEventListener("keyup", this.onKeyUpFP, false);

    this.renderer.xr.removeEventListener("sessionend", this._onSessionEnded);
    this.context.scene.remove(this.viewerXR);
    this.renderer.setAnimationLoop(null);
    this.renderer.xr.setSession(null);
  }
}

export default ControlsXR;
