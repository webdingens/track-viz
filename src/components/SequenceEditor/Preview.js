import React, { createRef } from 'react';
import { connect } from 'react-redux';

import TrackGeometry from '../Track/TrackGeometry';

import {
  selectTrackOrientation,
  TRACK_ORIENTATIONS,
} from '../../app/reducers/settingsTrackSlice';

import styles from './Preview.module.scss';

class Preview extends React.Component {

  constructor(props) {
    super(props);

    this.element = createRef();
  }

  componentDidMount() {
    let el = this.element.current;
    if (!el) return;

    // set position
    let landscape = this.props.orientation === TRACK_ORIENTATIONS.ORIENTATION_0_DEG || this.props.orientation === TRACK_ORIENTATIONS.ORIENTATION_180_DEG
    el.style.width = landscape ? `${styles.previewWidth - 2 * styles.previewPadding}px` : `${(styles.previewWidth - 2 * styles.previewPadding) * 17.9 / 27.9}px`;

    el.style.top = this.props.bbox.top + 'px';
    let left = this.props.bbox.left + this.props.bbox.width;
    left = Math.max(Math.round(styles.previewWidth / 2), left);
    el.style.left = left + 'px';

    // add Class
    this.element.current.classList.add(styles.PreviewVisible)

    // set timeout to call callback
    this.timeout = setTimeout(() => this.props.onShown(), styles.animationDuration * 1000);
  }

  // componentDidUpdate() {
  //   this.element.current.classList.remove(styles.PreviewVisible);
  //   if (this.timeout) clearTimeout(this.timeout);

  //   this.componentDidMount();
  // }

  render() {
    return (
      <div ref={this.element} className={styles.Preview}>
        <TrackGeometry
          skaters={this.props.track.skaters}
          isPreview={true}
          updatePack={true}
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    orientation: selectTrackOrientation(state),
  }
}

export default connect(mapStateToProps)(Preview);