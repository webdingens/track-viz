import React from 'react';

import Skater from '../Skater/Skater';

const TrackSkaters = (props) => {
  let skaters = [];
  let idxA = 0;
  let idxB = 0;
  props.skaters.forEach((el, i) => {
    let labelIdx;
    if (el.team === 'A') labelIdx = ++idxA;
    else labelIdx = ++idxB;
    skaters.push(<Skater
      key={el.id}
      idx={i}
      label={!(el.isJammer || el.isPivot) ? labelIdx : ''}
      preventDragUpdate={props.preventDragUpdate}
      {...el}
    />)
  });

  return skaters;
}

export default TrackSkaters;