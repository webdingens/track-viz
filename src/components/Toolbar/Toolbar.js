import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import {
  setTrackEditorVisibility,
  setTrack3DVisibility,
  selectSettings
} from '../../app/reducers/settingsSlice';

import styles from './Toolbar.module.scss';

class Toolbar extends React.PureComponent {
  render() {
    return (
      <nav className={styles.toolbar}>
        <ul>
          <li>
            <button
              className={classNames({
                [styles.button]: true,
                [styles['button--active']]: this.props.settings.trackEditorVisible && !this.props.settings.track3DVisible
              })}
              onClick={() => {
                this.props.setTrackEditorVisibility(true);
                this.props.setTrack3DVisibility(false);
              }}
            >Track Editor</button>
          </li>
          <li>
            <button
              className={classNames({
                [styles.button]: true,
                [styles['button--active']]: this.props.settings.track3DVisible && !this.props.settings.trackEditorVisible
              })}
              onClick={() => {
                this.props.setTrackEditorVisibility(false);
                this.props.setTrack3DVisibility(true);
              }}
            >3D View</button>
          </li>
          <li>
            <button
              className={classNames({
                [styles.button]: true,
                [styles['button--active']]: this.props.settings.trackEditorVisible && this.props.settings.track3DVisible
              })}
              onClick={() => {
                this.props.setTrackEditorVisibility(true);
                this.props.setTrack3DVisibility(true);
              }}
            >Split View</button>
          </li>
        </ul>
      </nav>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    settings: selectSettings(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setTrackEditorVisibility: (val) => dispatch(setTrackEditorVisibility(val)),
    setTrack3DVisibility: (val) => dispatch(setTrack3DVisibility(val))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);