import React from "react";
import PropTypes from "prop-types";
import { connect, useSelector } from "react-redux";
import SVGTextures from "react-svg-textures";
import classNames from "classnames";

import { selectCurrentSkatersWDPPivotLineDistance } from "../../app/reducers/currentTrackSlice";

import { selectGeneralSettings } from "../../app/reducers/settingsGeneralSlice";

import {
  getSortedPackBoundaries,
  getPack,
  getSortedOutermostSkaters,
  getEngagementZoneIntersectionsRectangle,
  getPointOnParallelLineOfLastSkaterRectangle,
  getPackIntersectionsRectangle,
  getPivotLineDistance,
  PACK_MEASURING_METHODS,
  computePartialTrackShape,
  getTwoOutermostSkatersInBothDirection,
  ENGAGEMENT_ZONE_DISTANCE_TO_PACK,
  getDistanceOfTwoSkaters,
} from "../../utils/packFunctions";

import styles from "./TrackPackMarkings.module.scss";

const { Paths } = SVGTextures;

const PartialTrackShapeSector = ({ bounds, overlay, engagementZone, pack }) => {
  if (!bounds) return null;
  return (
    <g
      className={classNames({
        [styles.pack]: pack,
        [styles["pack--overlay"]]: overlay,
        [styles.engagementZone]: engagementZone,
      })}
    >
      {overlay ? (
        <Paths
          id="pack-pattern"
          d="woven"
          strokeWidth={0.1}
          stroke="#333467"
          size={0.5}
          orientation="diagonal"
        />
      ) : null}
      <path
        d={computePartialTrackShape({
          p1: bounds[0],
          p2: bounds[1],
          trackIs2D: true,
        })}
      />
    </g>
  );
};

const PartialTrackShapeRectangle = ({
  bounds,
  overlay,
  engagementZone,
  pack,
  box,
  distance,
  closeDistance,
}) => {
  if (!bounds) return null;
  if (
    !bounds[0].inside ||
    !bounds[0].outside ||
    !bounds[1].inside ||
    !bounds[1].outside
  ) {
    console.warn("bounds missing intersections");
    return null;
  }
  return (
    <g>
      <g
        className={classNames({
          [styles.packRectangle]: pack,
          [styles["packRectangle--overlay"]]: overlay,
          [styles.engagementZone]: engagementZone,
          [styles.box]: box,
          [styles.closeDistance]: distance && closeDistance,
          [styles.farDistance]: distance && !closeDistance,
        })}
      >
        {overlay ? (
          <Paths
            id="pack-pattern"
            d="woven"
            strokeWidth={0.1}
            stroke="#333467"
            size={0.5}
            orientation="diagonal"
          />
        ) : null}

        <path
          d={computePartialTrackShape({
            p1: bounds[0],
            p2: bounds[1],
            trackIs2D: true,
            method: PACK_MEASURING_METHODS.RECTANGLE,
          })}
        />
      </g>
    </g>
  );
};

const TrackPackMarkings = ({ useSkaters, storeSkaters }) => {
  const settings = useSelector(selectGeneralSettings);
  const skaters = useSkaters ? useSkaters : storeSkaters;

  /*
   *   Sector Method Variables
   */
  const packSector = getPack(skaters);
  const packBoundsSector = getSortedPackBoundaries(packSector);

  let engagementZoneBounds;

  if (packBoundsSector) {
    engagementZoneBounds = [
      packBoundsSector[0] - ENGAGEMENT_ZONE_DISTANCE_TO_PACK,
      packBoundsSector[1] + ENGAGEMENT_ZONE_DISTANCE_TO_PACK,
    ];
  }

  /*
   *   Rectangle Method Variables
   */
  const packRectangle = getPack(skaters, {
    method: PACK_MEASURING_METHODS.RECTANGLE,
  });
  const packBoundsRectangle = getSortedPackBoundaries(packRectangle);

  let intersectionsEngagementZoneRectangle;
  let packIntersectionsRectangle;
  let frontPackRectangleIntersections;
  let backPackRectangleIntersections;
  let frontEngagementZoneRectangles;
  let backEngagementZoneRectangles;
  let closestBlockerRectangles = [];

  if (packRectangle) {
    /* engagement zone rectangle method */
    const sortedOutermostSkatersRectangle =
      getSortedOutermostSkaters(packRectangle);
    intersectionsEngagementZoneRectangle = sortedOutermostSkatersRectangle
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

    const twoOutermostSkatersInBothDirections =
      getTwoOutermostSkatersInBothDirection(packRectangle);

    /* pack zone rectangle method (outer edge of outermost rectangles between skaters) */
    if (
      settings.packMeasuringMethod === PACK_MEASURING_METHODS.RECTANGLE &&
      settings.showPackMethodDuringRectangleMethod ===
        PACK_MEASURING_METHODS.RECTANGLE
    ) {
      const _packIntersectionsRectangle = getPackIntersectionsRectangle(
        packRectangle,
        twoOutermostSkatersInBothDirections
      );
      packIntersectionsRectangle = _packIntersectionsRectangle
        ? [_packIntersectionsRectangle.back, _packIntersectionsRectangle.front]
        : null;
    }

    /* two outermost rectangles of pack */
    if (
      settings.showPackEndRectangles &&
      !settings.showAllClosestBlockerRectangles &&
      settings.packMeasuringMethod === PACK_MEASURING_METHODS.RECTANGLE
    ) {
      const _frontPackRectangleIntersections = getPackIntersectionsRectangle(
        twoOutermostSkatersInBothDirections.front
      );
      frontPackRectangleIntersections = _frontPackRectangleIntersections
        ? [
            _frontPackRectangleIntersections.back,
            _frontPackRectangleIntersections.front,
          ]
        : null;

      const _backPackRectangleIntersections = getPackIntersectionsRectangle(
        twoOutermostSkatersInBothDirections.back
      );
      backPackRectangleIntersections = _backPackRectangleIntersections
        ? [
            _backPackRectangleIntersections.back,
            _backPackRectangleIntersections.front,
          ]
        : null;
    }

    /* engagement zone end rectangles */
    if (
      settings.showEngagementZoneEndRectangles &&
      settings.packMeasuringMethod === PACK_MEASURING_METHODS.RECTANGLE
    ) {
      const _frontPointOnEnd = getPointOnParallelLineOfLastSkaterRectangle(
        sortedOutermostSkatersRectangle[1]
      );
      _frontPointOnEnd.pivotLineDist = getPivotLineDistance(_frontPointOnEnd);
      const _frontEngagementZoneRectangles = getPackIntersectionsRectangle([
        _frontPointOnEnd,
        sortedOutermostSkatersRectangle[1],
      ]);
      frontEngagementZoneRectangles = _frontEngagementZoneRectangles
        ? [
            _frontEngagementZoneRectangles.back,
            _frontEngagementZoneRectangles.front,
          ]
        : null;
      const _backPointOnEnd = getPointOnParallelLineOfLastSkaterRectangle(
        sortedOutermostSkatersRectangle[0],
        { front: false }
      );
      _backPointOnEnd.pivotLineDist = getPivotLineDistance(_backPointOnEnd);
      const _backEngagementZoneRectangles = getPackIntersectionsRectangle([
        _backPointOnEnd,
        sortedOutermostSkatersRectangle[0],
      ]);
      backEngagementZoneRectangles = _backEngagementZoneRectangles
        ? [
            _backEngagementZoneRectangles.back,
            _backEngagementZoneRectangles.front,
          ]
        : null;
    }
  }

  /* skater boxes */
  if (
    settings.showAllClosestBlockerRectangles &&
    settings.packMeasuringMethod === PACK_MEASURING_METHODS.RECTANGLE
  ) {
    const blockers = skaters.filter(
      (skater) => !skater.isJammer && skater.inBounds
    );
    blockers.sort((a, b) => a.pivotLineDist - b.pivotLineDist);
    const closestSkaters = [];
    for (let i = 0; i < blockers.length; i++) {
      closestSkaters.push([blockers[i], blockers[(i + 1) % blockers.length]]);
    }
    closestBlockerRectangles = closestSkaters
      .map((skaterPair) => {
        const distance = getDistanceOfTwoSkaters(skaterPair[0], skaterPair[1], {
          method: PACK_MEASURING_METHODS.RECTANGLE,
        });
        const intersections = getPackIntersectionsRectangle(skaterPair);
        if (distance > 7) return false;
        return {
          intersections: [intersections.back, intersections.front],
          distance,
        };
      })
      .filter(Boolean);
  }

  return (
    <>
      {/* SECTOR */}
      {settings.packMeasuringMethod === PACK_MEASURING_METHODS.SECTOR ? (
        <>
          {packBoundsSector ? (
            <PartialTrackShapeSector pack bounds={packBoundsSector} />
          ) : null}
          {engagementZoneBounds ? (
            <PartialTrackShapeSector
              className={styles.engagementZone}
              bounds={engagementZoneBounds}
              engagementZone
            />
          ) : null}
        </>
      ) : null}

      {/* RECTANGLE */}
      {settings.packMeasuringMethod === PACK_MEASURING_METHODS.RECTANGLE ? (
        <>
          {/** Replace with rectangular pack boundaries (outside line of rectangle between last two skaters) */}
          {settings.showPackMethodDuringRectangleMethod ===
          PACK_MEASURING_METHODS.SECTOR ? (
            <PartialTrackShapeSector bounds={packBoundsRectangle} pack />
          ) : (
            <PartialTrackShapeRectangle
              className={styles.pack}
              bounds={packIntersectionsRectangle}
              pack
            />
          )}

          {/** add optional front piece the box area between the last skater of the pack and the imaginary furthest skater from the pack still in play */}
          {settings.showEngagementZoneEndRectangles &&
          frontEngagementZoneRectangles ? (
            <PartialTrackShapeRectangle
              bounds={frontEngagementZoneRectangles}
              box
            />
          ) : null}
          {settings.showEngagementZoneEndRectangles &&
          backEngagementZoneRectangles ? (
            <PartialTrackShapeRectangle
              bounds={backEngagementZoneRectangles}
              box
            />
          ) : null}

          {/** add optional boxes between closest skaters, make it green if it's good, maybe add distances as label */}
          {settings.showAllClosestBlockerRectangles &&
          closestBlockerRectangles.length
            ? closestBlockerRectangles.map((entry, idx) => (
                <PartialTrackShapeRectangle
                  key={idx}
                  bounds={entry.intersections}
                  box
                  distance
                  closeDistance={entry.distance <= 3.05}
                />
              ))
            : null}

          {/** Boxes between the outermost skaters of the pack */}
          {settings.showPackEndRectangles && frontPackRectangleIntersections ? (
            <PartialTrackShapeRectangle
              bounds={frontPackRectangleIntersections}
              box
            />
          ) : null}
          {settings.showPackEndRectangles && backPackRectangleIntersections ? (
            <PartialTrackShapeRectangle
              bounds={backPackRectangleIntersections}
              box
            />
          ) : null}

          {intersectionsEngagementZoneRectangle ? (
            <PartialTrackShapeRectangle
              bounds={intersectionsEngagementZoneRectangle}
              engagementZone
            />
          ) : null}
        </>
      ) : null}

      {/** OTHER METHODS OVERLAY */}

      {settings.showEngagementZoneOtherMethod &&
      settings.packMeasuringMethod === PACK_MEASURING_METHODS.RECTANGLE &&
      engagementZoneBounds ? (
        <PartialTrackShapeSector bounds={engagementZoneBounds} overlay />
      ) : null}

      {settings.showEngagementZoneOtherMethod &&
      settings.packMeasuringMethod === PACK_MEASURING_METHODS.SECTOR &&
      intersectionsEngagementZoneRectangle ? (
        <PartialTrackShapeRectangle
          bounds={intersectionsEngagementZoneRectangle}
          overlay
        />
      ) : null}
    </>
  );
};

TrackPackMarkings.propTypes = {
  sortedPackBoundaries: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  storeSkaters: PropTypes.array,
};

const mapStateToProps = (state) => {
  return {
    storeSkaters: selectCurrentSkatersWDPPivotLineDistance(state),
  };
};

export default connect(mapStateToProps)(TrackPackMarkings);
