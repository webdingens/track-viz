import React from "react";
import { connect } from "react-redux";
import _ from "lodash";
import { TimelineLite } from "gsap";

import {
  getRelativeVPosition,
  setPositionFromVAndDist,
  getClosestNextPivotLineDist,
  getClosestNextAngle,
} from "../../utils/packFunctions";

import { selectCurrentTrack } from "../../app/reducers/currentTrackSlice";

import {
  selectIsPlaying,
  selectCurrentSequence,
  setIsPlaying,
  ANIMATION_STATE,
  setAnimationState,
  selectAnimationState,
} from "../../app/reducers/currentSequenceSlice";

import {
  setAnimatingTrack,
  selectAnimatingTrack,
} from "../../app/reducers/animatingTrackSlice";

class Player extends React.Component {
  componentDidUpdate(prevProps) {
    if (this.props.isPlaying !== prevProps.isPlaying) {
      if (this.props.isPlaying) {
        // start animation with current track
        this.animatingTrack = _.cloneDeep(this.props.currentTrack);
        this.props.setAnimatingTrack(this.animatingTrack);
        this.props.setAnimationState(ANIMATION_STATE.PLAYING);
      } else {
        if (this.timeline) this.timeline.kill();
        this.props.setAnimationState(ANIMATION_STATE.STOPPED);
      }
    }

    if (this.props.animationState !== prevProps.animationState) {
      // start animation
      switch (this.props.animationState) {
        case ANIMATION_STATE.PLAYING:
          this.animateSequence();
          break;
        default:
          break;
      }
    }

    this.requestUpdate = false;
  }

  purgeTrack(track) {
    let ret = _.cloneDeep(track);
    ret.skaters.forEach((skater, idx, arr) => {
      if (arr[idx]._gsap) delete arr[idx]._gsap;
    });
    return ret;
  }

  animateSequence() {
    // this.animateSimple();
    this.animateAlongMeasurementLine();
  }

  animateSimple() {
    let tl = new TimelineLite({
      onUpdate: () => {
        this.needsUpdate = true;
      },
    });
    let tracks = this.props.currentSequence.tracks;
    let firstTrack = true;
    let prevTrackIdx;
    let prevTrackEnd = 0;
    for (let i = 0; i < tracks.length; i++) {
      let track = tracks[i];
      if (track.empty) continue;

      for (let j = 0; j < track.skaters.length; j++) {
        if (firstTrack) {
          tl.to(
            this.animatingTrack.skaters[j],
            {
              // rotation: track.skaters[j].rotation,
              x: track.skaters[j].x,
              y: track.skaters[j].y,
              duration: 0.2,
            },
            0
          );
        } else {
          tl.to(
            this.animatingTrack.skaters[j],
            {
              // rotation: track.skaters[j].rotation,
              x: track.skaters[j].x,
              y: track.skaters[j].y,
              duration: 0.2 * (i - prevTrackIdx),
            },
            prevTrackEnd + 0.5
          );
        }
      }
      prevTrackEnd = firstTrack
        ? 0.2 + 0.5
        : prevTrackEnd + 0.5 + 0.2 * (i - prevTrackIdx);
      prevTrackIdx = i;
      firstTrack = false;
    }
    tl.add(() => this.props.setIsPlaying(false), "+=1");
    this.timeline = tl;
  }

  animateAlongMeasurementLine() {
    // set relative positions to measurement line
    this.animatingTrack = this.getTrackWithRelativeVPositions(
      this.animatingTrack
    );

    let tl = new TimelineLite({
      onUpdate: () => {
        if (!this.requestUpdate) {
          let track = this.purgeTrack(
            this.setTrackWithUpdatedPosition(this.animatingTrack)
          );
          this.requestUpdate = true;
          this.props.setAnimatingTrack(track);
        }
      },
    });

    let tracks = this.props.currentSequence.tracks;
    let firstTrack = true;
    let prevTrackIdx;
    let prevTrack = this.props.currentTrack;
    let prevTrackEnd = 0;
    for (let i = 0; i < tracks.length; i++) {
      let track = tracks[i];
      if (track.empty) continue;

      track = this.getTrackWithRelativeVPositions(track);

      for (let j = 0; j < track.skaters.length; j++) {
        track.skaters[j].pivotLineDist = getClosestNextPivotLineDist(
          prevTrack.skaters[j].pivotLineDist,
          track.skaters[j].pivotLineDist
        );
        track.skaters[j].rotation = getClosestNextAngle(
          prevTrack.skaters[j].rotation,
          track.skaters[j].rotation
        );

        if (firstTrack) {
          tl.to(
            this.animatingTrack.skaters[j],
            {
              rotation: track.skaters[j].rotation,
              pivotLineDist: track.skaters[j].pivotLineDist,
              v: track.skaters[j].v,
              duration: 0.2,
            },
            0
          );
        } else {
          // set pivot Line Dist based on prevTrack
          tl.to(
            this.animatingTrack.skaters[j],
            {
              rotation: track.skaters[j].rotation,
              pivotLineDist: track.skaters[j].pivotLineDist,
              v: track.skaters[j].v,
              duration: 0.2 * (i - prevTrackIdx),
            },
            prevTrackEnd + 0.5
          );
        }
      }

      prevTrackEnd = firstTrack
        ? 0.2 + 0.5
        : prevTrackEnd + 0.5 + 0.2 * (i - prevTrackIdx);
      prevTrackIdx = i;

      prevTrack = track;
      firstTrack = false;
    }
    tl.add(() => this.props.setIsPlaying(false), "+=1");
    this.timeline = tl;
  }

  getTrackWithRelativeVPositions(animatingTrack) {
    let track = _.cloneDeep(animatingTrack);
    track.skaters.forEach((skater, idx, arr) => {
      arr[idx].v = getRelativeVPosition(skater);
    });
    return track;
  }

  setTrackWithUpdatedPosition(animatingTrack) {
    let track = _.cloneDeep(animatingTrack);
    track.skaters.forEach((skater, idx, arr) => {
      arr[idx] = setPositionFromVAndDist(arr[idx]);
    });
    return track;
  }

  componentWillUnmount() {
    if (this.timeline) this.timeline.kill();
    this.props.setAnimationState(ANIMATION_STATE.STOPPED);
  }

  render() {
    return <></>;
  }
}

const mapStateToProps = (state) => {
  return {
    currentTrack: selectCurrentTrack(state),
    currentSequence: selectCurrentSequence(state),
    isPlaying: selectIsPlaying(state),
    animatingTrack: selectAnimatingTrack(state),
    animationState: selectAnimationState(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setIsPlaying: (val) => dispatch(setIsPlaying(val)),
    setAnimatingTrack: ({ skaters, refs }) =>
      dispatch(setAnimatingTrack({ skaters, refs })),
    setAnimationState: (val) => dispatch(setAnimationState(val)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Player);
