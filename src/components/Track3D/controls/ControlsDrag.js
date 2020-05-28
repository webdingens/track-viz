import * as THREE from 'three';
import _ from 'lodash';

import ControlsBase from './ControlsBase';
import store from '../../../app/store';

import {
  updateSkater,
} from '../../../app/reducers/currentTrackSlice';

import {
  setUserIsInteractingWithTrack3D,
} from '../../../app/reducers/currentTransientsSlice';


import { DragControls } from './threejs/DragControls';

// TODO: move things from context to options
// TODO: use dispatch in controls instead of using the props actions

const DRAGGABLES = [
  'Skater3D'
];

class ControlsDrag extends ControlsBase {
  constructor(options) {
    super(options);

    let { renderer, camera, context } = options;
    this.camera = camera;
    this.renderer = renderer;
    this.context = context;
    this.onDrag = this.onDrag.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);

    this.animate = this.animate.bind(this);
    this.updateSkaterThrottled = _.throttle(this.updateSkater, 25);
    this.requestAnimate = this.requestAnimate.bind(this);

    this.setupControls();
  }

  getDragObjects() {
    let draggableObjects =  _.filter(this.context.scene.children, (o) => DRAGGABLES.indexOf(o.name) !== -1);

    let boundingElements = [];
    draggableObjects.forEach((obj) => {
      let _boundingElements = obj.children.filter((o) => o.name === 'Bounding Element');
      boundingElements.push(..._boundingElements);
    })

    return boundingElements;
  }

  setupControls() {

    this.objects = this.getDragObjects();

    this.enableSelection = false;

    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.group = new THREE.Group();

    this.controls = new DragControls([...this.objects], this.camera, this.renderer.domElement);

    this.controls.addEventListener('drag', this.onDrag, false);
    this.controls.addEventListener('dragstart', this.onDragStart, false);
    this.controls.addEventListener('dragend', this.onDragEnd, false);
    this.controls.addEventListener('hoveron', this.requestAnimate, false);
    this.controls.addEventListener('hoveroff', this.requestAnimate, false);

    this.requestAnimate();
  }

  updateSkater() {
    if (this.currentSkater) store.dispatch(updateSkater(this.currentSkater))
    this.requestAnimate();
  }

  onDrag({ object }) {
    this.currentSkater = {
      id: object.skaterId,
      x: object.position.x,
      y: object.position.z,
    }

    this.updateSkaterThrottled();
  }

  onDragStart() {
    store.dispatch(setUserIsInteractingWithTrack3D(true))
  }

  onDragEnd() {
    store.dispatch(setUserIsInteractingWithTrack3D(false))
  }

  animate() {
    this.renderer.render( this.context.scene, this.camera );

    this.animationRequest = null;
  }

  destroy() {
    this.controls.removeEventListener('drag', this.requestAnimate);
    this.controls.removeEventListener('dragstart', this.onDragStart);
    this.controls.removeEventListener('dragend', this.onDragEnd);
    this.controls.removeEventListener('hoveron', this.requestAnimate);
    this.controls.removeEventListener('hoveroff', this.requestAnimate);

    this.controls.dispose();
    this.controls = null;

    if (this.animationRequest) {
      cancelAnimationFrame(this.animationRequest);
      this.animationRequest = null;
    }
  }
}

export default ControlsDrag;