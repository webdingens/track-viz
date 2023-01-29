import React, { createRef } from "react";
import { connect } from "react-redux";

import { gsap } from "gsap";
import Draggable from "gsap/Draggable";
import _ from "lodash";

import TrackGeometry from "./TrackGeometry";

import {
  setSkaters,
  selectCurrentSkatersWDP,
} from "../../app/reducers/currentTrackSlice";
import { selectGeneralSettings } from "../../app/reducers/settingsGeneralSlice";
import { selectTrackOrientation } from "../../app/reducers/settingsTrackSlice";

import "../../utils/composedPathPolyfill";

gsap.registerPlugin(Draggable);

class TrackDragging extends React.Component {
  state = {
    dragging: 0,
  };

  trackContainer = createRef();

  componentDidMount() {
    this.initSkaterNodes();
    this.draggables = [];
    this.skaterNodes.forEach((el) => {
      let moveDraggable = Draggable.create(el, {
        bounds: this.trackContainer.current.parentNode,
        minimumMovement: 0.01,
        target: el.querySelectorAll(".js-skater-body-wrapper")[0],
        onDragStart: this.onDragStart,
        onDragStartParams: [this],
        onDrag: this.onDrag,
        onDragParams: [this],
        onDragEnd: this.onDragEnd,
        onDragEndParams: [this],
        onClick: this.onClick,
        onClickParams: [this],
      })[0];

      let rotationWrapper = el.querySelectorAll(
        ".js-skater-rotation-wrapper"
      )[0];
      gsap.set(rotationWrapper, {
        svgOrigin: "0, 0",
      });
      let rotateDraggable = Draggable.create(rotationWrapper, {
        minimumMovement: 0.01,
        type: "rotation",
        target: rotationWrapper.querySelectorAll(
          ".js-rotation-handle circle"
        )[0],
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
        dragAction: "move",
      });
    });

    this.trackContainer.current.addEventListener("click", this.onClickBody);
  }

  componentDidUpdate() {
    this.draggables.forEach((draggable, idx) => {
      let skater = this.props.skaters[idx];
      if (
        skater.x !== draggable.moveDraggable.x ||
        skater.y !== draggable.moveDraggable.y
      ) {
        gsap.set(draggable.moveDraggable.target, {
          x: skater.x,
          y: skater.y,
        });
        draggable.moveDraggable.update();
      }

      if (skater.rotation !== draggable.rotateDraggable.rotation) {
        gsap.set(draggable.rotateDraggable.target, {
          rotation: skater.rotation,
        });
        draggable.rotateDraggable.update();
      }
    });
  }

  componentWillUnmount() {
    document.body.removeEventListener("click", this.onClickBody);

    this.draggables.forEach((draggable) => {
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
    instance.draggables.forEach((draggable) => {
      draggable.moveDraggable.enable();
      draggable.rotateDraggable.disable();
    });
    if (!skaterAlreadyHasFocus) {
      instance.draggables[idx].moveDraggable.disable();
      instance.draggables[idx].rotateDraggable.enable();
    }

    instance.props.setSkaters(skaters);
  }

  onDragStart(instance) {
    instance.setState({
      dragging: instance.state.dragging + 1,
    });
  }

  onDrag(instance) {
    let draggable = this;
    let target = draggable.target;
    let idx = target.dataset.idx;

    instance.collisionDetection(+idx, draggable.x, draggable.y);
    instance.storeDragPosition(instance);
  }

  onDragEnd(instance) {
    instance.decreaseDragging();
    instance.storeDragPosition(instance);
  }

  storeDragPosition(instance) {
    let skaters = _.cloneDeep(instance.props.skaters);
    instance.draggables.forEach((draggable, i) => {
      skaters[i].x = draggable.moveDraggable.x;
      skaters[i].y = draggable.moveDraggable.y;
    });

    instance.props.setSkaters(skaters);
  }

  onDragRotateStart(instance) {
    let draggable = this;
    let target = draggable.target;
    let idx = target.dataset.idx;

    instance.draggables[idx].isRotating = true;
    instance.setState({
      dragging: instance.state.dragging + 1,
    });
  }

  onDragRotate(instance) {
    let draggable = this;
    let target = draggable.target;
    let idx = target.dataset.idx;

    let skater = instance.props.skaters[idx];
    if (!(skater.isPivot || skater.isJammer)) {
      let text =
        instance.skaterNodes[idx].querySelectorAll(".js-blocker-number")[0];
      gsap.set(text, {
        svgOrigin: "0, 0",
        rotate: -draggable.rotation - instance.props.trackOrientation,
      });
    }
    let statusIcon =
      instance.skaterNodes[idx].querySelectorAll(".js-status-icon")[0];
    gsap.set(statusIcon, {
      svgOrigin: "0, 0",
      rotate: -draggable.rotation - instance.props.trackOrientation,
    });

    instance.storeDragRotation(instance);
  }

  onDragRotateEnd(instance) {
    instance.decreaseDragging();
    instance.storeDragRotation(instance);
  }

  storeDragRotation(instance) {
    let skaters = _.cloneDeep(instance.props.skaters);
    instance.draggables.forEach((draggable, i) => {
      skaters[i].rotation = draggable.rotateDraggable.rotation;
      draggable.isRotating = false;
    });

    let isRotating = false;
    instance.draggables.forEach((draggable) => {
      if (draggable.isRotating) isRotating = true;
    });
    if (!isRotating) instance.lastRotation = +new Date();

    instance.props.setSkaters(skaters);
  }

  decreaseDragging = () => {
    let stillDragging = this.state.dragging - 1;
    if (stillDragging < 0)
      throw Error("stillDragging was negative, should be at least 0");

    this.setState({
      dragging: stillDragging,
    });
  };

  onClickBody = (evt) => {
    // this.debugMath(evt);

    let path = evt.path || (evt.composedPath && evt.composedPath());

    let isRotating = false;
    this.draggables.forEach((draggable) => {
      if (draggable.isRotating) isRotating = true;
    });
    if (isRotating) return;
    if (this.lastRotation && +new Date() < this.lastRotation + 30) return;

    for (let i = 0, l = path.length; i < l; i++) {
      if (path[i].id === "root") {
        let skaters = _.cloneDeep(this.props.skaters);

        // remove focus from others, add to clicked
        skaters.forEach((skater) => {
          skater.hasFocus = false;
        });

        // disable rotation drag from all, add to clicked
        this.draggables.forEach((draggable) => {
          draggable.moveDraggable.enable();
          draggable.rotateDraggable.disable();
        });

        this.props.setSkaters(skaters);
        break;
      }

      let el = path[i];
      if (el.classList.contains("js-skater")) break;
    }
  };

  debugMath(evt) {
    if (!this.clickpoints) this.clickpoints = [];
    this.clickpoints.push({ x: evt.clientX, y: evt.clientY });
    if (this.clickpoints.length === 2) {
      let mappedPoints = this.clickpoints.map((point) => {
        const pt = this.trackContainer.current.createSVGPoint();
        pt.x = point.x;
        pt.y = point.y;
        const svgGlobal = pt.matrixTransform(
          this.trackContainer.current.getScreenCTM().inverse()
        );
        return svgGlobal;
      });
      this.clickpoints = [];

      const P1 = mappedPoints[0];
      const P2 = mappedPoints[1];

      const CR = { x: 5.33, y: 0 };
      const CL = { x: -5.33, y: 0 };

      /*
       *   First Curve
       */

      // Circle Right to P1 vec
      const CRP1 = {
        x: P1.x - CR.x,
        y: P1.y - CR.y,
      };
      // Circle Right to P2 vec
      const CRP2 = {
        x: P2.x - CR.x,
        y: P2.y - CR.y,
      };

      let alphaCR = Math.atan2(CRP1.y + CRP2.y, CRP1.x + CRP2.x);

      while (alphaCR < 0) {
        alphaCR = alphaCR + 2 * Math.PI;
      }

      if (alphaCR >= (3 / 2) * Math.PI || alphaCR <= (1 / 2) * Math.PI) {
        console.log("in first curve");

        const distance =
          2 * Math.abs(Math.cos(alphaCR) * CRP1.y - Math.sin(alphaCR) * CRP1.x);
        console.log("distance: ", distance);
        console.log("alpha: ", (alphaCR * 180) / Math.PI);
      }

      /*
       *   Second Curve
       */

      // Circle Left to P1 vec
      const CLP1 = {
        x: P1.x - CL.x,
        y: P1.y - CL.y,
      };
      // Circle Left to P2 vec
      const CLP2 = {
        x: P2.x - CL.x,
        y: P2.y - CL.y,
      };

      let alphaCL = Math.atan2(CLP1.y + CLP2.y, CLP1.x + CLP2.x);

      while (alphaCL < 0) {
        alphaCL = alphaCL + 2 * Math.PI;
      }

      if (alphaCL >= (1 / 2) * Math.PI && alphaCL <= (3 / 2) * Math.PI) {
        console.log("in second curve");

        const distance =
          2 * Math.abs(Math.cos(alphaCL) * CLP1.y - Math.sin(alphaCL) * CLP1.x);
        console.log("distance: ", distance);
        console.log("alpha: ", (alphaCL * 180) / Math.PI);
      }

      /*
       *   Sides
       */
      const PMid = {
        x: 0.5 * (P1.x + P2.x),
        y: 0.5 * (P1.y + P2.y),
      };

      if (PMid.x < CR.x && PMid.x > CL.x) {
        console.log("in straight");
        if (P1.y * P2.y < 0) {
          console.log("Skaters on opposing sides");
        } else {
          const distance = Math.abs(P1.x - P2.x);
          console.log("distance: ", distance);
        }
      }
    }
  }

  collisionDetection(idx, x, y) {
    let collisions = [];
    this.draggables.forEach((draggable, i) => {
      if (idx === i) return;

      let dx = draggable.moveDraggable.x - x;
      let dy = draggable.moveDraggable.y - y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 0.65) {
        let xnew = x + (0.655 * dx) / dist;
        let ynew = y + (0.655 * dy) / dist;

        gsap.set(draggable.moveDraggable.target, {
          x: xnew,
          y: ynew,
        });
        draggable.moveDraggable.update();
        collisions.push([i, xnew, ynew]);
      }
    });

    let collisionDetected = collisions.length > 0;
    collisions.forEach((collision) =>
      this.collisionDetection(collision[0], collision[1], collision[2])
    );
    return collisionDetected;
  }

  initSkaterNodes() {
    this.skaterNodes = [];
    Array.prototype.forEach.call(
      this.trackContainer.current.querySelectorAll(".js-skater"),
      (el) => this.skaterNodes.push(el)
    );
  }

  render() {
    return (
      <TrackGeometry
        trackContainerRef={this.trackContainer}
        skaters={this.props.skaters}
        preventDragUpdate={this.state.dragging > 0}
      />
    );
  }
}

//
//  React Redux Connection
//
const mapStateToProps = (state) => {
  const settings = selectGeneralSettings(state);
  return {
    skaters: selectCurrentSkatersWDP(state, settings.packMeasuringMethod),
    trackOrientation: selectTrackOrientation(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setSkaters: (skaters) => dispatch(setSkaters(skaters)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TrackDragging);