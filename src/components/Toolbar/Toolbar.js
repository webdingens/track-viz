import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import {
  setTrackEditorVisibility,
  setTrack3DVisibility,
  selectGeneralSettings,
} from '../../app/reducers/settingsGeneralSlice';

import {
  CONTROL_MODES,
  setControlMode,
  selectTrack3DControlMode,
} from '../../app/reducers/settingsTrack3DSlice';

import styles from './Toolbar.module.scss';

class Toolbar extends React.PureComponent {
  render() {
    return (
      <div className={styles.toolbar}>
        <ul>
          <li>
            Editor Layout
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
          </li>

          <li>
            Track3D Controls
            <ul>
              {Object.keys(CONTROL_MODES).map((mode, idx) => (
                <li key={idx}>
                  <button
                    className={classNames({
                      [styles.button]: true,
                      [styles['button--active']]: this.props.controlMode === CONTROL_MODES[mode]
                    })}
                    onClick={() => this.props.setControlMode(CONTROL_MODES[mode])}
                  >{CONTROL_MODES[mode]}</button>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    settings: selectGeneralSettings(state),
    controlMode: selectTrack3DControlMode(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setTrackEditorVisibility: (val) => dispatch(setTrackEditorVisibility(val)),
    setTrack3DVisibility: (val) => dispatch(setTrack3DVisibility(val)),
    setControlMode: (val) => dispatch(setControlMode(val)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);