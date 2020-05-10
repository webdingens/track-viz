import React, { createRef } from 'react';
import { connect } from 'react-redux';
import * as THREE from 'three';
import { WEBGL } from 'three/examples/jsm/WebGL';

import {
  selectTrack3DVRSupport,
} from '../../app/reducers/settingsTrack3DSlice';

import styles from './Track3D.module.scss';
import Track3DDynamic from './Track3DDynamic';

const GRAPHICS_QUALITY = .6;

class Track3D extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      rendererInitialized: false,
      contextType: '',
    }

    // ref to attach our render canvas to
    this.rendererContainer = createRef();

    // store availability because of DOM manipulation
    this.webglAvailable = WEBGL.isWebGLAvailable();
    this.webgl2Available = WEBGL.isWebGL2Available();
  }

  componentDidMount() {
    if ( !this.webglAvailable ) return;

    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initWebXR(); // TODO: only init if necessary

    this.setupTrackLights();

  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.state.rendererInitialized && nextState.rendererInitialized) return true;
    return false;
  }

  componentWillUnmount() {
    // Cleanup
    if (this.renderer) this.renderer.dispose();
  }

  /**
   *  Initialize the renderer with either webgl2 or webgl1 context
   */
  initRenderer() {
    let container = this.rendererContainer.current;   // ref
    let contextType = '';

    // remove canvas in case we need to reinitialize the renderer
    if (this.state.rendererInitialized) {
      container.removeChild( this.renderer.domElement );
    }

    // Select WebGL context with Webgl 1 or 2
    if ( this.webgl2Available ) {

      let canvas = document.createElement( 'canvas' );
      let context = canvas.getContext('webgl2', {
        alpha: false, // no alpha channel, no see through
        xrCompatible: true,
        // powerPreference: 'low-power' || 'high-power' || 'default'  // maybe power options as a setting?
      });
      this.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        context: context,
        antialias: true
      });
      contextType = 'webgl2';

    } else {

      // use Web GL 1 if no webgl2 is available
      this.renderer = new THREE.WebGLRenderer({
        antialias: true
      });
      contextType = 'webgl1';

    }

    this.renderer.setPixelRatio( window.devicePixelRatio ); // retina or not?

    // add a class to the canvas dom element
    this.renderer.domElement.classList.add(styles.renderer)  

    container.appendChild( this.renderer.domElement );

    // use a dom element already present
    let bbox = this.rendererContainer.current.getBoundingClientRect();
    this.renderer.setSize(
      Math.round(bbox.width * GRAPHICS_QUALITY),
      Math.round(bbox.height * GRAPHICS_QUALITY),
      false // prevent inline style attribute on the renderer
    );

    this.setState({
      rendererInitialized: true,
      contextType
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
    this.scene.add(this.camera);
  }

  initWebXR() {
    // Web XR
    this.renderer.xr.enabled = true;
    this.renderer.xr.setReferenceSpaceType( 'local' );
    this.currentXRSession = null;

    this.viewerXR = new THREE.Group();  // Viewer, aka. skater, aka. person

    // TODO: setup with XR device dimensions ? yes/no?
    this.xrCamera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
    this.viewerXR.add(this.xrCamera);
    
    this.scene.add(this.viewerXR);
  }

  /**
   *  Add some light sources to the track for shading
   */
  setupTrackLights() {
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
  }

  render() {
    return (
      <div
        ref={this.rendererContainer}
        className={styles.rendererContainer}
      >
        { !this.webglAvailable ? (
          <div dangerouslySetInnerHTML={{ __html: WEBGL.getWebGLErrorMessage().innerHTML }}></div>
        ) : null }

        { this.state.rendererInitialized ? (
          <Track3DDynamic
            renderer={this.renderer}
            _camera={this.camera}
            _scene={this.scene}
          />
        ) : null }
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    vrSupport: selectTrack3DVRSupport(state),
  }
}

export default connect(mapStateToProps)(Track3D);