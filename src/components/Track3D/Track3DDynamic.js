import React from 'react';
import { connect } from 'react-redux';
import * as THREE from 'three';
import _ from 'lodash';

import Track3DMarkings from './Track3DMarkings';
import Track3DPackMarkings from './Track3DPackMarkings';
import Track3DSkaters from './Track3DSkaters';
import Track3DFloor from './Track3DFloor';
import PointerLockInstructions from '../PointerLockInstructions/PointerLockInstructions';
import VRButton from '../VRButton/VRButton';

import { selectGeneralSettings } from '../../app/reducers/settingsGeneralSlice';
import {
  setCamera,
  setControls,
  setVRModeEnabled,
  selectTrack3DCamera,
  selectTrack3DControls,
  selectTrack3DVRModeEnabled,
  selectTrack3DControlMode,
  CONTROL_MODES,
  selectTrack3DMapControlsDampingEnabled
} from '../../app/reducers/settingsTrack3DSlice';

import ControlsMap from './controls/ControlsMap';
import ControlsFirstPerson from './controls/ControlsFirstPerson';

const GRAPHICS_QUALITY = 1;
const EYE_HEIGHT = 1.7;

class Track3DDynamic extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      firstPersonControlsActive: false,
      controlsInitialized: false
    }

    // TODO: rename props from parent and connect
    // to not use underscore from parent
    this.scene = props._scene;
    this.camera = props._camera;
    this.renderer= props.renderer;

    this.requestAnimate = this.requestAnimate.bind(this);
    this.animateXR = this.animateXR.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onSubcomponentUpdated = this.onSubcomponentUpdated.bind(this);
    this.onXRSessionEnded = this.onXRSessionEnded.bind(this);
    this.onXRSessionStarted = this.onXRSessionStarted.bind(this);

    window.track3d = this;  // For debugging purposes, make this available to window

  }

  componentDidMount() {

    this.updateCameraProps(this.props);
    this.setupControls(this.props.controlMode);

    // render first frame, no loop start
    this.requestAnimate();

    // add event listeners
    window.addEventListener('resize', this.onResize);
  }

  /*
  * Don't update if unnecessary things from setting.general changed
  * Still needed?
  */
  shouldComponentUpdate(nextProps, nextState) {
    this.syncWithNextProps(nextProps);

    if (this.state.firstPersonControlsActive !== nextState.firstPersonControlsActive) return true;
    if (this.state.controlsInitialized !== nextState.controlsInitialized) return true;
    if (this.didControlModeChange(nextProps)) return true;

    return false;
  }

  componentWillUnmount() {
    // Cleanup

    // cancel the loop before unmounting
    if (this.animationRequest) cancelAnimationFrame(this.animationRequest);
    this.destroyControls(this.props.controlMode);

    // remove event listeners
    window.removeEventListener('resize', this.onResize);
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

    if (this.didControlModeChange(nextProps)) {
      this.destroyControls(this.props.controlMode);
      this.switchToControls(nextProps.controlMode, nextProps);
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
    return this.props.settings.general.trackEditorVisible !== props.settings.general.trackEditorVisible || this.props.settings.general.track3DVisible !== props.settings.general.track3DVisible;
  }

  /**
   *  Check if current camera values are different to props.camera
   *
   * @param {object} props
   * @returns {boolean}
   */
  didCameraChange(props) {
    let val = _.difference(
      this.props.camera.position,
      props.camera.position).length > 0
      || _.difference(
        this.props.camera.rotation,
        props.camera.rotation).length > 0;
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
    })
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

  switchToControls(controlMode, nextProps) {
    switch(controlMode) {
      case CONTROL_MODES.MAP:
        ControlsMap.switchTo({ props: nextProps });
        break;
      default:
        break;
    }
  }

  setupControls(controlMode) {
    switch(controlMode) {
      case CONTROL_MODES.MAP:
        this.setupMapControls();
        break;
      case CONTROL_MODES.FIRST_PERSON:
        this.setupFirstPersonControls();
        break;
      default:
        break;
    }

    this.setState({
      controlsInitialized: controlMode
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
      throw new Error('Controls still initialized');
    }

    this.controls = new ControlsMap({
      renderer: this.renderer,
      camera: this.camera,
      context: this,
    })
    this.controls.update();
  }


  /**
   * Setup First Person Controls using Three.js Pointer Lock Controls
   */
  setupFirstPersonControls() {
    // redux dev double render
    if (this.controls && this.controls instanceof ControlsFirstPerson) return;
    if (this.controls) {
      throw new Error('Controls still initialized');
    }

    this.controls = new ControlsFirstPerson({
      renderer: this.renderer,
      camera: this.camera,
      context: this,
    });
  }


  requestAnimate() {
    this.controls.requestAnimate();
  }


  /**
   * Animation for when we started a VR Session
   */
  animateXR(t, xrFrame) {
    this.currentXRPose = xrFrame.getViewerPose( this.renderer.xr.getReferenceSpace() );

    this.renderer.render( this.scene, this.xrCamera );
  }

  initXRAnimationLoop() {
    this.renderer.setAnimationLoop(this.animateXR);
  }

  destroyXRAnimationLoop() {
    this.renderer.setAnimationLoop(null);
  }

  onXRSessionStarted(session) {
    session.addEventListener( 'end', this.onXRSessionEnded );

    this.initXRAnimationLoop();
    this.renderer.xr.setSession( session );

    // set our viewer (head) position to that of the camera
    let currCamRot = this.camera.rotation.clone().reorder('YXZ');

    // this.xrCamera.rotation.fromArray(this.props.camera.rotation);
    this.viewerXR.position.fromArray(this.camera.position.toArray());
    this.viewerXR.rotation.fromArray([0, currCamRot.y, 0, 'YXZ']); // starting view of our VR session (just the Y rotation)

    this.currentXRSession = session;
  }

  onXRSessionEnded() {
    this.currentXRSession.removeEventListener( 'end', this.onXRSessionEnded );

    let poseRotation = new THREE.Euler();
    let {x, y, z, w} = this.currentXRPose.transform.orientation;
    poseRotation.setFromQuaternion(new THREE.Quaternion(x, y, z, w));
    poseRotation.reorder('YXZ');

    // Attention: poseRotation.y is inverted

    let currCamRot = this.camera.rotation.clone().reorder('YXZ');

    let newRotation = [
      poseRotation.x,
      currCamRot.y + poseRotation.y,  // starting yRot + what we rotated during xr session
      0,  // no roll
      'YXZ'
    ];

    let newPosition = this.viewerXR.position; // we will probably move viewer later so we can walk through the XR-scape

    // look ahead onto the floor with m=1.7/10
    let m = EYE_HEIGHT/10;
    let aheadDist = newPosition.y / m;

    let toNewTarget = (new THREE.Vector3(0, 0, -aheadDist)).applyEuler(new THREE.Euler(0, newRotation[1], 0, 'YXZ')); // rotate around center, yes?
    let newTarget = toNewTarget.add(new THREE.Vector3(newPosition.x, 0, newPosition.z)); // add to new position

    this.destroyXRAnimationLoop();
    this.currentXRSession = null;

    // don't set before animation loop got destroyed
    this.props.setCamera({
      position: newPosition.toArray(),
      rotation: newRotation,
    });

    this.props.setControls({
      target: newTarget.toArray()
    });

    // exited the vr mode
    this.props.setVRModeEnabled(false);
  }

  startXRSession() {
    if ( this.currentXRSession === null ) {
      // features need to be requested on session start
      // var sessionInit = {
      //   optionalFeatures: [ 'local-floor', 'bounded-floor' ]
      // };
      // navigator.xr.requestSession( 'immersive-vr', sessionInit ).then( this.onXRSessionStarted );
      navigator.xr.requestSession( 'immersive-vr' ).then( this.onXRSessionStarted );
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

  updateRendererSize() {
    if (this.renderer) {
      let container = this.renderer.domElement;
      let bbox = container.getBoundingClientRect();

      this.renderer.setSize(
        Math.round(bbox.width * GRAPHICS_QUALITY),
        Math.round(bbox.height * GRAPHICS_QUALITY),
        false // prevent inline style attribute on the renderer
      );
    }
  }

  onResize() {
    this.updateCamera();
    this.updateRendererSize();
    
    this.requestAnimate();
  }

  onSubcomponentUpdated() {
    this.requestAnimate();
  }

  render() {
    return (
      <>
        <Track3DFloor scene={this.scene} />
        <Track3DMarkings scene={this.scene} />
        <Track3DPackMarkings
          scene={this.scene}
          onUpdate={this.onSubcomponentUpdated}
        />
        <Track3DSkaters
          scene={this.scene}
          onSkaterUpdated={this.onSubcomponentUpdated}
        />
        <VRButton renderer={this.renderer} />

        { (this.state.controlsInitialized === CONTROL_MODES.FIRST_PERSON &&
          !this.state.firstPersonControlsActive) ? (
          <PointerLockInstructions onClick={this.controls.enterFirstPersonControls} />
        ) : null }
      </>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    settings: {
      general: selectGeneralSettings(state),
    },
    camera: selectTrack3DCamera(state),
    controls: selectTrack3DControls(state),
    controlMode: selectTrack3DControlMode(state),
    vrModeEnabled: selectTrack3DVRModeEnabled(state),
    mapControlsDampingEnabled: selectTrack3DMapControlsDampingEnabled(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setCamera: ({ position, rotation }) => dispatch(setCamera({ position, rotation })),
    setControls: ({ target }) => dispatch(setControls({ target })),
    setVRModeEnabled: (val) => dispatch(setVRModeEnabled(val))
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Track3DDynamic);