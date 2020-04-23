import React, { createRef } from 'react';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh
} from 'three';

import styles from './Track3D.module.scss';

class Track3D extends React.Component {
  constructor(props) {
    super(props)

    this.rendererContainer = createRef();

    this.animate = this.animate.bind(this);
  }

  componentDidMount() {
    this.initScene();

    // start animation loop
    this.animate();
  }

  initScene() {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    this.renderer = new WebGLRenderer();
    let container = this.rendererContainer.current;
    let bbox = container.getBoundingClientRect();

    this.renderer.setSize(
      bbox.width * devicePixelRatio,
      bbox.height * devicePixelRatio,
      false // prevent inline style attribute on the renderer
    );

    this.renderer.domElement.classList.add(styles.renderer)  // add styling

    container.appendChild( this.renderer.domElement );

    // Build the scene
    let geometry = new BoxGeometry();
    let material = new MeshBasicMaterial( { color: 0x00ff00 } );
    this.cube = new Mesh( geometry, material );
    this.scene.add( this.cube );

    // Add camera
    this.camera.position.z = 5;
  }

  /*
  *   Animation Loop
  */
  animate() {
    this.animationRequest = requestAnimationFrame( this.animate );

    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;

    this.renderer.render( this.scene, this.camera );
  }

  componentWillUnmount() {
    // Cleanup

    // cancel the loop before unmounting
    if (this.animationRequest) cancelAnimationFrame(this.animationRequest);
  }

  render() {
    return (
      <div
        ref={this.rendererContainer}
        className={styles.rendererContainer}
      ></div>
    )
  }
}


export default Track3D;