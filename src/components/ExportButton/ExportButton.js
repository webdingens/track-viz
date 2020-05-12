import React from 'react';
import { connect } from 'react-redux';

import { FiDownloadCloud } from 'react-icons/fi';

import { selectCurrentTrack } from '../../app/reducers/currentTrackSlice';

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

    let json = JSON.stringify(this.props.currentTrack);
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