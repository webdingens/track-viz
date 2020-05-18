import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { TimelineLite } from 'gsap';

import TrackGeometry from './TrackGeometry';
import {
  getRelativeVPosition,
  setPositionFromVAndDist,
  getClosestNextPivotLineDist,
  getClosestNextAngle,
} from '../../utils/packFunctions';

import {
  selectCurrentTrack,
} from '../../app/reducers/currentTrackSlice';

import {
  selectIsPlaying,
  selectCurrentSequence,
  setIsPlaying,
} from '../../app/reducers/currentSequenceSlice';

class TrackAnimating extends React.PureComponent {

  constructor(props) {
    super(props);

    this.trackBeforePlayback = _.cloneDeep(this.props.currentTrack);
    this.animatingTrack = _.cloneDeep(this.props.currentTrack);

    this.state = {
      currentTrack: _.cloneDeep(this.props.currentTrack)
    };
  }

  componentDidMount() {
    // save copy
    this.animateSequence();
  }

  componentWillUnmount() {
    if (this.timeline) this.timeline.kill();
  }

  animateSequence() {
    // this.animateSimple();
    this.animateAlongMeasurementLine();
  }

  animateSimple() {
    let tl = new TimelineLite({
      onUpdate: () => {
        this.setState({
          currentTrack: _.cloneDeep(this.animatingTrack)
        });
      }
    });
    let tracks = this.props.currentSequence.tracks;
    let firstTrack = true;
    let prevTrackIdx;
    let prevTrackEnd = 0;
    for (let i=0;i<tracks.length;i++) {
      let track = tracks[i];
      if (track.empty) continue;

      for (let j=0;j<track.skaters.length;j++) {
        if (firstTrack) {
          tl.to(this.animatingTrack.skaters[j], {
            // rotation: track.skaters[j].rotation,
            x: track.skaters[j].x,
            y: track.skaters[j].y,
            duration: .2,
          }, 0);
        } else {
          tl.to(this.animatingTrack.skaters[j], {
            // rotation: track.skaters[j].rotation,
            x: track.skaters[j].x,
            y: track.skaters[j].y,
            duration: .2 * (i - prevTrackIdx)
          }, prevTrackEnd + .5);
        }
      }
      prevTrackEnd = firstTrack ? .2 + .5 : prevTrackEnd + .5 + .2 * (i - prevTrackIdx);
      prevTrackIdx = i;
      firstTrack = false;
    }
    tl.add(() => this.props.setIsPlaying(false), '+=1')
    this.timeline = tl;
  }

  getTrackWithRelativeVPositions(animatingTrack) {
    let track = _.cloneDeep(animatingTrack);
    track.skaters.forEach((skater, idx, arr) => {
      arr[idx].v = getRelativeVPosition(skater);
    })
    return track;
  }

  setTrackWithUpdatedPosition(animatingTrack) {
    let track = _.cloneDeep(animatingTrack);
    track.skaters = track.skaters.map((skater) => setPositionFromVAndDist(skater))
    return track;
  }

  animateAlongMeasurementLine() {
    // set relative positions to measurement line
    this.animatingTrack = this.getTrackWithRelativeVPositions(this.animatingTrack);

    let tl = new TimelineLite({
      onUpdate: () => {
        this.setState({
          currentTrack: this.setTrackWithUpdatedPosition(this.animatingTrack)
        });
      }
    });

    let tracks = this.props.currentSequence.tracks;
    let firstTrack = true;
    let prevTrackIdx;
    let prevTrack = this.props.currentTrack;
    let prevTrackEnd = 0;
    for (let i=0;i<tracks.length;i++) {
      let track = tracks[i];
      if (track.empty) continue;

      track = this.getTrackWithRelativeVPositions(track);

      for (let j=0;j<track.skaters.length;j++) {
        track.skaters[j].pivotLineDist = getClosestNextPivotLineDist(prevTrack.skaters[j].pivotLineDist, track.skaters[j].pivotLineDist);
        track.skaters[j].rotation = getClosestNextAngle(prevTrack.skaters[j].rotation, track.skaters[j].rotation);

        if (firstTrack) {
          tl.to(this.animatingTrack.skaters[j], {
            rotation: track.skaters[j].rotation,
            pivotLineDist: track.skaters[j].pivotLineDist,
            v: track.skaters[j].v,
            duration: .2,
          }, 0);
        } else {
          // set pivot Line Dist based on prevTrack
          tl.to(this.animatingTrack.skaters[j], {
            rotation: track.skaters[j].rotation,
            pivotLineDist: track.skaters[j].pivotLineDist,
            v: track.skaters[j].v,
            duration: .2 * (i - prevTrackIdx)
          }, prevTrackEnd + .5);
        }
      }

      prevTrackEnd = firstTrack ? .2 + .5 : prevTrackEnd + .5 + .2 * (i - prevTrackIdx);
      prevTrackIdx = i;

      prevTrack = track;
      firstTrack = false;
    }
    tl.add(() => this.props.setIsPlaying(false), '+=1')
    this.timeline = tl;
  }

  render() {
    return (
      <div className="track-animating">
        <TrackGeometry skaters={this.state.currentTrack.skaters} />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    currentTrack: selectCurrentTrack(state),
    currentSequence: selectCurrentSequence(state),
    isPlaying: selectIsPlaying(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setIsPlaying: (val) => dispatch(setIsPlaying(val)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TrackAnimating);