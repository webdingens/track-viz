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

import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from './controls/threejs/PointerLockControls';

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

const GRAPHICS_QUALITY = 1;
const EYE_HEIGHT = 1.7;

class Track3DDynamic extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      firstPersonControlsActive: false
    }

    // TODO: rename props from parent and connect
    // to not use underscore from parent
    this.scene = props._scene;
    this.camera = props._camera;
    this.renderer= props.renderer;

    // bind callbacks to instance
    this.animateFirstPerson = this.animateFirstPerson.bind(this);
    this.onKeyDownFP = this.onKeyDownFP.bind(this);
    this.onKeyUpFP = this.onKeyUpFP.bind(this);

    this.animateMap = this.animateMap.bind(this);
    this.animateMapWithDamping = this.animateMapWithDamping.bind(this);
    this.requestAnimateThrottled = this.requestAnimateThrottled.bind(this);
    this.animateXR = this.animateXR.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onSubcomponentUpdated = this.onSubcomponentUpdated.bind(this);
    this.onXRSessionEnded = this.onXRSessionEnded.bind(this);
    this.onXRSessionStarted = this.onXRSessionStarted.bind(this);
    this.onMapInteractionEnd = this.onMapInteractionEnd.bind(this);

    window.track3d = this;  // For debugging purposes, make this available to window
  }

  componentDidMount() {

    this.updateCameraProps(this.props);
    this.setupControls(this.props.controlMode);

    // render first frame, no loop start
    this.requestAnimateThrottled();

    // add event listeners
    window.addEventListener('resize', this.onResize);
  }

  /*
  * Don't update if unnecessary things from setting.general changed
  * Still needed?
  */
  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.firstPersonControlsActive !== nextState.firstPersonControlsActive) return true;

    this.syncWithNextProps(nextProps);
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
      this.requestAnimateThrottled();
    }

    if (this.didControlsChange(nextProps)) {
      this.updateControlsTarget(nextProps);
      this.requestAnimateThrottled();
    }

    if (this.didControlModeChange(nextProps)) {
      this.destroyControls(this.props.controlMode);
      this.switchToControls(nextProps.controlMode);
      this.setupControls(nextProps.controlMode);
      this.requestAnimateThrottled(null, nextProps);
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
   * Check if current controls values are different to props.controls
   * but only for map controls
   *
   * @param {object} props
   * @returns {boolean}
   */
  didControlsChange(props) {
    // only check map controls
    if (!this.controls
      || (this.controls && !this.controls.target)
      || (this.controls && !(this.controls instanceof MapControls)))
      return false;
  
    let val = _.difference(
      this.props.controls.target,
      props.controls.target).length > 0;
    return val;
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

  updateControlsTarget(props) {
    if (this.controls && this.controls instanceof MapControls) {
      this.controls.target.fromArray(props.controls.target);
    }
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

  switchToControls(controlMode) {
    switch(controlMode) {
      case CONTROL_MODES.MAP:
        this.switchToMapControls();
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
  }

  destroyControls(controlMode) {
    switch(controlMode) {
      case CONTROL_MODES.MAP:
        this.destroyMapControls();
        break;
      case CONTROL_MODES.FIRST_PERSON:
        this.destroyFirstPersonControls();
        break;
      default:
        break;
    }

    if (this.animationRequest) {
      cancelAnimationFrame(this.animationRequest);
      this.animationRequest = null;
    }
  }

  switchToMapControls() {
    // update target based on the current camera and
    // make camera look ahead onto the floor with a falloff of 1/5

    let camRot = new THREE.Euler(...this.props.camera.rotation).reorder('YXZ');

    let camPos = new THREE.Vector3(...this.props.camera.position); // we will probably move viewer later so we can walk through the XR-scape

    // look ahead onto the floor with m=1.7/6
    let m = 1.7/6;
    let aheadDist = camPos.y / m;

    let toNewTarget = (new THREE.Vector3(0, 0, -aheadDist)).applyEuler(new THREE.Euler(0, camRot.y, 0, 'YXZ')); // rotate around center, yes?
    let newTarget = toNewTarget.add(new THREE.Vector3(camPos.x, 0, camPos.z)); // add to new position

    // setting new Controls
    this.props.setControls({
      target: newTarget.toArray()
    });
  }


  /**
   * Map Controls Setup (from the three.js examples)
   */
  setupMapControls() {
    // redux dev double render debug
    if (this.controls && this.controls instanceof MapControls) {
      return;
    }
    if (this.controls) {
      throw new Error('Controls still initialized');
    }

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

  /**
   * Map Controls Destruction
   */
  destroyMapControls() {
    if (this.controls && this.controls instanceof MapControls) {
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

  /**
   * Setup First Person Controls using Three.js Pointer Lock Controls
   */
  setupFirstPersonControls() {
    // redux dev double render
    if (this.controls && this.controls instanceof PointerLockControls) return;

    // set to ground level
    // TODO: maybe set ground position in direction person is looking?
    let newCameraPosition = this.camera.position.toArray();
    newCameraPosition[1] = EYE_HEIGHT; // TODO: set to eyeheight setting
    this.camera.position.fromArray(newCameraPosition);

    this.controls = new PointerLockControls( this.camera, this.renderer.domElement.parentNode );

    this.controls.addEventListener('lock', this.onFirstPersonLock)

    this.controls.addEventListener('unlock', this.onFirstPersonUnlock)

    this.controls.addEventListener('change', this.requestAnimateThrottled)

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
      vertex: new THREE.Vector3(),
      color: new THREE.Color(),
      keysDown: 0,
    }
  }

  onFirstPersonLock = () => {
    document.addEventListener( 'keydown', this.onKeyDownFP, false );
    document.addEventListener( 'keyup', this.onKeyUpFP, false );

    this.setState({
      firstPersonControlsActive: true
    })
  }

  onFirstPersonUnlock = () => {
    document.removeEventListener( 'keydown', this.onKeyDownFP, false );
    document.removeEventListener( 'keyup', this.onKeyUpFP, false );

    this.setState({
      firstPersonControlsActive: false
    })
  }

  onKeyDownFP(evt) {
    this.controlsFP.keysDown++;
    this.controlsFP.prevTime = performance.now();

    switch ( evt.keyCode ) {

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
        if ( this.controlsFP.canJump === true ) this.controlsFP.velocity.y += 20;
        this.controlsFP.canJump = false;
        break;
      default:
        break;
    }

    this.requestAnimateThrottled();
  }

  onKeyUpFP(evt) {
    this.controlsFP.keysDown--;

    switch ( evt.keyCode ) {
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

  destroyFirstPersonControls() {
    if (this.controls && this.controls instanceof PointerLockControls) {

      this.controls.dispose();
      this.controls = null;
    }

    this.renderer.domElement.removeEventListener( 'keydown', this.onKeyDownFP );
    this.renderer.domElement.removeEventListener( 'keyup', this.onKeyUpFP );
  }

  enterFirstPersonControls() {
    this.controls.lock();
  }

  updateFirstPersonControlsBasedOnKeys() {
    let cfp = this.controlsFP;

    let keysDown = cfp.moveForward || cfp.moveBackward || cfp.moveLeft || cfp.moveRight;

    if ( this.controls.isLocked === true ) {

      var time = performance.now();
      var delta = ( time - cfp.prevTime ) / 1000; // t in seconds

      delta = Math.min(.1, delta);

      let counterForce = Math.min(10.0 * delta, 1);

      cfp.velocity.x -= cfp.velocity.x * counterForce;
      cfp.velocity.z -= cfp.velocity.z * counterForce;

      cfp.velocity.y -= 9.8 * 10.0 * delta; // 100.0 = mass

      if (keysDown) {
        cfp.direction.z = Number( cfp.moveForward ) - Number( cfp.moveBackward );
        cfp.direction.x = Number( cfp.moveRight ) - Number( cfp.moveLeft );
        cfp.direction.normalize(); // this ensures consistent movements in all directions
      }

      if ( cfp.moveForward || cfp.moveBackward ) cfp.velocity.z -= cfp.direction.z * 200.0 * delta;
      if ( cfp.moveLeft || cfp.moveRight ) cfp.velocity.x -= cfp.direction.x * 200.0 * delta;

      this.controls.moveRight( - cfp.velocity.x * delta );
      this.controls.moveForward( - cfp.velocity.z * delta );

      this.controls.getObject().position.y += ( cfp.velocity.y * delta ); // new behavior

      if ( this.controls.getObject().position.y < EYE_HEIGHT ) {

        cfp.velocity.y = 0;
        this.controls.getObject().position.y = EYE_HEIGHT;

        cfp.canJump = true;
      }

      cfp.prevTime = time;
    }
  }

  // optional props attribute in case we need to
  // consider next controlMode not current
  requestAnimateThrottled(evt, props) {
    if (this.animationRequest) return;

    let controlMode = props ? props.controlMode : this.props.controlMode;

    switch (controlMode) {
      case CONTROL_MODES.MAP:
        if (this.props.mapControlsDampingEnabled) {
          this.animationRequest = requestAnimationFrame( this.animateMapWithDamping );
        } else {
          this.animationRequest = requestAnimationFrame( this.animateMap );
        }
        break;
      case CONTROL_MODES.FIRST_PERSON:
        this.animationRequest = requestAnimationFrame( this.animateFirstPerson );
        break;
      default:
        break;
    }
  }

  animateFirstPerson() {
    this.updateFirstPersonControlsBasedOnKeys();

    if (this.controls.isLocked && (this.controlsFP.keysDown > 0 || !this.controlsFP.canJump)) {
      // if we are pressing buttons or we can't jump yet (haven't landed)
      // we request another animation frame
      this.animationRequest = requestAnimationFrame( this.animateFirstPerson );
    } else {
      this.animationRequest = null;

      // persist camera/controls changes to the store
      this.props.setCamera({
        position: this.camera.position.toArray(),
        rotation: this.camera.rotation.toArray()
      });
    }

    this.renderer.render( this.scene, this.camera );
  }

  /**
   *   Animation Loop (needs requestAnimateThrottled)
   */
  animateMap() {
    this.controls.update();

    this.renderer.render( this.scene, this.camera );

    this.animationRequest = null;
  }

  /**
   * Animation with momentum and damping after drag
   */
  animateMapWithDamping() {

    let updated = this.controls.update();
    this.renderer.render( this.scene, this.camera );

    if (!updated) {
      // stop animating if nothing happens to save energy
      this.animationRequest = null;
    } else {
      this.animationRequest = requestAnimationFrame( this.animateMapWithDamping );
    }
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
    let m = 1.7/10;
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
    
    this.requestAnimateThrottled();
  }

  onSubcomponentUpdated() {
    this.requestAnimateThrottled();
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

        { this.props.controlMode === CONTROL_MODES.FIRST_PERSON &&
          !this.state.firstPersonControlsActive ? (
          <PointerLockInstructions onClick={this.enterFirstPersonControls.bind(this)} />
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