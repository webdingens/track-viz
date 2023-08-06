import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import gsap from "gsap";

import {
  getClosestNextPivotLineDist,
  getClosestNextAngle,
  getRelativeVPosition,
  setPositionFromVAndDist,
} from "../../utils/packFunctionsMisc";
import {
  selectIsPlaying,
  setIsPlaying as _setIsPlaying,
  ANIMATION_STATE,
  setAnimationState as _setAnimationState,
  selectAnimationState,
  setAnimatingTrack as _setAnimatingTrack,
  AnimationStateType,
} from "../../app/reducers/animatingTrackSlice";
import {
  Sequence,
  SkaterWithPivotLineDist,
  TrackData,
} from "../../types/LibraryData";
import { selectGeneralSettings } from "../../app/reducers/settingsGeneralSlice";
import addDerivedPropertiesToSkaters from "../../utils/addDerivedPropertiesToSkater";

const PLAYBACK_TYPES = {
  SIMPLE: "SIMPLE",
  MEASUREMENT_LINE: "MEASUREMENT_LINE",
};

const DISTANCE_MEASUREMENT = {
  SUM: "SUM",
  MAX: "MAX",
};

type PlayerProps = {
  sequence: Sequence;
};

function Player({ sequence }: PlayerProps) {
  const dispatch = useDispatch();
  const currentSequence = sequence;
  const isPlaying = useSelector(selectIsPlaying);
  const settings = useSelector(selectGeneralSettings);
  const animatingTrack = useRef<TrackData | null>(null);
  const animationState = useSelector(selectAnimationState);
  const animationContext = useRef<gsap.Context | null>(null);

  const playbackType = PLAYBACK_TYPES.SIMPLE;
  const startDelay = 0.8;
  const stepDelay = 0;
  const endDelay = 1.5;
  const useDistanceMeasurement = DISTANCE_MEASUREMENT.MAX;
  const movementSpeedMax = 3;
  const movementSpeedSum = 10;
  const movementSpeed =
    useDistanceMeasurement === DISTANCE_MEASUREMENT.MAX
      ? movementSpeedMax
      : movementSpeedSum;

  function setIsPlaying(val: boolean) {
    dispatch(_setIsPlaying(val));
  }
  function setAnimatingTrack<T extends TrackData>(track: T) {
    dispatch(_setAnimatingTrack(track));
  }
  function setAnimationState(val: AnimationStateType) {
    dispatch(_setAnimationState(val));
  }

  useEffect(() => {
    if (isPlaying) {
      if (!currentSequence?.sequence?.length) {
        throw new Error("Expected Sequence to have situations");
      }
      // start animation with current track
      let startingTrack = getTrackWithRelativeVPositions(
        _.cloneDeep(currentSequence.sequence[0])
      );

      startingTrack.skaters = addDerivedPropertiesToSkaters(
        startingTrack.skaters,
        settings.packMeasuringMethod
      );
      animatingTrack.current = startingTrack;
      // store the animating track for <TrackAnimating> component
      setAnimatingTrack(_.cloneDeep(startingTrack));
      setAnimationState(ANIMATION_STATE.PLAYING);
    } else {
      if (animationContext.current) animationContext.current.kill();
      setAnimationState(ANIMATION_STATE.STOPPED);
    }
  }, [isPlaying]);

  useEffect(() => {
    // start animation
    switch (animationState) {
      case ANIMATION_STATE.PLAYING:
        animateSequence();
        break;
      default:
        break;
    }
  }, [animationState]);

  useEffect(() => {
    return () => {
      if (animationContext.current) animationContext.current.kill();
      setAnimationState(ANIMATION_STATE.STOPPED);
    };
  }, []);

  function animateSequence() {
    if (animationContext.current) animationContext.current.kill();

    animationContext.current = gsap.context(() => {
      if (playbackType === PLAYBACK_TYPES.SIMPLE) {
        animateSimple();
      } else {
        animateAlongMeasurementLine();
      }
    });
  }

  function animateSimple() {
    if (!animatingTrack.current) {
      throw new Error("Expected an animatedTrack to exists");
    }

    let tl = gsap.timeline({
      onUpdate: () => {
        if (animatingTrack.current) {
          let track = purgeTrack(animatingTrack.current);
          track.skaters = addDerivedPropertiesToSkaters(
            track.skaters,
            settings.packMeasuringMethod
          );
          setAnimatingTrack(track);
        }
      },
    });
    let tracks = currentSequence.sequence;
    let prevTrackIdx;
    let prevTrack;
    let prevTrackEnd = 0;

    // set initial state
    if (tracks.length && !tracks[0].empty) {
      const track = tracks[0];
      for (let j = 0; j < track.skaters.length; j++) {
        tl.set(animatingTrack.current.skaters[j], {
          rotation: track.skaters[j].rotation,
          x: track.skaters[j].x,
          y: track.skaters[j].y,
        });
      }
      prevTrackEnd = startDelay;
      prevTrackIdx = 0;
      prevTrack = track;
    }

    for (let i = 1; i < tracks.length; i++) {
      let track = tracks[i];
      if (track.empty) continue;

      let sumDistance = 0;
      for (let j = 0; j < track.skaters.length; j++) {
        if (!prevTrack) {
          throw new Error(
            "Expected prevTrack to be set up during initial state setup"
          );
        }
        const skaterA = track.skaters[j];
        const skaterB = prevTrack.skaters[j];
        const dX = skaterA.x - skaterB.x;
        const dY = skaterA.y - skaterB.y;
        const newDist = Math.sqrt(dX * dX + dY * dY);
        if (useDistanceMeasurement === DISTANCE_MEASUREMENT.MAX) {
          if (newDist > sumDistance) {
            sumDistance = newDist;
          }
        } else {
          sumDistance += newDist;
        }
      }

      const stepDuration = Math.max(1, sumDistance / movementSpeed);

      for (let j = 0; j < track.skaters.length; j++) {
        if (typeof prevTrackIdx === "undefined") {
          throw new Error("Should be defined");
        }
        tl.to(
          animatingTrack.current.skaters[j],
          {
            rotation: track.skaters[j].rotation,
            x: track.skaters[j].x,
            y: track.skaters[j].y,
            duration: stepDuration,
          },
          prevTrackEnd + stepDelay
        );
      }

      if (typeof prevTrackIdx === "undefined") {
        throw new Error("Should be defined");
      }
      prevTrackEnd = prevTrackEnd + stepDelay + stepDuration;
      prevTrackIdx = i;
      prevTrack = track;
    }
    tl.add(() => {
      setIsPlaying(false);
    }, `+=${endDelay}`);
  }

  function animateAlongMeasurementLine() {
    if (!animatingTrack.current) {
      throw new Error("Expected an animatedTrack to exists");
    }

    // set relative positions to measurement line
    animatingTrack.current = getTrackWithRelativeVPositions(
      animatingTrack.current
    );

    let tl = gsap.timeline({
      onUpdate: () => {
        if (!animatingTrack.current) {
          throw new Error("Expected an animatedTrack to exists");
        }
        let track = purgeTrack(
          getTrackWithUpdatedPosition(animatingTrack.current)
        );
        track.skaters = addDerivedPropertiesToSkaters(
          track.skaters,
          settings.packMeasuringMethod
        );
        setAnimatingTrack(track);
      },
    });

    let tracks = currentSequence.sequence;
    let prevTrackIdx;
    let prevTrack;
    let prevTrackEnd = 0;

    // set initial state
    if (tracks.length && !tracks[0].empty) {
      let track = _.cloneDeep(tracks[0]);
      track.skaters = addDerivedPropertiesToSkaters(
        track.skaters,
        settings.packMeasuringMethod
      );
      track = getTrackWithRelativeVPositions(track);
      for (let j = 0; j < track.skaters.length; j++) {
        const skaterNow = track.skaters[j] as SkaterWithPivotLineDist;
        tl.set(animatingTrack.current.skaters[j], {
          rotation: skaterNow.rotation,
          pivotLineDist: skaterNow.pivotLineDist,
          v: skaterNow.v,
        });
      }
      prevTrackEnd = startDelay;
      prevTrackIdx = 0;
      prevTrack = track;
      prevTrack.skaters = addDerivedPropertiesToSkaters(
        prevTrack.skaters,
        settings.packMeasuringMethod
      );
    }

    for (let i = 1; i < tracks.length; i++) {
      if (!prevTrack) {
        throw new Error(
          "Expected prevTrack to be set up during initial state setup"
        );
      }
      let track = _.cloneDeep(tracks[i]);
      if (track.empty) continue;

      track.skaters = addDerivedPropertiesToSkaters(
        track.skaters,
        settings.packMeasuringMethod
      );
      track = getTrackWithRelativeVPositions(track);

      let sumDistance = 0;
      for (let j = 0; j < track.skaters.length; j++) {
        const skaterA = track.skaters[j];
        const skaterB = prevTrack.skaters[j];
        const dX = skaterA.x - skaterB.x;
        const dY = skaterA.y - skaterB.y;
        const newDist = Math.sqrt(dX * dX + dY * dY);
        if (useDistanceMeasurement === DISTANCE_MEASUREMENT.MAX) {
          if (newDist > sumDistance) {
            sumDistance = newDist;
          }
        } else {
          sumDistance += newDist;
        }
      }

      const stepDuration = Math.max(1, sumDistance / movementSpeed);

      for (let j = 0; j < track.skaters.length; j++) {
        const skaterNow = track.skaters[j] as SkaterWithPivotLineDist;
        const skaterPrev = prevTrack.skaters[j] as SkaterWithPivotLineDist;

        if (
          typeof skaterNow.pivotLineDist === "undefined" ||
          typeof skaterPrev.pivotLineDist === "undefined"
        ) {
          throw new Error("Missing Pivot Line Dist");
        }

        skaterNow.pivotLineDist = getClosestNextPivotLineDist(
          skaterPrev.pivotLineDist,
          skaterNow.pivotLineDist
        );
        skaterNow.rotation = getClosestNextAngle(
          skaterPrev.rotation,
          skaterNow.rotation
        );

        if (typeof prevTrackIdx === "undefined") {
          throw new Error("Should be defined");
        }

        // set pivot Line Dist based on prevTrack
        tl.to(
          animatingTrack.current.skaters[j],
          {
            rotation: track.skaters[j].rotation,
            pivotLineDist: skaterNow.pivotLineDist,
            v: skaterNow.v,
            duration: stepDuration,
          },
          prevTrackEnd + stepDelay
        );
      }

      if (typeof prevTrackIdx === "undefined") {
        throw new Error("Should be defined");
      }
      prevTrackEnd = prevTrackEnd + stepDelay + stepDuration;
      prevTrackIdx = i;
      prevTrack = track;
    }
    tl.add(() => {
      setIsPlaying(false);
    }, `+=${endDelay}`);
  }

  function getTrackWithRelativeVPositions<T extends TrackData>(
    animatingTrack: T
  ) {
    let track = _.cloneDeep(animatingTrack);
    track.skaters.forEach((skater, idx, arr) => {
      arr[idx].v = getRelativeVPosition(skater);
    });
    return track;
  }

  function getTrackWithUpdatedPosition(animatingTrack: TrackData) {
    let track = _.cloneDeep(animatingTrack);
    track.skaters.forEach((skater, idx, arr) => {
      arr[idx] = setPositionFromVAndDist(arr[idx]);
    });
    return track;
  }

  function purgeTrack(
    track: {
      skaters: { [k: string]: any; _gsap?: any }[];
    } & TrackData
  ) {
    let ret = _.cloneDeep(track);
    ret.skaters.forEach((skater) => {
      if (skater._gsap) delete skater._gsap;
    });
    return ret;
  }

  return <></>;
}

export default Player;
