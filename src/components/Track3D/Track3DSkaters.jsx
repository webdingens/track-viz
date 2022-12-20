import React from "react";
import { connect } from "react-redux";

import Skater3D from "../Skater3D/Skater3D";

import { selectCurrentSkaters } from "../../app/reducers/currentTrackSlice";

import { selectUserIsInteractingWithTrack3D } from "../../app/reducers/currentTransientsSlice";

class Skaters extends React.Component {
  render() {
    return (
      <>
        {this.props.skaters.map((skater, i) => (
          <Skater3D
            scene={this.props.scene}
            key={skater.id}
            onSkaterUpdated={this.props.onSkaterUpdated}
            userIsInteracting={this.props.userIsInteracting}
            {...skater}
          />
        ))}
      </>
    );
  }
}

//
//  React Redux Connection
//
const mapStateToProps = (state) => {
  return {
    skaters: selectCurrentSkaters(state),
    userIsInteracting: selectUserIsInteractingWithTrack3D(state),
  };
};

export default connect(mapStateToProps)(Skaters);
