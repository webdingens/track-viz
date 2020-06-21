import React from 'react';
import * as THREE from 'three';
import { connect } from 'react-redux';

import {
  selectTrack3DUse3DModels,
} from '../../app/reducers/settingsTrack3DSlice';

import { loadModel, loadHelmet } from './modelLoader/modelLoader';

class Skater3D extends React.Component {

  componentDidMount() {
    if (!this.props.scene) return;

    this.skater = new THREE.Group();
    this.skater.name = 'Skater3D';
    this.skater.renderOrder = 6;
    this.skater.skaterId = this.props.id;

    this.renderSkater();
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.userIsInteracting) return false;
    return true;
  }

  componentDidUpdate(prevProps) {
    let needsRender = false;
    if (this.props.x !== prevProps.x
      || this.props.y !== prevProps.y
      || this.props.rotation !== prevProps.rotation) {
        needsRender = true;
        this.updateSkaterFromProps();
      }

    if (prevProps.use3DModels !== this.props.use3DModels) {
      if (this.skaterModel) {
        this.skater.remove(this.skaterModel);
      }
      if (this.props.use3DModels) {
        this.add3DModelSkater();
      } else {
        // this.addLowPolySkater();
        this.addHelmetSkater();
      }
      needsRender = true;
    }

    if (needsRender) this.props.onSkaterUpdated();
  }

  componentWillUnmount() {
    if (this.skater && this.props.scene)
      this.props.scene.remove(this.skater);
  }

  updateSkaterFromProps() {
    this.skater.position.set(this.props.x, 0, this.props.y);
    this.skater.rotation.fromArray([0, (-this.props.rotation + 90) * Math.PI / 180, 0, 'YXZ']);
  }

  add3DModelSkater() {
    Promise.all([
      loadModel(this.props.team),
      loadHelmet(this.props),
    ])
    .then((retVals) => {
      let skater = retVals[0];
      let helmet = retVals[1];
      if (!this) return;

      helmet.position.set(0, 1.163, .32);
      helmet.rotation.fromArray([-.17, 0, 0])
      skater.add(helmet);

      skater.name = 'Skater3D Model';

      this.skater.add( skater );
      this.skaterModel = skater;

      this.props.onSkaterUpdated();
    })
  }

  addLowPolySkater() {

    let geometry = new THREE.SphereGeometry( .3, 32, 32 );
    let material = new THREE.MeshPhongMaterial({
      color: this.props.team === 'A' ? 0xff0000 : 0x008000,
      specular: 0x444444,
      shininess: 30,
    });

    this.skaterModel = new THREE.Mesh( geometry, material );
    this.skaterModel.position.set(0, .85, 0);
    this.skaterModel.name = 'Skater3D Low Poly';

    this.skater.add( this.skaterModel );
  }

  addHelmetSkater() {
    loadHelmet(this.props)
      .then((helmet) => {
        if (!this) return;

        helmet.position.set(0, .85, 0);
        helmet.scale.set(60/24,60/24,60/24);
        helmet.name = 'Skater3D Helmet';

        this.skater.add( helmet );
        this.skaterModel = helmet;

        this.props.onSkaterUpdated();
      })
  }

  addShadow(target) {
    let geometry = new THREE.CircleGeometry( .3, 32 );
    let material = new THREE.MeshBasicMaterial( { color: 0x222222, opacity: .2, transparent: true } );
    this.shadow = new THREE.Mesh( geometry, material );
    this.shadow.position.set(0, Math.random() * .001, 0);
    this.shadow.rotateX(-90 * Math.PI / 180);
    this.shadow.name = 'Skater3D Shadow';
    this.shadow.renderOrder = 5;

    target.add( this.shadow );
  }

  addBoundingElement(target) {
    let geometry = new THREE.CylinderGeometry(.3, .3, .9);
    let material = new THREE.MeshBasicMaterial( { color: 0x738bff, opacity: 0, transparent: true } );


    let mesh = new THREE.Mesh( geometry, material );
    mesh.position.set(0, .45, 0);
    mesh.name = 'Bounding Element';
    mesh.renderOrder = 7;
    target.add( mesh );
  }

  renderSkater() {
    if (this.props.use3DModels) {
      this.add3DModelSkater();
    } else {
      // this.addLowPolySkater();
      this.addHelmetSkater();
    }

    this.addShadow(this.skater);
    this.addBoundingElement(this.skater);

    this.updateSkaterFromProps();

    this.props.scene.add( this.skater );
  }

  render() {
    return <></>
  }
}

const mapStateToProps = (state) => {
  return {
    use3DModels: selectTrack3DUse3DModels(state)
  }
}

export default connect(mapStateToProps)(Skater3D);