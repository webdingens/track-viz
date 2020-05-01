import React, { createRef } from 'react';
import { connect } from 'react-redux';
import * as THREE from 'three';
import { WEBGL } from 'three/examples/jsm/WebGL';

import Track3DMarkings from './Track3DMarkings';
import Track3DSkaters from './Track3DSkaters';
import Track3DFloor from './Track3DFloor';

import { MapControls } from 'three/examples/jsm/controls/OrbitControls';

import {
  selectSettings
} from '../../app/reducers/settingsSlice';

import styles from './Track3D.module.scss';

const GRAPHICS_QUALITY = 1;
const CONTROLS_WITH_DAMPING = false;

class Track3D extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      rendererInitialized: false
    }

    this.rendererContainer = createRef();
    this.webglAvailable = WEBGL.isWebGLAvailable();
    this.webgl2Available = WEBGL.isWebGL2Available();

    this.animate = this.animate.bind(this);
    this.animateWithDamping = this.animateWithDamping.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onSkaterUpdated = this.onSkaterUpdated.bind(this);
  }

  componentDidMount() {
    if ( !this.webglAvailable ) return;

    this.initRenderer();
    this.initScene();
    this.initCamera();

    // this.setupCubeScene();
    // this.setupLineScene();
    this.setupTrackScene();

    // start animation loop
    this.animate();

    // add event listeners
    window.addEventListener('resize', this.onResize);
  }

  initRenderer() {
    // Select WebGL 1 or 2
    if ( this.webgl2Available ) {
      let canvas = document.createElement( 'canvas' );
      let context = canvas.getContext( 'webgl2', { alpha: false } );  // TODO: why alpha false?
      this.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        context: context
      });
    } else {
      // use Web GL 1
      this.renderer = new THREE.WebGLRenderer();
    }

    let container = this.rendererContainer.current;

    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.updateRendererSize();

    this.renderer.domElement.classList.add(styles.renderer)  // add styling

    container.appendChild( this.renderer.domElement );

    this.setState({
      rendererInitialized: true
    });
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xffffff );
  }

  initCamera() {
    let container = this.rendererContainer.current;
    let bbox = container.getBoundingClientRect();
    this.camera = new THREE.PerspectiveCamera( 75, bbox.width / bbox.height, 0.1, 1000 );
    // this.camera = new THREE.OrthographicCamera( bbox.width / - 2, bbox.width / 2, bbox.height / 2, bbox.height / - 2, -2000, 2000 );
  }

  setupTrackScene() {

    let light;
    
    light = new THREE.PointLight( 0xffffff, 1, 100 );
    light.position.set( -5, 10, 7 );
    this.scene.add( light );

    light = new THREE.PointLight( 0xffffff, 1, 100 );
    light.position.set( 5, 10, 7 );
    this.scene.add( light );

    light = new THREE.PointLight( 0xffffff, 1, 100 );
    light.position.set( -5, 10, -7 );
    this.scene.add( light );

    light = new THREE.PointLight( 0xffffff, 1, 100 );
    light.position.set( -5, 10, -7 );
    this.scene.add( light );


    light = new THREE.AmbientLight( 0xffffff, .4 );
    this.scene.add( light );

    // move camera back so we can see the lines
    this.camera.position.set( 0, 1.7, 11 );
    this.camera.lookAt( 0, 0, 0 );


    this.controls = new MapControls( this.camera, this.renderer.domElement );
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2;

    if (CONTROLS_WITH_DAMPING) {
      this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
      this.controls.dampingFactor = 0.05;
      const controlsEventHandler = () => {
        if (!this.animationRequest) this.animationRequest = requestAnimationFrame( this.animateWithDamping );
      }
      this.controls.addEventListener('start', controlsEventHandler);
      this.controls.addEventListener('change', controlsEventHandler);
    } else {
      this.controls.addEventListener('change', () => {
        this.requestAnimateThrottled();
      });
    }
  }

  /*
  *   Animation Loop
  */
  animate() {
    // this.animationRequest = requestAnimationFrame( this.animate );

    this.controls.update();
    this.renderer.render( this.scene, this.camera );

    this.animationRequest = null;
  }


  /**
   * Checks whether we have an animation request already
   * going before requesting another
   *
   * @returns void
   */
  requestAnimateThrottled() {
    if (!this.animationRequest) this.animationRequest = requestAnimationFrame( this.animate );
  }

  animateWithDamping() {
    this.animationRequest = requestAnimationFrame( this.animateWithDamping );

    let updated = this.controls.update();
    this.renderer.render( this.scene, this.camera );

    if (!updated) {
      cancelAnimationFrame(this.animationRequest);
      this.animationRequest = null;
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.settings.trackEditorVisible !== prevProps.settings.trackEditorVisible || this.props.settings.track3DVisible !== prevProps.settings.track3DVisible) {
      this.onResize();
    } else {
      this.requestAnimateThrottled(); // already called with this.onResize
    }
  }

  updateCamera() {
    if (this.camera && this.renderer) {
      let container = this.rendererContainer.current;
      let bbox = container.getBoundingClientRect();
      this.camera.aspect = bbox.width / bbox.height;
      // this.camera.left = bbox.width / - 2;
      // this.camera.right = bbox.width / 2;
      // this.camera.top = bbox.height / 2;
      // this.camera.bottom = bbox.height / - 2;
      this.camera.updateProjectionMatrix();
    }
  }

  updateRendererSize() {
    if (this.renderer) {
      let container = this.rendererContainer.current;
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

  onSkaterUpdated() {
    this.requestAnimateThrottled();
  }

  componentWillUnmount() {
    // Cleanup

    // cancel the loop before unmounting
    if (this.animationRequest) cancelAnimationFrame(this.animationRequest);
    if (this.controls) this.controls.dispose();
    if (this.gui) this.gui.destroy();

    // remove event listeners
    window.removeEventListener('resize', this.onResize);
  }

  render() {
    return (
      <div
        ref={this.rendererContainer}
        className={styles.rendererContainer}
      >
        { !this.webglAvailable ? (
          <div>{ WEBGL.getWebGLErrorMessage() }</div>
        ) : null }

        { this.state.rendererInitialized ? (
          <>
            <Track3DFloor scene={this.scene} />
            <Track3DMarkings scene={this.scene} />
            <Track3DSkaters
              scene={this.scene}
              onSkaterUpdated={this.onSkaterUpdated}
            />
          </>
        ) : null }
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    settings: selectSettings(state)
  }
}

export default connect(mapStateToProps)(Track3D);