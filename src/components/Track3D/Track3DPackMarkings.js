import React from "react";
import { connect } from "react-redux";

import { selectCurrentSkatersWDPPivotLineDistance } from "../../app/reducers/currentTrackSlice";

import {
  computePartialTrackShape,
  getSortedPackBoundaries,
  getPack,
  ENGAGEMENT_ZONE_DISTANCE_TO_PACK,
} from "../../utils/packFunctions";

class Track3DMarkings extends React.PureComponent {
  addShapes() {
    // create the pack shape and add to scene
    let packBounds = getSortedPackBoundaries(getPack(this.props.storeSkaters));
    this.packShape = computePartialTrackShape({
      p1: packBounds[0],
      p2: packBounds[1],
      trackIs2D: false,
      options3D: {
        // curveSegments: 200,
        color: 0xffa489,
        opacity: 0.5,
        transparent: true,
      },
    });
    this.packShape.rotateX(-Math.PI / 2);
    this.packShape.position.y = -0.001;
    this.packShape.name = "Pack Marking";
    this.packShape.renderOrder = 4;
    this.props.scene.add(this.packShape);

    {
      /** TODO: add pack measuring method */
    }

    // create engagement zone shape and add to scene
    let engagementZoneBounds = [
      packBounds[0] - ENGAGEMENT_ZONE_DISTANCE_TO_PACK,
      packBounds[1] + ENGAGEMENT_ZONE_DISTANCE_TO_PACK,
    ];
    this.engagementZoneShape = computePartialTrackShape({
      p1: engagementZoneBounds[0],
      p2: engagementZoneBounds[1],
      trackIs2D: false,
      options3D: {
        // curveSegments: 200,
        color: 0xffa489,
        opacity: 0.3,
        transparent: true,
      },
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
  };
};

export default connect(mapStateToProps)(Track3DMarkings);
