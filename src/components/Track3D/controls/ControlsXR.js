import ControlsBase from './ControlsBase';

import * as THREE from 'three';

// TODO: move things from context to options
// TODO: use dispatch in controls instead of using the props actions

const EYE_HEIGHT = 1.7;

class ControlsXR extends ControlsBase {
  constructor(options) {
    super(options);

    let { renderer, camera, context, session, onSessionEnded } = options;
    this.renderer = renderer;
    this.camera = camera;
    this.context = context;
    this.session = session;
    this.onSessionEnded = onSessionEnded;

    this.animateXR = this.animateXR.bind(this);
    this.requestAnimate = this.requestAnimate.bind(this);
    this._onSessionEnded = this._onSessionEnded.bind(this);
    this.onKeyDownFP = this.onKeyDownFP.bind(this);
    this.onKeyUpFP = this.onKeyUpFP.bind(this);

    this.vec = new THREE.Vector3();

    this.setupControls();
  }

  setupControls() {
    // init camera
    this.viewerXR = new THREE.Group();  // Viewer, aka. skater, aka. person
    this.xrCamera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
    this.viewerXR.add(this.xrCamera);
    
    this.context.scene.add(this.viewerXR);

    this.session.addEventListener( 'end', this._onSessionEnded );

    this.renderer.setAnimationLoop(this.animateXR);
    this.renderer.xr.setSession( this.session );

    // set our viewer (head) position to that of the camera
    let currCamRot = this.camera.rotation.clone().reorder('YXZ');
    let currCamPos = this.camera.position.toArray();
    currCamPos[1] = 30;

    this.viewerXR.position.fromArray(currCamPos);
    this.viewerXR.rotation.fromArray([0, currCamRot.y, 0, 'YXZ']); // starting view of our VR session (just the Y rotation)

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
    }

    window.addEventListener( 'keydown', this.onKeyDownFP, false );
    window.addEventListener( 'keyup', this.onKeyUpFP, false );
  }

  _syncToState() {
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

    // don't set before animation loop got destroyed
    this.context.props.setCamera({
      position: newPosition.toArray(),
      rotation: newRotation,
    });
  }

  _onSessionEnded() {
    window.removeEventListener( 'keydown', this.onKeyDownFP, false );
    window.removeEventListener( 'keyup', this.onKeyUpFP, false );

    this.session.removeEventListener( 'end', this._onSessionEnded );

    this._syncToState();
    this.destroy();
    this.onSessionEnded();
  }

  updateFirstPersonControlsBasedOnKeys() {
    let cfp = this.controlsFP;

    let keysDown = cfp.moveForward || cfp.moveBackward || cfp.moveLeft || cfp.moveRight;

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

    this.moveRight( - cfp.velocity.x * delta );
    this.moveForward( - cfp.velocity.z * delta );

    this.viewerXR.position.y += ( cfp.velocity.y * delta ); // new behavior

    if ( this.viewerXR.position.y < EYE_HEIGHT ) {

      cfp.velocity.y = 0;
      this.viewerXR.position.y = EYE_HEIGHT;

      cfp.canJump = true;
    }

    cfp.prevTime = time;
  }

  moveForward( distance ) {

		// move forward parallel to the xz-plane
    // assumes camera.up is y-up

    this.vec.setFromMatrixColumn( this.viewerXR.matrix, 0 );
  
    if (this.currentXRPose) {
      let {x, y, z, w} = this.currentXRPose.transform.orientation;
      this.vec.applyQuaternion(new THREE.Quaternion(x, y, z, w));
    }

    this.vec.crossVectors( this.viewerXR.up, this.vec );


		this.viewerXR.position.addScaledVector( this.vec, distance );

	};

	moveRight( distance ) {
    this.vec.setFromMatrixColumn( this.viewerXR.matrix, 0 );

    if (this.currentXRPose) {
      let {x, y, z, w} = this.currentXRPose.transform.orientation;
      this.vec.applyQuaternion(new THREE.Quaternion(x, y, z, w));
    }

		this.viewerXR.position.addScaledVector( this.vec, distance );
	};

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

  animateXR(t, xrFrame) {
    this.updateFirstPersonControlsBasedOnKeys();
    console.log('Frame Details')
    console.dir(xrFrame);
    console.log('referenceSpace: ', this.renderer.xr.getReferenceSpace());
    console.dir(xrFrame.getViewerPose( this.renderer.xr.getReferenceSpace() ));
    console.dir(this.xrCamera.position)
    console.dir(this.xrCamera.rotation);
    console.dir(this.renderer.xr)
    if (xrFrame) this.currentXRPose = xrFrame.getViewerPose( this.renderer.xr.getReferenceSpace() );

    this.renderer.render( this.context.scene, this.xrCamera );
  }

  destroy() {
    this.renderer.setAnimationLoop(null);
    this.context.scene.remove(this.viewerXR);
  }
}

export default ControlsXR;