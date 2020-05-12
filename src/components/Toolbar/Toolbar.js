import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import ImportField from '../ImportField/ImportField';
import ExportButton from '../ExportButton/ExportButton';

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
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      openedOnce: false,
    }
  }

  render() {
    return (
      <div className={classNames({
        [styles.toolbar]: true,
        [styles.toolbarOpen]: this.state.open,
        [styles.toolbarClosed]: this.state.openedOnce && !this.state.open
      })}>
        <ul>
          <li>
            <span className={styles.headline}>Editor Layout</span>
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

          {this.props.settings.track3DVisible ? (
            <li>
              <span className={styles.headline}>Track3D Controls</span>
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
          ) : null}

          <li>
            <span className={styles.headline}>Import / Export</span>
            <ul>
              <li>
                <ImportField />
              </li>
              <li>
                <ExportButton />
              </li>
            </ul>
          </li>
        </ul>

        <button
          className={styles.toggleButton}
          onClick={() => {
            this.setState({
              open: !this.state.open,
              openedOnce: true,
            })
          }}
        >
          <span></span>
          <span></span>
          <span></span>
          <span className={styles.buttonLabel}>{this.state.open ? 'Close Menu' : 'Open Menu'}</span>
        </button>
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