import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useSelector } from "react-redux";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

import {
  selectTrack3DUseModelType,
  MODEL_TYPES,
} from "../../app/reducers/settingsTrack3DSlice";

import { loadModel, loadHelmet } from "./modelLoader/modelLoader";

function Skater3D(props) {
  const skater = useRef(null);
  const skaterModel = useRef(null);
  const skaterPositionModel = useRef(null);
  const shadow = useRef(null);
  const useModelType = useSelector(selectTrack3DUseModelType);
  const mountCount = useRef(0);

  // init on mount
  useEffect(() => {
    if (!props.scene) return;

    skater.current = new THREE.Group();
    skater.current.name = "Skater3D";
    skater.current.renderOrder = 6;
    skater.current.skaterId = props.id;

    mountCount.current++;

    return () => {
      // remove skater rendered on mount
      removeExistingSkater();
      if (skater && props.scene) props.scene.remove(skater);
    };
  }, [props.scene]);

  // Model Type Updated
  useEffect(() => {
    if (!props.scene) return;
    removeExistingSkater();
    renderSkater(mountCount.current);
    props.onSkaterUpdated();
  }, [useModelType, props.onSkaterUpdated, props.userIsInteracting]);

  // location changed
  useEffect(() => {
    if (!props.scene) return;
    if (props.userIsInteracting) return;
    updateSkaterFromProps();
    props.onSkaterUpdated();
  }, [props.x, props.y, props.rotation, props.userIsInteracting]);

  function updateSkaterFromProps() {
    skater.current.position.set(props.x, 0, props.y);
    skater.current.rotation.fromArray([
      0,
      ((-props.rotation + 90) * Math.PI) / 180,
      0,
      "YXZ",
    ]);
  }

  async function add3DModelSkater(mc) {
    console.log("addd");
    console.log(mc);
    const retVals = await Promise.all([
      loadModel(props.team),
      loadHelmet(props),
    ]);
    if (mc !== mountCount.current) return;
    console.log(mc);
    if (useModelType !== MODEL_TYPES.HUMAN) return;
    let _skaterModel = retVals[0];
    let _helmet = retVals[1];

    _helmet.position.set(0, 1.163, 0.32);
    _helmet.rotation.fromArray([-0.17, 0, 0]);
    _skaterModel.add(_helmet);

    _skaterModel.name = "Skater3D Model";

    skater.current.add(_skaterModel);
    skaterModel.current = _skaterModel;

    props.onSkaterUpdated();
  }

  async function addHelmetSkater(mc) {
    const helmet = await loadHelmet(props);
    if (useModelType !== MODEL_TYPES.HELMET) return;
    if (mc !== mountCount.current) return;

    helmet.position.set(0, 0.85, 0);
    helmet.scale.set(60 / 24, 60 / 24, 60 / 24);
    helmet.name = "Skater3D Helmet";

    skater.current.add(helmet);
    skaterModel.current = helmet;

    props.onSkaterUpdated();
  }

  function addSphereSkater() {
    let geometry = new THREE.SphereGeometry(0.3, 32, 32);
    let material = new THREE.MeshPhongMaterial({
      color: props.team === "A" ? 0xff0000 : 0x008000,
      specular: 0x444444,
      shininess: 30,
    });
    const model = new THREE.Mesh(geometry, material);
    model.position.set(0, 0.85, 0);
    model.name = "Skater3D Sphere";

    skater.current.add(model);
    skaterModel.current = model;

    props.onSkaterUpdated();
  }

  async function addCylinderSkater(mc) {
    let geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 32, 32);
    let material = new THREE.MeshPhongMaterial({
      color: props.team === "A" ? 0xff0000 : 0x008000,
      specular: 0x444444,
      shininess: 30,
    });

    let model = new THREE.Mesh(geometry, material);
    model.position.set(0, 0.6, 0);
    model.name = "Skater3D Cylinder";

    skater.current.add(model);
    skaterModel.current = model;

    if (props.isJammer || props.isPivot) {
      const loader = new FontLoader();
      await new Promise((resolve) => {
        loader.load("fonts/helvetiker_regular.typeface.json", (font) => {
          if (useModelType !== MODEL_TYPES.CYLINDER) return;
          if (mc !== mountCount.current) return;
          geometry = new TextGeometry(props.isJammer ? "J" : "P", {
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
          skater.current.add(model);
          skaterPositionModel.current = model;
          resolve();
        });
      });
      if (mc !== mountCount.current) return;
    }

    props.onSkaterUpdated();
  }

  function addShadow(target) {
    let geometry = new THREE.CircleGeometry(0.3, 32);
    let material = new THREE.MeshBasicMaterial({
      color: 0x222222,
      opacity: 0.2,
      transparent: true,
    });
    shadow.current = new THREE.Mesh(geometry, material);
    shadow.current.position.set(0, Math.random() * 0.001, 0);
    shadow.current.rotateX((-90 * Math.PI) / 180);
    shadow.current.name = "Skater3D Shadow";
    shadow.current.renderOrder = 5;

    target.add(shadow.current);
  }

  function addBoundingElement(target) {
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

  async function addSkater(mc) {
    switch (useModelType) {
      case MODEL_TYPES.HUMAN:
        await add3DModelSkater(mc);
        break;
      case MODEL_TYPES.HELMET:
        await addHelmetSkater(mc);
        break;
      case MODEL_TYPES.SPHERE:
        addSphereSkater();
        break;
      case MODEL_TYPES.CYLINDER:
        await addCylinderSkater(mc);
        break;
      default:
        break;
    }
  }

  function removeExistingSkater() {
    if (skaterModel.current) {
      skater.current.remove(skaterModel.current);
    }
    if (skaterPositionModel.current) {
      skater.current.remove(skaterPositionModel.current);
    }
    if (shadow.current) {
      skater.current.remove(shadow.current);
    }
  }

  async function renderSkater(mc) {
    removeExistingSkater();
    await addSkater(mc);
    if (mc !== mountCount.current) return;
    addShadow(skater.current);
    addBoundingElement(skater.current);

    updateSkaterFromProps();

    props.scene.add(skater.current);
  }

  return <></>;
}

export default Skater3D;
