import React from 'react';
import { connect } from 'react-redux';
import * as THREE from 'three';
import _ from 'lodash';

import {
  selectTrack3DUseTextures,
} from '../../app/reducers/settingsTrack3DSlice';

class Track3DWalls extends React.PureComponent {

  componentDidMount() {
    if (!this.props.scene) return;

    this.walls = [];

    let walls = [{
      x: -17.5,
      y: 1,
      z: 0,
      width: 25,
      height: 2,
      rotation: [0, Math.PI / 2, 0, 'YXZ']
    },
    {
      x: 0,
      y: 1,
      z: -12.5,
      width: 35,
      height: 2,
      rotation: [0, 0, 0, 'YXZ']
    },
    {
      x: 17.5,
      y: 1,
      z: 0,
      width: 25,
      height: 2,
      rotation: [0, -Math.PI / 2, 0, 'YXZ']
    },
    {
      x: 0,
      y: 1,
      z: 12.5,
      width: 35,
      height: 2,
      rotation: [0, Math.PI, 0, 'YXZ']
    }]

    walls.forEach((w) => {
      let geometry = new THREE.PlaneGeometry( w.width, w.height );
      let material = new THREE.MeshBasicMaterial( { color: 0xbb7777, side: THREE.FrontSide } );

      let wall = new THREE.Mesh( geometry, material );
      wall.receiveShadow = true;
      wall.rotation.fromArray(w.rotation);
      wall.position.set(w.x, w.y, w.z);
      wall.name = 'Wall';

      this.props.scene.add(wall);
      this.walls.push({
        mesh: wall,
        ...w
      });
    })

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
    if (this.props.scene && this.walls)
      this.walls.forEach((wall) => this.props.scene.remove(wall.mesh))
  }

  loadTexturedMaterial() {
    this.getTexturedMaterial().then((material) => {
      this.walls.forEach((wall) => {
        wall.mesh.material = material.clone();
        wall.mesh.material.map = material.map.clone();
        wall.mesh.material.map.needsUpdate = true;
        wall.mesh.material.map.repeat.set(.4 * wall.width, .5 * wall.height);
        wall.mesh.material.needsUpdate = true;
      })
      this.props.onUpdate();
    });
  }

  getTexturedMaterial() {
    if (this.texturedMaterialRequest) return this.texturedMaterialRequest;

    this.texturedMaterialRequest = new Promise((resolve, reject) => {
      let asphaltUrl = 'textures/wall_material/wall.json';
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
                resolve(material);
              },
              null,
              reject
            );
          });
        });
    })
    return this.texturedMaterialRequest;
  }

  loadBasicMaterial() {
    this.walls.forEach((wall) => {
      wall.mesh.material = new THREE.MeshBasicMaterial( { color: 0xbb7777, side: THREE.FrontSide } );
      wall.mesh.material.needsUpdate = true;
    })
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

export default connect(mapStateToProps)(Track3DWalls);