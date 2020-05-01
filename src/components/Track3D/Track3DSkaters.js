import React from 'react';
import { connect } from 'react-redux';

import Skater3D from '../Skater3D/Skater3D';

import {
  selectCurrentSkaters
} from '../../app/reducers/currentTrackSlice';

class Skaters extends React.Component {
  render() {
    return <>
      {
        this.props.skaters.map((skater, i) => (
          <Skater3D scene={this.props.scene} key={i} onSkaterUpdated={this.props.onSkaterUpdated} {...skater} />
        ))
      }
    </>
  }
}

//
//  React Redux Connection
//
const mapStateToProps = state => {
  return {
    skaters: selectCurrentSkaters(state)
  }
}

export default connect(mapStateToProps)(Skaters);