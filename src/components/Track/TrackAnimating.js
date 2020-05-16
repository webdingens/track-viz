import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { TimelineLite } from 'gsap';

import TrackGeometry from './TrackGeometry';

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
    let tl = new TimelineLite({
      onUpdate: () => {
        this.setState({
          currentTrack: _.cloneDeep(this.animatingTrack)
        });
      }
    });
    let tracks = this.props.currentSequence.tracks;
    let firstTrack = true;
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
            duration: .2
          }, .2 * i + 1.2);
        }
      }
      firstTrack = false;
    }
    tl.add(() => this.props.setIsPlaying(false), '+=1')
    this.timeline = tl;
  }

  render() {
    return (
      <div className="Animating??!!">
      <TrackGeometry skaters={this.state.currentTrack.skaters} /></div>
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