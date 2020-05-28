import React, { createRef } from 'react';
import { connect } from 'react-redux';
import * as THREE from 'three';
import { WEBGL } from 'three/examples/jsm/WebGL';

import {
  selectTrack3DVRSupport, selectTrack3DGraphicsQuality,
} from '../../app/reducers/settingsTrack3DSlice';

import styles from './Track3D.module.scss';
import Track3DDynamic from './Track3DDynamic';

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
      Math.round(bbox.width * this.props.graphicsQuality),
      Math.round(bbox.height * this.props.graphicsQuality),
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
    this.camera = new THREE.PerspectiveCamera( 75, bbox.width / bbox.height, 0.1, 100 );
    this.camera.name = 'Camera';
    this.scene.add(this.camera);
  }

  /**
   *  Add some light sources to the track for shading
   */
  setupTrackLights() {
    let light;
    let bulb;

    let geometry = new THREE.SphereGeometry( .3, 32, 32 );
    let material = new THREE.MeshBasicMaterial( {
      color: 0xcccccc
    } );
    bulb = new THREE.Mesh( geometry, material );

    light = new THREE.PointLight( 0xffffff, .8, 25 );
    light.position.set( -5, 5.5, 7 );
    light.name = 'Light';
    let bulb1 = bulb.clone();
    bulb1.position.set( -5, 5.5, 7 );
    this.scene.add( light )
      // .add(bulb1);

    light = new THREE.PointLight( 0xffffff, .8, 25 );
    light.position.set( 5, 5.5, 7 );
    light.name = 'Light';
    bulb1 = bulb.clone();
    bulb1.position.set( 5, 5.5, 7 );
    this.scene.add( light )
      // .add(bulb1);

    light = new THREE.PointLight( 0xffffff, .8, 25 );
    light.position.set( -5, 5.5, -7 );
    light.name = 'Light';
    bulb1 = bulb.clone();
    bulb1.position.set( -5, 5.5, -7 );
    this.scene.add( light )
      // .add(bulb1);

    light = new THREE.PointLight( 0xffffff, .8, 25 );
    light.position.set( 5, 5.5, -7 );
    light.name = 'Light';
    bulb1 = bulb.clone();
    bulb1.position.set( 5, 5.5, -7 );
    this.scene.add( light )
      // .add(bulb1);

    light = new THREE.AmbientLight( 0xffffff, 1.1 );
    light.name = 'Light';
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
    graphicsQuality: selectTrack3DGraphicsQuality(state),
  }
}

export default connect(mapStateToProps)(Track3D);