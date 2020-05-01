import React from 'react';

import Skater from '../Skater/Skater';

class TrackSkaters extends React.Component {
  shouldComponentUpdate() {
    // prevent update of position and rotation
    if (this.props.skaterIsBeingDragged) return false;
    return true;
  }

  renderSkaters() {
    let skaters = [];
    let idxA = 0;
    let idxB = 0;
    this.props.skaters.forEach((el, i) => {
      let labelIdx;
      if (el.team === 'A') labelIdx = ++idxA;
      else labelIdx = ++idxB;
      skaters.push(<Skater
        key={i}
        idx={i}
        label={!(el.isJammer || el.isPivot) ? labelIdx : ''}
        {...el}
      />)
    });

    return skaters;
  }

  render() {
    return (
      <>
        {this.renderSkaters()}
      </>
    );
  }
}

export default TrackSkaters;