import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { FiDownloadCloud } from 'react-icons/fi';

import { selectCurrentTrack } from '../../app/reducers/currentTrackSlice';
import {
  EXPORT_VERSION,
  EXPORT_TYPES,
} from '../../app/io/export';

import styles from './ExportButton.module.scss';

class ExportButton extends React.PureComponent {

  constructor(props) {
    super(props);

    this.getFileUrl();
  }

  componentDidUpdate() {
    URL.revokeObjectURL(this.url);
    this.getFileUrl();
  }

  componentWillUnmount() {
    URL.revokeObjectURL(this.url);
  }

  getFileUrl() {
    let currentTrack = _.cloneDeep(this.props.currentTrack);

    currentTrack.version = EXPORT_VERSION;
    currentTrack.type = EXPORT_TYPES.SINGLE_TRACK;

    let json = JSON.stringify(currentTrack);
    let blob = new Blob([json], {type: "octet/stream"});

    this.url = window.URL.createObjectURL(blob);

    return this.url;
  }
  
  render() {
    return (
      <a href={this.getFileUrl()}
        className={styles.ExportButton}
        download="TrackVizExport.json"
      >
        <FiDownloadCloud /> Export (Save Link As)
      </a>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    currentTrack: selectCurrentTrack(state),
  }
}

export default connect(mapStateToProps)(ExportButton);