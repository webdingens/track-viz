import React, { createRef } from "react";
import { connect } from "react-redux";
import classNames from "classnames";
import _ from "lodash";
import { Md3DRotation } from "react-icons/md";

import {
  setMapControlsRotateMode,
  selectMapControlsRotateMode,
  setTouchOnRotateModeButton,
} from "../../app/reducers/currentTransientsSlice";

import styles from "./Track3DMapControlButtons.module.scss";

class Track3DMapControlButtons extends React.Component {
  constructor(props) {
    super(props);

    this.buttonEl = createRef();

    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
  }

  onTouchStart(evt) {
    evt.stopPropagation();

    // find touch on our button
    let touchIdx = _.findIndex(evt.touches, (touch) => {
      return _.findIndex(touch.target.composedPath, this.buttonEl);
    });

    this.props.setTouchOnRotateModeButton(evt.touches[touchIdx].identifier);
    this.props.setMapControlsRotateMode(true);
  }

  onTouchEnd(evt) {
    evt.stopPropagation();
    this.props.setMapControlsRotateMode(false);
  }

  render() {
    return (
      <button
        ref={this.buttonEl}
        className={classNames({
          [styles.ToggleRotateButton]: true,
          [styles.active]: this.props.mapControlsRotateMode,
        })}
        onTouchStart={this.onTouchStart}
        onTouchCancel={this.onTouchEnd}
        onTouchEnd={this.onTouchEnd}
      >
        <Md3DRotation />
      </button>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    mapControlsRotateMode: selectMapControlsRotateMode(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setMapControlsRotateMode: (val) => dispatch(setMapControlsRotateMode(val)),
    setTouchOnRotateModeButton: (val) =>
      dispatch(setTouchOnRotateModeButton(val)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Track3DMapControlButtons);
