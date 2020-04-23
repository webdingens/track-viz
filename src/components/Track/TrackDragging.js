import React, { createRef } from 'react';
import { connect } from 'react-redux'

import { gsap } from 'gsap';
import Draggable from 'gsap/Draggable';
import _ from 'lodash';

import Track from './Track';

import {
  setSkaters,
  selectCurrentSkaters
} from '../../app/reducers/currentTrackSlice';

gsap.registerPlugin(Draggable);

class TrackDragging extends React.Component {
  constructor(props) {
    super(props);

    this.trackContainer = createRef();

    this.onClickBody = this.onClickBody.bind(this);
  }

  componentDidMount() {
    this.initSkaterNodes();
    this.draggables = [];
    this.skaterNodes.forEach((el) => {
      let moveDraggable = Draggable.create(el, {
        bounds: window,
        minimumMovement: .01,
        target: el.querySelectorAll('.js-skater-body-wrapper')[0],
        onDrag: this.onDrag,
        onDragParams: [this],
        onDragEnd: this.onDragEnd,
        onDragEndParams: [this],
        onClick: this.onClick,
        onClickParams: [this],
      })[0];

      let rotationWrapper = el.querySelectorAll('.js-skater-rotation-wrapper')[0];
      gsap.set(rotationWrapper, {
        svgOrigin: '0, 0'
      });
      let rotateDraggable = Draggable.create(rotationWrapper, {
        minimumMovement: .01,
        type: 'rotation',
        target: rotationWrapper.querySelectorAll('.js-rotation-handle circle')[0],
        onDragStart: this.onDragRotateStart,
        onDragStartParams: [this],
        onDrag: this.onDragRotate,
        onDragParams: [this],
        onDragEnd: this.onDragRotateEnd,
        onDragEndParams: [this],
        onClick: this.onClick,
        onClickParams: [this],
      })[0];

      rotateDraggable.disable();

      this.draggables.push({
        moveDraggable,
        rotateDraggable,
        dragAction: 'move'
      });
    });

    document.body.addEventListener('click', this.onClickBody);
  }

  componentDidUpdate() {

    this.draggables.forEach((draggable, idx) => {
      let skater = this.props.skaters[idx];
      if (skater.x !== draggable.moveDraggable.x || skater.y !== draggable.moveDraggable.y) {
        gsap.set(draggable.moveDraggable.target, {
          x: skater.x,
          y: skater.y
        });
        draggable.moveDraggable.update();
      }
      
      if (skater.rotation !== draggable.rotateDraggable.rotation ) {
        gsap.set(draggable.rotateDraggable.target, {
          rotation: skater.rotation
        });
        draggable.rotateDraggable.update();
      }
    });
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.onClickBody);

    this.draggables.forEach((draggable, idx) => {
      draggable.moveDraggable.kill();
      draggable.rotateDraggable.kill();
    });
  }

  onClick(instance) {
    this.pointerEvent.preventDefault();

    let draggable = this;
    let target = draggable.target;
    let idx = target.dataset.idx;
    let skaters = _.cloneDeep(instance.props.skaters);
    let skaterAlreadyHasFocus = skaters[idx].hasFocus;

    // remove focus from others, add to clicked
    skaters.forEach((skater) => {
      skater.hasFocus = false;
    });
    if (!skaterAlreadyHasFocus) skaters[idx].hasFocus = true;

    // disable rotation drag from all, add to clicked
    instance.draggables.forEach((draggable, i) => {
      draggable.moveDraggable.enable();
      draggable.rotateDraggable.disable();
    });
    if (!skaterAlreadyHasFocus) {
      instance.draggables[idx].moveDraggable.disable();
      instance.draggables[idx].rotateDraggable.enable();
    }

    instance.props.setSkaters(skaters)
  }

  onDrag(instance) {
    let draggable = this;
    let target = draggable.target;
    let idx = target.dataset.idx;

    instance.collisionDetection(+idx, draggable.x, draggable.y);
  }

  onDragEnd(instance) {
    let skaters = _.cloneDeep(instance.props.skaters);
    instance.draggables.forEach((draggable, i) => {
      skaters[i].x = draggable.moveDraggable.x;
      skaters[i].y = draggable.moveDraggable.y;
    });

    instance.props.setSkaters(skaters)
  }

  onDragRotateStart(instance) {
    let draggable = this;
    let target = draggable.target;
    let idx = target.dataset.idx;

    instance.draggables[idx].isRotating = true;
  }

  onDragRotate(instance) {
    let draggable = this;
    let target = draggable.target;
    let idx = target.dataset.idx;

    let skater = instance.props.skaters[idx];
    if (!(skater.isPivot || skater.isJammer)) {
      let text = instance.skaterNodes[idx].querySelectorAll('.js-blocker-number')[0];
      gsap.set(text, {
        svgOrigin: '0, 0',
        rotate: -draggable.rotation
      });
    }
  }

  onDragRotateEnd(instance) {
    let skaters = _.cloneDeep(instance.props.skaters);
    instance.draggables.forEach((draggable, i) => {
      skaters[i].rotation = draggable.rotateDraggable.rotation
      draggable.isRotating = false;
    });

    let isRotating = false;
    instance.draggables.forEach((draggable) => {
      if (draggable.isRotating) isRotating = true;
    })
    if (!isRotating) instance.lastRotation = +(new Date());

    instance.props.setSkaters(skaters)
  }

  onClickBody(evt) {
    let path = evt.path;

    let isRotating = false;
    this.draggables.forEach((draggable) => {
      if (draggable.isRotating) isRotating = true;
    })
    if (isRotating) return;
    if (this.lastRotation && +(new Date()) < this.lastRotation + 30) return;

    for (let i=0,l=path.length;i<l;i++){
      if (path[i].id === 'root') {
        let skaters = _.cloneDeep(this.props.skaters);

        // remove focus from others, add to clicked
        skaters.forEach((skater) => {
          skater.hasFocus = false;
        });

        // disable rotation drag from all, add to clicked
        this.draggables.forEach((draggable, i) => {
          draggable.moveDraggable.enable();
          draggable.rotateDraggable.disable();
        });

        this.props.setSkaters(skaters)
        break;
      }

      let el = path[i];
      if (el.classList.contains('js-skater')) break;
    }
  }

  collisionDetection(idx, x, y) {
    let collisions = [];
    this.draggables.forEach((draggable, i) => {
      if (idx === i) return;

      let dx = draggable.moveDraggable.x - x;
      let dy = draggable.moveDraggable.y - y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= .65) {
        let xnew = x + .655 * dx / dist;
        let ynew = y + .655 * dy / dist;

        gsap.set(draggable.moveDraggable.target, {
          x: xnew,
          y: ynew
        });
        draggable.moveDraggable.update();
        collisions.push([i, xnew, ynew]);
      }
    });

    let collisionDetected = collisions.length > 0;
    collisions.forEach((collision) => this.collisionDetection(collision[0], collision[1], collision[2]));
    return collisionDetected;
  }

  initSkaterNodes() {
    this.skaterNodes = [];
    Array.prototype.forEach.call(this.trackContainer.current.querySelectorAll('.js-skater'), (el) => this.skaterNodes.push(el));
  }

  render() {
    return (
      <Track trackContainerRef={this.trackContainer} skaters={this.props.skaters} />
    );
  }
}



//
//  React Redux Connection
//
const mapStateToProps = state => {
  return {
    skaters: selectCurrentSkaters(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setSkaters: (skaters) => dispatch(setSkaters(skaters))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TrackDragging);