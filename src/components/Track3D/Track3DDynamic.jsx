import React from "react";
import { connect } from "react-redux";
import _ from "lodash";

import Track3DMarkings from "./Track3DMarkings";
import Track3DPackMarkings from "./Track3DPackMarkings";
import Track3DSkaters from "./Track3DSkaters";
import Track3DFloor from "./Track3DFloor";
import PointerLockInstructions from "../PointerLockInstructions/PointerLockInstructions";
import VRButton from "../VRButton/VRButton";
import Track3DOverlay from "./Track3DOverlay";
import Track3DWalls from "./Track3DWalls";

import { selectGeneralSettings } from "../../app/reducers/settingsGeneralSlice";
import {
  setCamera,
  setControls,
  setVRModeEnabled,
  setSetting as setTrack3DSetting,
  selectTrack3DCamera,
  selectTrack3DControls,
  selectTrack3DVRModeEnabled,
  selectTrack3DControlMode,
  CONTROL_MODES,
  selectTrack3DMapControlsDampingEnabled,
  selectTrack3DGraphicsQuality,
  selectTrack3DShowWalls,
  selectTrack3DSettings,
} from "../../app/reducers/settingsTrack3DSlice";

import ControlsMap from "./controls/ControlsMap";
import ControlsDrag from "./controls/ControlsDrag";
import ControlsFirstPerson from "./controls/ControlsFirstPerson";
import ControlsXR from "./controls/ControlsXR";
import ControlsGamepad from "./controls/ControlsGamepad";
// import Track3DSceneExportButton from './Track3DSceneExportButton';

class Track3DDynamic extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      firstPersonControlsActive: false,
      controlsInitialized: false,
    };

    // TODO: rename props from parent and connect
    // to not use underscore from parent
    this.scene = props._scene;
    this.camera = props._camera;
    this.renderer = props.renderer;

    this.requestAnimate = this.requestAnimate.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onSubcomponentUpdated = this.onSubcomponentUpdated.bind(this);
    this.onXRSessionEnded = this.onXRSessionEnded.bind(this);
    this.onXRSessionStarted = this.onXRSessionStarted.bind(this);

    window.track3d = this; // For debugging purposes, make this available to window
  }

  componentDidMount() {
    this.updateCameraProps(this.props);
    this.setupControls(this.props.controlMode);
    this.initWebXR();

    // render first frame, no loop start
    this.requestAnimate();

    // add event listeners
    window.addEventListener("resize", this.onResize);
  }

  /*
   * Don't update if unnecessary things from setting.general changed
   * Still needed?
   */
  shouldComponentUpdate(nextProps, nextState) {
    this.syncWithNextProps(nextProps);

    // quality change
    if (nextProps.graphicsQuality !== this.props.graphicsQuality) {
      this.updateRendererSize(nextProps);
      this.requestAnimate();
    }
    if (
      this.props.settings.general.trackEditorVisible !==
      nextProps.settings.general.trackEditorVisible
    ) {
      // wait for dom update (two panel layout is further up in the tree)
      requestAnimationFrame(() => this.onResize());
    }

    if (
      this.state.firstPersonControlsActive !==
      nextState.firstPersonControlsActive
    ) {
      return true;
    }

    if (this.state.controlsInitialized !== nextState.controlsInitialized)
      return true;

    if (this.didControlModeChange(nextProps)) return true;

    if (this.props.showWalls !== nextProps.showWalls) return true;

    return false;
  }

  componentDidUpdate(prevProps) {
    if (this.props.showWalls !== prevProps.showWalls) this.requestAnimate();
  }

  componentWillUnmount() {
    // Cleanup

    // cancel the loop before unmounting
    if (this.animationRequest) cancelAnimationFrame(this.animationRequest);
    this.destroyControls(this.props.controlMode);

    // remove event listeners
    window.removeEventListener("resize", this.onResize);
  }

  //
  //  Sync props for the renderer
  //
  syncWithNextProps(nextProps) {
    // Split View has changed
    if (this.didEditorVisibilitiesChange(nextProps)) {
      this.onResize();
    }

    if (this.didCameraChange(nextProps)) {
      this.updateCameraProps(nextProps);
      this.requestAnimate();
    }

    if (this.controls) this.controls.syncProps(this.props, nextProps);
    if (this.controlsXR) this.controlsXR.syncProps(this.props, nextProps);

    if (this.didControlModeChange(nextProps)) {
      this.destroyControls(this.props.controlMode);

      // next two run a state and props change at the same time
      this.switchToControls(nextProps.controlMode);
      this.setupControls(nextProps.controlMode);

      this.requestAnimate();
    }

    // start/stop xr session if toggled
    if (this.didVRModeEnabledChange(nextProps)) {
      if (nextProps.vrModeEnabled) {
        this.startXRSession();
      } else {
        this.stopXRSession();
      }
    }
  }

  //
  //
  //        PROPERTY UPDATES
  //
  //

  /**
   *  Check if user changed the split view settings
   *
   * @param {object} props
   * @returns {boolean}
   */
  didEditorVisibilitiesChange(props) {
    return (
      this.props.settings.general.trackEditorVisible !==
        props.settings.general.trackEditorVisible ||
      this.props.settings.general.track3DVisible !==
        props.settings.general.track3DVisible ||
      this.props.settings.general.sequenceEditorVisible !==
        props.settings.general.sequenceEditorVisible
    );
  }

  /**
   *  Check if current camera values are different to props.camera
   *
   * @param {object} props
   * @returns {boolean}
   */
  didCameraChange(props) {
    let val =
      _.difference(this.props.camera.position, props.camera.position).length >
        0 ||
      _.difference(this.props.camera.rotation, props.camera.rotation).length >
        0;
    return val;
  }

  /**
   *  Copy values from store to camera
   */
  updateCameraProps(props) {
    // move camera back so we can see the lines
    this.camera.position.fromArray(props.camera.position);
    let rot = props.camera.rotation;
    rot.map((el, idx) => {
      if (idx < 3 && isNaN(el)) return 0;
      return el;
    });
    this.camera.rotation.fromArray(rot);
  }

  /**
   *  Check if our Control Mode Changed
   *
   * @param {object} props
   * @returns {boolean}
   */
  didControlModeChange(props) {
    return this.props.controlMode !== props.controlMode;
  }

  /**
   *  Check if vrModeEnabled is different in props
   *
   * @param {object} props
   * @returns {boolean}
   */
  didVRModeEnabledChange(props) {
    return this.props.vrModeEnabled !== props.vrModeEnabled;
  }

  //
  //
  //      CONTROLS
  //
  //
  switchToControls(controlMode) {
    switch (controlMode) {
      case CONTROL_MODES.MAP:
        ControlsMap.switchTo({ props: this.props });
        break;
      default:
        break;
    }
  }

  setupControls(controlMode) {
    switch (controlMode) {
      case CONTROL_MODES.MAP:
        this.setupMapControls();
        break;
      case CONTROL_MODES.FIRST_PERSON:
        this.setupFirstPersonControls();
        break;
      case CONTROL_MODES.DRAG:
        this.setupDragControls();
        break;
      case CONTROL_MODES.GAMEPAD:
        this.setupGamepadControls();
        break;
      default:
        break;
    }

    this.setState({
      controlsInitialized: controlMode,
    });
  }

  destroyControls() {
    if (this.controls) this.controls.destroy();
    this.controls = null;
  }

  /**
   * Map Controls Setup (from the three.js examples)
   */
  setupMapControls() {
    // redux dev double render debug
    if (this.controls && this.controls instanceof ControlsMap) {
      return;
    }
    if (this.controls) {
      throw new Error("Controls still initialized");
    }

    this.controls = new ControlsMap({
      renderer: this.renderer,
      camera: this.camera,
      context: this,
    });
    this.controls.update();
  }

  /**
   * Setup First Person Controls using Three.js Pointer Lock Controls
   */
  setupFirstPersonControls() {
    // redux dev double render
    if (this.controls && this.controls instanceof ControlsFirstPerson) return;
    if (this.controls) {
      throw new Error("Controls still initialized");
    }

    this.controls = new ControlsFirstPerson({
      renderer: this.renderer,
      camera: this.camera,
      context: this,
      props: this.props,
    });
  }

  setupDragControls() {
    // redux dev double render debug
    if (this.controls && this.controls instanceof ControlsDrag) {
      return;
    }
    if (this.controls) {
      throw new Error("Controls still initialized");
    }

    this.controls = new ControlsDrag({
      renderer: this.renderer,
      camera: this.camera,
      context: this,
    });
  }

  setupGamepadControls() {
    // redux dev double render debug
    if (this.controls && this.controls instanceof ControlsGamepad) {
      return;
    }
    if (this.controls) {
      throw new Error("Controls still initialized");
    }

    this.controls = new ControlsGamepad({
      renderer: this.renderer,
      camera: this.camera,
      context: this,
      props: this.props,
    });
  }

  requestAnimate() {
    if (this.controls) this.controls.requestAnimate();
  }

  initWebXR() {
    // Web XR
    this.renderer.xr.enabled = true;
    // this.renderer.xr.setReferenceSpaceType( 'local' );
    this.currentXRSession = null;
  }

  /**
   * Animation for when we started a VR Session
   */
  onXRSessionStarted(session) {
    this.destroyControls();
    this.controlsXR = new ControlsXR({
      renderer: this.renderer,
      camera: this.camera,
      context: this,
      session,
      onSessionEnded: this.onXRSessionEnded,
      props: this.props,
    });
    this.currentXRSession = session;
    this.xrSessionRequested = false;
  }

  onXRSessionEnded() {
    console.log("ended");
    this.controlsXR = null;
    this.currentXRSession = null;
    this.props.setVRModeEnabled(false);

    // reset camera
    this.switchToControls(this.props.controlMode);
    this.setupControls(this.props.controlMode);
    this.requestAnimate();
  }

  startXRSession() {
    if (this.currentXRSession === null && !this.xrSessionRequested) {
      // features need to be requested on session start
      let sessionInit = {
        optionalFeatures: ["local-floor", "bounded-floor"],
      };
      navigator.xr
        .requestSession("immersive-vr", sessionInit)
        .then(this.onXRSessionStarted);
      // navigator.xr.requestSession( 'immersive-vr' ).then( this.onXRSessionStarted );
      this.xrSessionRequested = true;
    }
  }

  stopXRSession() {
    if (this.currentXRSession === null) return;
    this.currentXRSession.end();
  }

  updateCamera() {
    if (this.camera && this.renderer) {
      let container = this.renderer.domElement;
      let bbox = container.getBoundingClientRect();
      this.camera.aspect = bbox.width / bbox.height;
      this.camera.updateProjectionMatrix();
    }
  }

  updateRendererSize(props) {
    if (this.renderer) {
      let container = this.renderer.domElement;
      let bbox = container.getBoundingClientRect();

      this.renderer.setSize(
        Math.round(bbox.width * props.graphicsQuality),
        Math.round(bbox.height * props.graphicsQuality),
        false // prevent inline style attribute on the renderer
      );
    }
  }

  onResize() {
    this.updateCamera();
    this.updateRendererSize(this.props);

    this.requestAnimate();
  }

  onSubcomponentUpdated() {
    this.requestAnimate();
  }

  render() {
    return (
      <>
        <Track3DFloor
          scene={this.scene}
          renderer={this.renderer}
          onUpdate={this.onSubcomponentUpdated}
        />

        {this.props.showWalls ? (
          <Track3DWalls
            scene={this.scene}
            renderer={this.renderer}
            onUpdate={this.onSubcomponentUpdated}
          />
        ) : null}

        <Track3DMarkings scene={this.scene} />
        <Track3DPackMarkings
          scene={this.scene}
          onUpdate={this.onSubcomponentUpdated}
        />
        <Track3DSkaters
          scene={this.scene}
          onSkaterUpdated={this.onSubcomponentUpdated}
        />
        {!this.state.firstPersonControlsActive ? (
          <VRButton renderer={this.renderer} />
        ) : null}

        {this.state.controlsInitialized === CONTROL_MODES.FIRST_PERSON &&
        !this.state.firstPersonControlsActive ? (
          <PointerLockInstructions
            onClick={this.controls.enterFirstPersonControls}
          />
        ) : null}

        {!this.state.firstPersonControlsActive ? (
          <Track3DOverlay renderer={this.renderer} />
        ) : null}

        {/* <Track3DSceneExportButton scene={this.scene} /> */}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    settings: {
      general: selectGeneralSettings(state),
      track3D: selectTrack3DSettings(state),
    },
    camera: selectTrack3DCamera(state),
    controls: selectTrack3DControls(state),
    controlMode: selectTrack3DControlMode(state),
    vrModeEnabled: selectTrack3DVRModeEnabled(state),
    mapControlsDampingEnabled: selectTrack3DMapControlsDampingEnabled(state),
    graphicsQuality: selectTrack3DGraphicsQuality(state),
    showWalls: selectTrack3DShowWalls(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setCamera: ({ position, rotation }) =>
      dispatch(setCamera({ position, rotation })),
    setControls: ({ target }) => dispatch(setControls({ target })),
    setVRModeEnabled: (val) => dispatch(setVRModeEnabled(val)),
    setTrack3DSetting: (val) => dispatch(setTrack3DSetting(val)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Track3DDynamic);
