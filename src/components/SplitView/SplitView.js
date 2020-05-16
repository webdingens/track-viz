import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import Track from '../Track/Track';
import Track3D from '../Track3D/Track3D';
import SequenceEditor from '../SequenceEditor/SequenceEditor';
import PlaybackControls from '../PlaybackControls/PlaybackControls';

import {
  selectGeneralSettings,
  setSequenceEditorVisibility,
} from '../../app/reducers/settingsGeneralSlice';

import {
  FiChevronsDown,
  FiChevronsUp
} from "react-icons/fi";

import styles from './SplitView.module.scss';

class SplitView extends React.Component {

  getColumns() {
    let columns = 0;
    if (this.props.settings.trackEditorVisible) columns++;
    if (this.props.settings.track3DVisible) columns++;
    return columns;
  }
  render() {
    let { settings } = this.props;

    return (
      <div className={classNames({
        [styles.splitView]: true,
        [styles[`splitView--${this.getColumns()}`]]: true,
        [styles['splitView--sequence-editor-visible']]: settings.sequenceEditorVisible
      })}>
        <div className={styles.viewColumns}>
          {settings.trackEditorVisible ? (
            <div className={styles.column}>
              <Track />
            </div>
          ) : null}
  
          {settings.track3DVisible ? (
            <div className={styles.column}>
              <Track3D />
            </div>
          ) : null}
        </div>

        <div className={styles.LowerSection}>
          <button
            className={styles.SequenceEditorToggleButton}
            onClick={() => this.props.setSequenceEditorVisibility(!settings.sequenceEditorVisible)}
          >
            {settings.sequenceEditorVisible ? <FiChevronsDown /> : <FiChevronsUp />}
            <span>{settings.sequenceEditorVisible ? 'Close' : 'Open'} Sequence Editor</span>
            {settings.sequenceEditorVisible ? <FiChevronsDown /> : <FiChevronsUp />}
          </button>
          {settings.sequenceEditorVisible ? (
            <div className={styles.SequenceEditorWrapper}>
              <PlaybackControls />
              <SequenceEditor />
            </div>
          ) : null}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    settings: selectGeneralSettings(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setSequenceEditorVisibility: (val) => dispatch(setSequenceEditorVisibility(val))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SplitView);