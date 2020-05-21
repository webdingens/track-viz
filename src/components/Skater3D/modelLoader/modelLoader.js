import * as THREE from 'three';
import _ from 'lodash';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils';

let modelA;
let modelB;
let modelHelmet;
const helmetPaths = ['A.pivot', 'A.jammer', 'A.blocker', 'B.pivot', 'B.jammer', 'B.blocker'];
let helmetTextures = {
  A: {
    pivot: 'capRedPivot',
    jammer: 'capRedJammer',
    blocker: 'capRedBlocker'
  },
  B: {
    pivot: 'capGreenPivot',
    jammer: 'capGreenJammer',
    blocker: 'capGreenBlocker'
  }
}
let helmets = {}

let textureLoader = new THREE.TextureLoader();
let modelLoader = new GLTFLoader();

let skaterModelRequest;

const requestModels = () => {
  if (skaterModelRequest) return skaterModelRequest;
  
  skaterModelRequest = new Promise((resolve, reject) => {
    let skaterRequests = [
      (new Promise((resolve, reject) => {
        modelLoader.load(
          'models/Skater1B/Skater1B.gltf',
          (gltf) => {
            modelA = gltf.scene.children[0];
            // remove partial culling of stuff
            for (let child of modelA.children) {
              child.frustumCulled = false;
            }
            resolve();
          },
          null,
          reject
        )
      })).then(() => new Promise((resolve, reject) => {
        textureLoader.load(
          window.location.href + 'models/Skater1B/textures/female_casualsuit02_diffuse_red.png',
          (texture) => {
            let materialIdx = _.findIndex(modelA.children, (child) => child.name === 'Skater1_bFemale_casualsuit02')
            let material = modelA.children[materialIdx].material;
            let img = material.map;
            material.map = texture;
            material.map.needsUpdate = true;
            material.map.flipY = false;
            material.needsUpdate = true;
            img.dispose();

            modelA.children[materialIdx].material = material;

            resolve();
          },
          null,
          (evt) => reject(evt.message)
        )
      })),
      (new Promise((resolve, reject) => {
        modelLoader.load(
          'models/Skater1B/Skater1B.gltf',
          (gltf) => {
            modelB = gltf.scene.children[0];
            // remove partial culling of stuff
            for (let child of modelB.children) {
              child.frustumCulled = false;
            }
            resolve();
          },
          null,
          reject
        )
      }))
    ]
    Promise.all(skaterRequests)
      .then(resolve).catch(reject);

  })

  return skaterModelRequest;
}

let helmetModelRequest;
const requestHelmets = () => {
  if (helmetModelRequest) return helmetModelRequest;

  helmetModelRequest = new Promise((resolve, reject) => {
    let helmetRequests = [];

    helmetPaths.forEach((objPath) => {
      helmetRequests.push(new Promise((resolve, reject) => {
        textureLoader.load(
          window.location.href + 'models/Helmet/textures/'+_.get(helmetTextures, objPath)+'.png',
          (texture) => {
            _.set(helmetTextures, objPath, texture);

            resolve();
          },
          null,
          (evt) => reject(evt.message)
        )
      }))
    });
    helmetRequests.push(new Promise((resolve, reject) => {
      modelLoader.load(
        'models/Helmet/Helmet.gltf',
        (gltf) => {
          modelHelmet = gltf.scene.children[0];
          resolve();
        },
        null,
        reject
      )
    }));

    Promise.all(helmetRequests)
      .then(generateHelmetModels)
      .then(resolve).catch(reject);

  });
  return helmetModelRequest;
}

const generateHelmetModels = () => {
  helmetPaths.forEach((objPath) => {
    let helmet = modelHelmet.clone();
    helmet.children[1].material = helmet.children[1].material.clone();
    let material = helmet.children[1].material;
    material.map = _.get(helmetTextures, objPath).clone();
    material.map.needsUpdate = true;
    material.map.flipY = false;
    material.needsUpdate = true;

    _.set(helmets, objPath, helmet);
  })
}

export const loadHelmet = (skater) => new Promise((resolve, reject) => {
  requestHelmets().then(() => {
    let objPath = skater.team + '.';
    if (skater.isJammer) {
      objPath += 'jammer'
    } else if(skater.isPivot) {
      objPath += 'pivot'
    } else {
      objPath += 'blocker'
    }
    resolve(_.get(helmets, objPath).clone())
  }).catch(reject);
})

export const loadModel = (team) => new Promise((resolve, reject) => {
  if (team === 'B' && modelB) return resolve(SkeletonUtils.clone(modelB));
  if (team === 'A' && modelA) return resolve(SkeletonUtils.clone(modelA));

  requestModels().then(() => {
    if (team === 'A') {
      return resolve(SkeletonUtils.clone(modelA));
    } else {
      return resolve(SkeletonUtils.clone(modelB));
    }
  })
})

export default { loadModel }