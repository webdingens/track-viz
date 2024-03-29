import React from "react";
import { connect } from "react-redux";

import { selectCurrentSkatersWDPPivotLineDistance } from "../../app/reducers/currentTrackSlice";

import { selectGeneralSettings } from "../../app/reducers/settingsGeneralSlice";

import {
  getPack,
  getSortedOutermostSkaters,
  getSortedPackBoundaries,
  getTwoOutermostSkatersInBothDirection,
  ENGAGEMENT_ZONE_DISTANCE_TO_PACK,
  PACK_MEASURING_METHODS,
  getEngagementZoneIntersectionsRectangle,
  getPackIntersectionsRectangle,
} from "roller-derby-track-utils";

import { computePartialTrackShape3D } from "roller-derby-track-utils/src/packDrawing3D";

class Track3DMarkings extends React.PureComponent {
  addShapes() {
    const method = this.props.settings.packMeasuringMethod;

    if (method === PACK_MEASURING_METHODS.SECTOR) this.addShapesSector();
    else this.addShapesRectangle();
  }

  addShapesSector() {
    // create the pack shape and add to scene
    let packBounds = getSortedPackBoundaries(getPack(this.props.storeSkaters));
    if (!packBounds) return;
    this.packShape = computePartialTrackShape3D({
      p1: packBounds[0],
      p2: packBounds[1],
      options3D: {
        // curveSegments: 200,
        color: 0xffa489,
        opacity: 0.5,
        transparent: true,
      },
      method: PACK_MEASURING_METHODS.SECTOR,
    });
    this.packShape.rotateX(-Math.PI / 2);
    this.packShape.position.y = -0.001;
    this.packShape.name = "Pack Marking";
    this.packShape.renderOrder = 4;
    this.props.scene.add(this.packShape);

    // create engagement zone shape and add to scene
    let engagementZoneBounds = [
      packBounds[0] - ENGAGEMENT_ZONE_DISTANCE_TO_PACK,
      packBounds[1] + ENGAGEMENT_ZONE_DISTANCE_TO_PACK,
    ];
    this.engagementZoneShape = computePartialTrackShape3D({
      p1: engagementZoneBounds[0],
      p2: engagementZoneBounds[1],
      options3D: {
        // curveSegments: 200,
        color: 0xffa489,
        opacity: 0.3,
        transparent: true,
      },
      method: PACK_MEASURING_METHODS.SECTOR,
    });
    this.engagementZoneShape.rotateX(-Math.PI / 2);
    this.engagementZoneShape.position.y = -0.002;
    this.engagementZoneShape.name = "Engagement Zone Marking";
    this.engagementZoneShape.renderOrder = 3;
    this.props.scene.add(this.engagementZoneShape);
  }

  addShapesRectangle() {
    // create the pack shape and add to scene
    let packBounds;
    const packRectangle = getPack(this.props.storeSkaters, {
      method: PACK_MEASURING_METHODS.RECTANGLE,
    });
    if (!packRectangle) return;
    const twoOutermostSkatersInBothDirections =
      getTwoOutermostSkatersInBothDirection(packRectangle);
    const _packIntersectionsRectangle = getPackIntersectionsRectangle(
      packRectangle,
      twoOutermostSkatersInBothDirections
    );
    packBounds = _packIntersectionsRectangle
      ? [_packIntersectionsRectangle.back, _packIntersectionsRectangle.front]
      : null;
    this.packShape = computePartialTrackShape3D({
      p1: packBounds[0],
      p2: packBounds[1],
      options3D: {
        // curveSegments: 200,
        color: 0xffa489,
        opacity: 0.5,
        transparent: true,
      },
      method: PACK_MEASURING_METHODS.RECTANGLE,
    });
    this.packShape.rotateX(-Math.PI / 2);
    this.packShape.position.y = -0.001;
    this.packShape.name = "Pack Marking";
    this.packShape.renderOrder = 4;
    this.props.scene.add(this.packShape);

    // create engagement zone shape and add to scene
    let engagementZoneBounds;
    const sortedOutermostSkatersRectangle =
      getSortedOutermostSkaters(packRectangle);
    engagementZoneBounds = sortedOutermostSkatersRectangle
      ? [
          getEngagementZoneIntersectionsRectangle(
            sortedOutermostSkatersRectangle[0],
            {
              front: false,
            }
          ),
          getEngagementZoneIntersectionsRectangle(
            sortedOutermostSkatersRectangle[1],
            {
              front: true,
            }
          ),
        ]
      : null;
    this.engagementZoneShape = computePartialTrackShape3D({
      p1: engagementZoneBounds[0],
      p2: engagementZoneBounds[1],
      options3D: {
        // curveSegments: 200,
        color: 0xffa489,
        opacity: 0.3,
        transparent: true,
      },
      method: PACK_MEASURING_METHODS.RECTANGLE,
    });
    this.engagementZoneShape.rotateX(-Math.PI / 2);
    this.engagementZoneShape.position.y = -0.002;
    this.engagementZoneShape.name = "Engagement Zone Marking";
    this.engagementZoneShape.renderOrder = 3;
    this.props.scene.add(this.engagementZoneShape);
  }

  removeShapes() {
    // remove shapes from scene
    if (this.props.scene) {
      if (this.packShape) this.props.scene.remove(this.packShape);

      if (this.engagementZoneShape)
        this.props.scene.remove(this.engagementZoneShape);
    }
  }

  componentDidMount() {
    if (!this.props.scene) return;
    if (!this.props.storeSkaters) return;

    this.addShapes();
  }

  componentDidUpdate() {
    this.removeShapes();
    this.addShapes();
    this.props.onUpdate();
  }

  componentWillUnmount() {
    this.removeShapes();
  }

  render() {
    return <></>;
  }
}

const mapStateToProps = (state) => {
  return {
    storeSkaters: selectCurrentSkatersWDPPivotLineDistance(state),
    settings: selectGeneralSettings(state),
  };
};

export default connect(mapStateToProps)(Track3DMarkings);
