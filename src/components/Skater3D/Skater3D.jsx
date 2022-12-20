import React from "react";
import * as THREE from "three";
import { connect } from "react-redux";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

import {
  selectTrack3DUseModelType,
  MODEL_TYPES,
} from "../../app/reducers/settingsTrack3DSlice";

import { loadModel, loadHelmet } from "./modelLoader/modelLoader";

class Skater3D extends React.Component {
  componentDidMount() {
    if (!this.props.scene) return;

    this.skater = new THREE.Group();
    this.skater.name = "Skater3D";
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
    if (
      this.props.x !== prevProps.x ||
      this.props.y !== prevProps.y ||
      this.props.rotation !== prevProps.rotation
    ) {
      needsRender = true;
      this.updateSkaterFromProps();
    }

    if (prevProps.useModelType !== this.props.useModelType) {
      if (this.skaterModel) {
        this.skater.remove(this.skaterModel);
      }
      if (this.skaterPositionModel) {
        this.skater.remove(this.skaterPositionModel);
      }
      this.addSkater();
      needsRender = true;
    }

    if (needsRender) this.props.onSkaterUpdated();
  }

  componentWillUnmount() {
    if (this.skater && this.props.scene) this.props.scene.remove(this.skater);
  }

  updateSkaterFromProps() {
    this.skater.position.set(this.props.x, 0, this.props.y);
    this.skater.rotation.fromArray([
      0,
      ((-this.props.rotation + 90) * Math.PI) / 180,
      0,
      "YXZ",
    ]);
  }

  add3DModelSkater() {
    Promise.all([loadModel(this.props.team), loadHelmet(this.props)]).then(
      (retVals) => {
        let skater = retVals[0];
        let helmet = retVals[1];
        if (!this) return;

        helmet.position.set(0, 1.163, 0.32);
        helmet.rotation.fromArray([-0.17, 0, 0]);
        skater.add(helmet);

        skater.name = "Skater3D Model";

        this.skater.add(skater);
        this.skaterModel = skater;

        this.props.onSkaterUpdated();
      }
    );
  }

  addHelmetSkater() {
    loadHelmet(this.props).then((helmet) => {
      if (!this) return;

      helmet.position.set(0, 0.85, 0);
      helmet.scale.set(60 / 24, 60 / 24, 60 / 24);
      helmet.name = "Skater3D Helmet";

      this.skater.add(helmet);
      this.skaterModel = helmet;

      this.props.onSkaterUpdated();
    });
  }

  addSphereSkater() {
    let geometry = new THREE.SphereGeometry(0.3, 32, 32);
    let material = new THREE.MeshPhongMaterial({
      color: this.props.team === "A" ? 0xff0000 : 0x008000,
      specular: 0x444444,
      shininess: 30,
    });
    const model = new THREE.Mesh(geometry, material);
    model.position.set(0, 0.85, 0);
    model.name = "Skater3D Sphere";

    this.skater.add(model);
    this.skaterModel = model;

    this.props.onSkaterUpdated();
  }

  addCylinderSkater() {
    let geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 32, 32);
    let material = new THREE.MeshPhongMaterial({
      color: this.props.team === "A" ? 0xff0000 : 0x008000,
      specular: 0x444444,
      shininess: 30,
    });

    let model = new THREE.Mesh(geometry, material);
    model.position.set(0, 0.6, 0);
    model.name = "Skater3D Cylinder";

    this.skater.add(model);
    this.skaterModel = model;

    if (this.props.isJammer || this.props.isPivot) {
      const loader = new FontLoader();
      loader.load("fonts/helvetiker_regular.typeface.json", (font) => {
        geometry = new TextGeometry(this.props.isJammer ? "J" : "P", {
          font: font,
          size: 0.3,
          height: 0.01,
        });
        material = new THREE.MeshPhongMaterial({
          color: 0x000000,
          specular: 0x444444,
          shininess: 0,
        });
        model = new THREE.Mesh(geometry, material);
        model.position.set(0.1, 1.21, -0.12);
        model.rotateX(-Math.PI / 2);
        model.rotateZ(Math.PI);
        model.name = "Skater Position";
        this.skater.add(model);
        this.skaterPositionModel = model;
        this.props.onSkaterUpdated();
      });
    }

    this.props.onSkaterUpdated();
  }

  addShadow(target) {
    let geometry = new THREE.CircleGeometry(0.3, 32);
    let material = new THREE.MeshBasicMaterial({
      color: 0x222222,
      opacity: 0.2,
      transparent: true,
    });
    this.shadow = new THREE.Mesh(geometry, material);
    this.shadow.position.set(0, Math.random() * 0.001, 0);
    this.shadow.rotateX((-90 * Math.PI) / 180);
    this.shadow.name = "Skater3D Shadow";
    this.shadow.renderOrder = 5;

    target.add(this.shadow);
  }

  addBoundingElement(target) {
    let geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.9);
    let material = new THREE.MeshBasicMaterial({
      color: 0x738bff,
      opacity: 0,
      transparent: true,
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0.45, 0);
    mesh.name = "Bounding Element";
    mesh.renderOrder = 7;
    target.add(mesh);
  }

  addSkater() {
    switch (this.props.useModelType) {
      case MODEL_TYPES.HUMAN:
        this.add3DModelSkater();
        break;
      case MODEL_TYPES.HELMET:
        this.addHelmetSkater();
        break;
      case MODEL_TYPES.SPHERE:
        this.addSphereSkater();
        break;
      case MODEL_TYPES.CYLINDER:
        this.addCylinderSkater();
        break;
      default:
        break;
    }
  }

  renderSkater() {
    this.addSkater();
    this.addShadow(this.skater);
    this.addBoundingElement(this.skater);

    this.updateSkaterFromProps();

    this.props.scene.add(this.skater);
  }

  render() {
    return <></>;
  }
}

const mapStateToProps = (state) => {
  return {
    useModelType: selectTrack3DUseModelType(state),
  };
};

export default connect(mapStateToProps)(Skater3D);
