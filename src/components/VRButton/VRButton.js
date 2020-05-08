/**
 * Based on three js VRButton
 */

import React, { createRef }  from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import {
 selectTrack3DVRModeEnabled,
 setVRModeEnabled,
} from '../../app/reducers/settingsTrack3DSlice';

import styles from './VRButton.module.scss';


/**
 * Button checking xr session compatibility for VR Mode
 * Sets the vrModeEnabled in settings.track3D or shows info if
 * immersive-vr session is not supported
 * @class VRButton
 * @extends {React.PureComponent}
 */
class VRButton extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      sessionSupportedFetched: false,
      sessionSupported: false,
    }

    this.button = createRef();
    this.toggleVRMode = this.toggleVRMode.bind(this);
  }

  componentDidMount() {
    if ( 'xr' in navigator ) {
      navigator.xr.isSessionSupported( 'immersive-vr' )
        .then((supported) => {
          this.setState({
            sessionSupportedFetched: true,
            sessionSupported: supported
        });
      });
    }
  }

  toggleVRMode() {
    this.props.setVRModeEnabled(!this.props.vrModeEnabled);
  }

  render() {

    if ( 'xr' in navigator ) {

      if (this.state.sessionSupportedFetched) {
        return this.state.sessionSupported ? (
          <button
            ref={this.button}
            className={classNames({
              [styles.VRButton]: true,
              [styles['VRButton--sess-supported']]: true
            })}
            onClick={this.toggleVRMode}
          >{this.props.vrModeEnabled ? 'EXIT VR' : 'ENTER VR'}</button>
        ) : (
          <button
            ref={this.button}
            className={classNames({
              [styles.VRButton]: true,
              [styles['VRButton--sess-not-supported']]: true
            })}
          >VR NOT SUPPORTED</button>
        );
      } else {
        return null;
      }

    } else {
      let href, text;

      if ( window.isSecureContext === false ) {
        href = document.location.href.replace( /^http:/, 'https:' );
        text = 'WEBXR NEEDS HTTPS'; // TODO Improve message
      } else {

        href = 'https://immersiveweb.dev/';
        text = 'WEBXR NOT AVAILABLE';
      }

      return (
        <a
          className={styles.NotSupportedMessage}
          href={href}
        >{text}</a>
      );
    }

  }
};

const mapStateToProps = (state) => {
  return {
    vrModeEnabled: selectTrack3DVRModeEnabled(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setVRModeEnabled: (value) => dispatch(setVRModeEnabled(value))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VRButton);
