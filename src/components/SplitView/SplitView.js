import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import Track from '../Track/Track';
import Track3D from '../Track3D/Track3D';
import SequenceEditor from '../SequenceEditor/SequenceEditor';

import {
  selectGeneralSettings
} from '../../app/reducers/settingsGeneralSlice';

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
        {settings.sequenceEditorVisible ? (
          <div className={styles.sequenceEditorWrapper}>
            <SequenceEditor />
          </div>
        ) : null}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    settings: selectGeneralSettings(state)
  }
}

export default connect(mapStateToProps)(SplitView);