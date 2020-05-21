import React from 'react';
import * as THREE from 'three';
import { connect } from 'react-redux';

import {
  selectTrack3DUse3DModels,
} from '../../app/reducers/settingsTrack3DSlice';

import { loadModel, loadHelmet } from './modelLoader/modelLoader';

class Skater3D extends React.PureComponent {

  componentDidMount() {
    if (!this.props.scene) return;

    this.renderSkater();
  }

  componentWillUnmount() {
    if (this.skater && this.props.scene) {
      this.props.scene.remove(this.skater);
    }
    if (this.shadow && this.props.scene) {
      this.props.scene.remove(this.shadow);
    }
    if (this.skaterModel && this.props.scene) {
      this.props.scene.remove(this.skaterModel);
    }
  }

  componentDidUpdate(prevProps) {
    let needsRender = false;
    if (this.props.x !== prevProps.x
      || this.props.y !== prevProps.y
      || this.props.rotation !== prevProps.rotation) {
        needsRender = true;

        if (this.skater) this.skater.position.set(this.props.x, .85, this.props.y);
        if (this.skaterModel) {
          this.skaterModel.position.set(this.props.x, 0, this.props.y);
          this.skaterModel.rotation.set(0, (-this.props.rotation + 90) * Math.PI / 180, 0, 'YXZ');
        }
        this.shadow.position.x = this.props.x;
        this.shadow.position.z = this.props.y;
      }

    if (prevProps.use3DModels !== this.props.use3DModels) {
      if (this.props.use3DModels) {
        if (this.skater && this.props.scene) {
          this.props.scene.remove(this.skater);
        }
        this.add3DModelSkater();
      } else {
        if (this.skaterModel && this.props.scene) {
          this.props.scene.remove(this.skaterModel);
        }
        // this.addLowPolySkater();
        this.addHelmetSkater();
      }
      needsRender = true;
    }

    if (needsRender) this.props.onSkaterUpdated();
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

      skater.position.set(this.props.x, 0, this.props.y);
      skater.rotation.fromArray([0, (-this.props.rotation + 90) * Math.PI / 180, 0, 'YXZ']);

      this.props.scene.add( skater );
      this.skaterModel = skater;

      this.props.onSkaterUpdated();
    })
  }

  addLowPolySkater() {

    let geometry = new THREE.SphereGeometry( .3, 32, 32 );
    let material = new THREE.MeshPhongMaterial( {
      color: this.props.team === 'A' ? 0xff0000 : 0x008000,
      specular: 0x444444,
      shininess: 30,
    } );

    this.skater = new THREE.Mesh( geometry, material );
    this.skater.position.set(this.props.x, .85, this.props.y);
    this.props.scene.add( this.skater );
  }

  addHelmetSkater() {
    loadHelmet(this.props)
      .then((helmet) => {
        if (!this) return;

        helmet.position.set(this.props.x, .85, this.props.y);
        helmet.rotation.fromArray([0, (-this.props.rotation + 90) * Math.PI / 180, 0, 'YXZ']);
        helmet.scale.set(60/24,60/24,60/24);

        this.props.scene.add( helmet );
        this.skater = helmet;

        this.props.onSkaterUpdated();
    })
  }

  addShadow() {
    let geometry = new THREE.CircleGeometry( .3, 32 );
    let material = new THREE.MeshBasicMaterial( { color: 0x222222, opacity: .2, transparent: true } );
    this.shadow = new THREE.Mesh( geometry, material );
    this.shadow.position.set(this.props.x, Math.random() * .001, this.props.y);
    this.shadow.rotateX(-90 * Math.PI / 180);
    this.props.scene.add( this.shadow );
  }

  renderSkater() {
    if (this.props.use3DModels) {
      this.add3DModelSkater();
    } else {
      // this.addLowPolySkater();
      this.addHelmetSkater();
    }

    // Skater Shadow
    this.addShadow();
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