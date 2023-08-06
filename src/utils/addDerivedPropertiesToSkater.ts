import {
  getSkatersWDPInBounds,
  getSkatersWDPInPlayPackSkater,
  getSkatersWDPPivotLineDistance,
  PACK_MEASURING_METHODS,
  Position,
} from "roller-derby-track-utils";

export default function addDerivedPropertiesToSkaters<Skater extends Position>(
  skaters: Skater[],
  method:
    | typeof PACK_MEASURING_METHODS.SECTOR
    | typeof PACK_MEASURING_METHODS.RECTANGLE
) {
  const wdpInBounds = getSkatersWDPInBounds(skaters);
  const wdpPivotLineDistance = getSkatersWDPPivotLineDistance(wdpInBounds);
  let wdpInPlayPackSkater;
  if (method === PACK_MEASURING_METHODS.SECTOR) {
    wdpInPlayPackSkater = getSkatersWDPInPlayPackSkater(wdpPivotLineDistance, {
      method: PACK_MEASURING_METHODS.SECTOR,
    });
  } else {
    wdpInPlayPackSkater = getSkatersWDPInPlayPackSkater(wdpPivotLineDistance, {
      method: PACK_MEASURING_METHODS.RECTANGLE,
    });
  }

  return wdpInPlayPackSkater;
}
