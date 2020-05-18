import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import _ from 'lodash';

import Preview from './Preview';
import Player from './Player';

import {
  FiPlusCircle,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import { ReactComponent as StoreNub } from '../../images/storeNub.svg';

import {
  setCurrentTrack,
  selectCurrentTrack,
} from '../../app/reducers/currentTrackSlice';

import {
  addTrack,
  selectCurrentTracks,
  setTrack,
  removeTrack,
  moveTrackRight,
  moveTrackLeft,
} from '../../app/reducers/currentSequenceSlice';

import styles from './SequenceEditor.module.scss';

let previewId = 0;

class SequenceEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTrack: null,
      previews: [],
    }

    this.onPreviewShown = this.onPreviewShown.bind(this);
  }

  onPreviewShown(id) {
    let previews = this.state.previews.filter((preview) => preview.id !== id);
    this.setState({
      previews
    })
  }

  render() {
    return (
      <div className={styles.SequenceEditor}>
        <div className={styles.Tracks}>
          <ul>
            {this.props.tracks.map((track, idx) => (
              <li
                className={classNames({
                  [styles.Track]: true,
                  [styles.TrackActive]: track.id === this.state.activeTrack,
                })}
                key={track.id}
              >
                <label>
                  <input
                    type="radio"
                    name="tracks[]"
                    onClick={(evt) => {
                      let previews = this.state.previews;
                      if (!track.empty) {
                        previews = _.cloneDeep(previews);
                        previews.push({
                          bbox: evt.target.getBoundingClientRect(),
                          track,
                          id: previewId++,
                        })
                      }
                      this.setState({
                        activeTrack: track.id,
                        previews,
                      })
                    }}
                    onDoubleClick={() => {
                      if (!track.empty) this.props.setCurrentTrack(track)
                    }}
                  />
                  <span>Track {track.id}</span>
                  <StoreNub className={classNames({
                    [styles.StoreNub]: true,
                    [styles.StoreNubEmpty]: track.empty
                  })} />
                </label>

                {/* Controls for this track if active */}
                {track.id === this.state.activeTrack ? (
                  <>
                    {idx > 0 ? (
                      <button
                        className={styles.MoveLeft}
                        onClick={() => this.props.moveTrackLeft({ id: track.id })}
                      >
                        <span>Move Left</span>
                        <FiChevronLeft />
                      </button>
                    ) : null}

                    {idx < this.props.tracks.length - 1 ? (
                      <button
                        className={styles.MoveRight}
                        onClick={() => this.props.moveTrackRight({ id: track.id })}
                      >
                        <span>Move Right</span>
                        <FiChevronRight />
                      </button>
                    ): null}

                    <button
                      className={styles.Remove}
                      onClick={() => this.props.removeTrack({ id: track.id })}
                    >
                      <span>Remove</span>
                      <FiTrash2 />
                    </button>
                    <button
                      className={styles.Save}
                      onClick={() => this.props.setTrack({
                        id: track.id,
                        track: this.props.currentTrack,
                      })}
                    >
                      <span>Save</span>
                      <FiDownload />
                    </button>

                    {/* Show Button only when we have data to load */}
                    {track.empty ? null : (
                      <button
                        className={styles.Load}
                        onClick={() => this.props.setCurrentTrack(track)}
                      >
                        <span>Load</span>
                        <FiUpload />
                      </button>
                    )}
                  </>
                ) : null}
              </li>
            ))}
          </ul>
          <button
            className={styles.AddTrack}
            onClick={() => this.props.addTrack()}
          >
            <FiPlusCircle /><span>Add Track</span>
          </button>
        </div>

        <div>
          {this.state.previews.map((preview) => (
            <Preview
              key={preview.id}
              onShown={() => this.onPreviewShown(preview.id)}
              {...preview}
            />
          ))}
        </div>

        <Player />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    tracks: selectCurrentTracks(state),
    currentTrack: selectCurrentTrack(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addTrack: () => dispatch(addTrack()),
    setCurrentTrack: (track) => dispatch(setCurrentTrack(track)),
    setTrack: ({id, track}) => dispatch(setTrack({id, track})),
    removeTrack: ({id}) => dispatch(removeTrack({id})),
    moveTrackRight: ({id}) => dispatch(moveTrackRight({id})),
    moveTrackLeft: ({id}) => dispatch(moveTrackLeft({id})),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SequenceEditor);