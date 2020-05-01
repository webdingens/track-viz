import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import TrackOverlay from '../Track/TrackOverlay';
import Track3D from '../Track3D/Track3D';

import {
  selectSettings
} from '../../app/reducers/settingsSlice';

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
        [styles[`splitView--${this.getColumns()}`]]: true
      })}>
        {settings.trackEditorVisible ? (
          <div className={styles.column}>
            <TrackOverlay />
          </div>
        ) : null}

        {settings.track3DVisible ? (
          <div className={styles.column}>
            <Track3D />
          </div>
        ) : null}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    settings: selectSettings(state)
  }
}

export default connect(mapStateToProps)(SplitView);