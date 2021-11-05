/**
 * Based on three js VRButton
 */

import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import classNames from "classnames";

import {
  selectTrack3DVRModeEnabled,
  setVRModeEnabled,
} from "../../app/reducers/settingsTrack3DSlice";

import styles from "./VRButton.module.scss";

/**
 * Button checking xr session compatibility for VR Mode
 * Sets the vrModeEnabled in settings.track3D or shows info if
 * immersive-vr session is not supported
 * @class VRButton
 * @extends {React.PureComponent}
 */
const VRButton = () => {
  /* Redux */
  const vrModeEnabled = useSelector(selectTrack3DVRModeEnabled);
  const dispatch = useDispatch();

  /* Render states */
  const [state, setState] = useState({
    sessionSupportedFetched: false,
    sessionSupported: false,
  });
  const button = useRef();

  const toggleVRMode = () => {
    dispatch(setVRModeEnabled(!vrModeEnabled));
  };

  useEffect(() => {
    if ("xr" in navigator) {
      navigator.xr.isSessionSupported("immersive-vr").then((supported) => {
        setState({
          sessionSupportedFetched: true,
          sessionSupported: supported,
        });
      });
    }
  }, []);

  /* Render */
  if ("xr" in navigator) {
    if (state.sessionSupportedFetched) {
      return state.sessionSupported ? (
        <button
          ref={button}
          className={classNames({
            [styles.VRButton]: true,
            [styles["VRButton--sess-supported"]]: true,
          })}
          onClick={toggleVRMode}
        >
          {vrModeEnabled ? "EXIT VR" : "ENTER VR"}
        </button>
      ) : (
        <button
          ref={button}
          className={classNames({
            [styles.VRButton]: true,
            [styles["VRButton--sess-not-supported"]]: true,
          })}
        >
          VR NOT SUPPORTED
        </button>
      );
    } else {
      return null;
    }
  } else {
    let href, text;

    if (window.isSecureContext === false) {
      href = document.location.href.replace(/^http:/, "https:");
      text = "WEBXR NEEDS HTTPS"; // TODO Improve message
    } else {
      href = "https://immersiveweb.dev/";
      text = "WEBXR NOT AVAILABLE";
    }

    return (
      <a className={styles.NotSupportedMessage} href={href}>
        {text}
      </a>
    );
  }
};

export default VRButton;
