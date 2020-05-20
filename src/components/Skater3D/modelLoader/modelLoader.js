import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils';

let modelA;
let modelB;

let textureLoader = new THREE.TextureLoader();
let textureRequest;
let modelLoader = new GLTFLoader();

const requestModels = () => new Promise((resolve, reject) => {
  let modelRequest = new Promise((resolve, reject) => {
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
  });
  modelRequest.then(() => {
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
    })).then(resolve).catch(reject)
  })
})

export const loadModel = (team) => new Promise((resolve, reject) => {
  if (team === 'B' && modelB) return resolve(SkeletonUtils.clone(modelB));
  if (team === 'A' && modelA) return resolve(SkeletonUtils.clone(modelA));

  requestModels().then(() => {
    if (team === 'A') {

      if (!textureRequest) {
        textureRequest = new Promise((resolve, reject) => {
          textureLoader.load(
            window.location.href + 'models/Skater1B/textures/female_casualsuit02_diffuse_red.png',
            (texture) => {
              let material = modelA.children[3].material.clone();
              let img = material.map;
              material.map = texture;
              material.map.needsUpdate = true;
              material.map.flipY = false;
              material.needsUpdate = true;
              img.dispose();
  
              modelA.children[3].material = material;
  
              resolve();
            },
            null,
            (evt) => reject(evt.message)
          )
        })
      }

      textureRequest.then(() => {
        return resolve(SkeletonUtils.clone(modelA));
      })
    } else {
      return resolve(SkeletonUtils.clone(modelB));
    }
  })
})

export default { loadModel }