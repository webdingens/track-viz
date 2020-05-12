import React from 'react';
import { connect } from 'react-redux';
import { cleanupSlice } from '../../app/storePersistence';

import {
  FiUploadCloud,
} from 'react-icons/fi';

import {
  setCurrentTrack,
  defaultTrack,
} from '../../app/reducers/currentTrackSlice';

import styles from './ImportField.module.scss';


class ImportField extends React.PureComponent {

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onFileLoadEnd = this.onFileLoadEnd.bind(this);
  }

  onFileLoadEnd(e) {
    try {
      let trackData = JSON.parse(e.target.result);

      let loadedState = cleanupSlice(
        trackData,
        defaultTrack
      );

      this.props.setCurrentTrack(loadedState);

    } catch (error) {
      console.log('Error loading the file: ', error.msg)
    }
  }

  onChange(evt) {
    let input = evt.target;
    if (!(input.files && input.files instanceof FileList)) return;
    if (input.files.length === 0) return;

    let fr = new FileReader();
    fr.onloadend = this.onFileLoadEnd;
    fr.readAsText(input.files[0]);
    input.value = null;
  }

  render() {
    return (
      <div className={styles.ImportField}>
        <label>
          <span><FiUploadCloud /> Import Data (from sources you trust)</span>
          <input type="file"
            accept="application/json"
            onChange={this.onChange}
          />
        </label>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentTrack: (val) => dispatch(setCurrentTrack(val)),
  }
}

export default connect(null, mapDispatchToProps)(ImportField);
