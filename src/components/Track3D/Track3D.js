import React, { createRef } from 'react';
import { connect } from 'react-redux';
import * as THREE from 'three';
import { WEBGL } from 'three/examples/jsm/WebGL';

import { selectGeneralSettings } from '../../app/reducers/settingsGeneralSlice';
import {
  selectTrack3DCamera,
  selectTrack3DVRSupport,
} from '../../app/reducers/settingsTrack3DSlice';

import styles from './Track3D.module.scss';
import Track3DDynamic from './Track3DDynamic';


const GRAPHICS_QUALITY = 1;

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

    this.onResize = this.onResize.bind(this);
  }

  componentDidMount() {
    if ( !this.webglAvailable ) return;

    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initWebXR(); // TODO: only init if necessary

    this.setupTrackLights();

    // add event listeners
    window.addEventListener('resize', this.onResize);
  }

  /*
  * Don't update if unnecessary things from setting.general changed
  * Still needed?
  */
  shouldComponentUpdate(nextProps, nextState) {
    if (!this.state.rendererInitialized && nextState.rendererInitialized) return true;
    return false;
  }

  componentWillUnmount() {
    // Cleanup

    // cancel the loop before unmounting
    if (this.animationRequest) cancelAnimationFrame(this.animationRequest);
    if (this.controls) this.controls.dispose();
    if (this.renderer) this.renderer.dispose();

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
   *  Initialize the renderer with either webgl2 or webgl1 context
   */
  initRenderer() {
    let container = this.rendererContainer.current;   // ref

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
      this.setState({
        contextType: 'webgl2'
      });

    } else {

      // use Web GL 1 if no webgl2 is available
      this.renderer = new THREE.WebGLRenderer({
        antialias: true
      });
      this.setState({
        contextType: 'webgl1'
      });

    }

    this.renderer.setPixelRatio( window.devicePixelRatio ); // retina or not?
    this.updateRendererSize();  // set size of canvas

    // add a class to the canvas dom element
    this.renderer.domElement.classList.add(styles.renderer)  

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

    // copy from properties
    this.camera.position.fromArray(this.props.camera.position);
    this.camera.rotation.fromArray(this.props.camera.rotation);
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

  updateCamera() {
    if (this.camera && this.renderer) {
      let container = this.rendererContainer.current;
      let bbox = container.getBoundingClientRect();
      this.camera.aspect = bbox.width / bbox.height;
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
            camera={this.camera}
            scene={this.scene}
            rendererContainer={this.rendererContainer}
          />
        ) : null }
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    settings: {
      general: selectGeneralSettings(state),
    },
    camera: selectTrack3DCamera(state),
    vrSupport: selectTrack3DVRSupport(state),
  }
}

export default connect(mapStateToProps)(Track3D);