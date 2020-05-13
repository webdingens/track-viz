import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils';

let modelOriginal;
let modelA;
let modelB;

let textureLoader = new THREE.TextureLoader();
let modelRedRequest;
let modelLoader = new GLTFLoader();
let modelRequest;


export const loadModel = (team) => new Promise((resolve, reject) => {

  console.log('loading Team: ', team)
  if (team === 'B' && modelB) return resolve(SkeletonUtils.clone(modelB));
  if (team === 'A' && modelA) return resolve(SkeletonUtils.clone(modelA));

  if (!modelRequest) {
    modelRequest = new Promise((resolve, reject) => {
      modelLoader.load(
        'models/Skater1B/Skater1B.gltf',
        (gltf) => resolve(gltf),
        null,
        (evt) => reject(evt.message)
      )
    });
  }

  modelRequest.then((gltf) => {
    if (!modelOriginal) {
      modelOriginal = SkeletonUtils.clone(gltf.scene.children[0]);
      // remove partial culling of stuff
      for (let child of modelOriginal.children) {
        child.frustumCulled = false;
      }
    }

    if (!modelRedRequest) {
      modelRedRequest = new Promise((resolve, reject) => {
        textureLoader.load(
          window.location.href + 'models/Skater1B/textures/female_casualsuit02_diffuse_red.png',
          (texture) => {
            
            // create our second model with this
            let model = SkeletonUtils.clone(modelOriginal);
            let material = model.children[3].material.clone();
            let img = material.map;
            material.map = texture;
            material.map.flipY = false;
            img.dispose()

            model.children[3].material = material;

            modelA = model;
            resolve();
          },
          null,
          (evt) => reject(evt.message)
        )
      });
    }

    if (team === 'B' && modelB) return resolve(SkeletonUtils.clone(modelB));
    if (team === 'A' && modelA) return resolve(SkeletonUtils.clone(modelA));

    if (team === 'A') {
      modelRedRequest.then(() => {
        return resolve(SkeletonUtils.clone(modelA));
      })
    } else {
      modelB = SkeletonUtils.clone(modelOriginal);
      return resolve(SkeletonUtils.clone(modelB));
    }
  })
})

export default { loadModel }