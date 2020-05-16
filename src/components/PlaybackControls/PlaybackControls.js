import React from 'react';
import { connect } from 'react-redux';

import { FiPlay, FiSquare, FiRepeat } from "react-icons/fi";

import {
  selectIsPlaying,
  setIsPlaying,
} from '../../app/reducers/currentSequenceSlice';

import styles from './PlaybackControls.module.scss';

class PlaybackControls extends React.Component {
  render() {
    return (
      <div className={styles.PlaybackControls}>
        <button
          onClick={() => this.props.setIsPlaying(!this.props.isPlaying)}
        >{this.props.isPlaying ? <FiSquare /> : <FiPlay />}
        </button>
        <button><FiRepeat /></button>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    isPlaying: selectIsPlaying(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setIsPlaying: (val) => dispatch(setIsPlaying(val)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaybackControls);