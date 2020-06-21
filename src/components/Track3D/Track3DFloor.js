import React from 'react';
import { connect } from 'react-redux';
import * as THREE from 'three';
import _ from 'lodash';

import {
  selectTrack3DUseTextures,
} from '../../app/reducers/settingsTrack3DSlice';

class Track3DFloor extends React.PureComponent {

  componentDidMount() {
    if (!this.props.scene) return;

    this.floor = this.getFloor();
    this.floor.rotateX(-Math.PI / 2);
    this.floor.position.y = -.007;
    this.floor.name = 'Floor';

    this.props.scene.add(this.floor);

    if (this.props.useTextures) this.loadTexturedMaterial();
  }

  componentDidUpdate(prevProps) {
    if (this.props.useTextures !== prevProps.useTextures) {
      if (this.props.useTextures) {
        this.loadTexturedMaterial();
      } else {
        this.loadBasicMaterial();
      }
    }
  }

  componentWillUnmount() {
    if (this.props.scene && this.floor)
      this.props.scene.remove(this.floor);
  }

  getFloor() {
    let geometry = new THREE.PlaneGeometry( 35, 25 );
    let material = new THREE.MeshBasicMaterial( { color: 0xdddddd, side: THREE.FrontSide } );
    let floor = new THREE.Mesh( geometry, material );
    floor.receiveShadow = true;
    floor.renderOrder = 1;

    return floor;
  }

  
  loadTexturedMaterial() {
    this.getTexturedMaterial().then((material) => {
      this.floor.material = material.clone();
      this.floor.material.map = material.map.clone();
      this.floor.material.map.needsUpdate = true;
      this.floor.material.map.repeat.set(.1 * 35, .1 * 25);
      this.floor.material.needsUpdate = true;
      this.props.onUpdate();
    });
  }

  getTexturedMaterial() {
    if (this.texturedMaterialRequest) return this.texturedMaterialRequest;

    this.texturedMaterialRequest = new Promise((resolve, reject) => {
      let asphaltUrl = 'textures/asphalt_material/asphalt.json';
      let asphaltFolder = asphaltUrl.slice(0, asphaltUrl.lastIndexOf('/'));
  
      fetch(asphaltUrl).then((response) => response.json())
        .then((json) => {
          let images = _.pick(json, ['map', 'normalMap', 'displacementMap', 'roughnessMap']);
  
          let loadingImages = [];
  
          let textures = {}
  
          for (let key in images) {
            loadingImages.push(new Promise((resolve, reject) => {
              let loader = new THREE.TextureLoader();
              loader.load(asphaltFolder + '/' + images[key],
                (texture) => {
                  texture.wrapS = THREE.RepeatWrapping;
                  texture.wrapT = THREE.RepeatWrapping;
                  texture.repeat.set(5, 5);
                  texture.anisotropy = Math.min(2, this.props.renderer.capabilities.getMaxAnisotropy());
                  textures[images[key]] = texture;
                  resolve();
                }
              )
            }))
          }
  
          Promise.all(loadingImages).then(() => {
            // instantiate a loader
            var loader = new THREE.MaterialLoader();
            loader.setTextures(textures);
  
            // load a resource
            loader.load(
              // resource URL
              asphaltUrl,
  
              // onLoad callback
              ( material ) => {
                resolve(material)
              },
              null,
              reject
            );
          })
      })
    })
    return this.texturedMaterialRequest;
  }

  loadBasicMaterial() {
    this.floor.material = new THREE.MeshBasicMaterial( { color: 0xdddddd, side: THREE.FrontSide } );
    this.floor.material.needsUpdate = true;

    this.props.onUpdate();
  }

  render() {
    return <></>;
  }
}

const mapStateToProps = (state) => {
  return {
    useTextures: selectTrack3DUseTextures(state),
  }
}

export default connect(mapStateToProps)(Track3DFloor);