import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import gsap from "gsap";

import {
  getRelativeVPosition,
  setPositionFromVAndDist,
  getClosestNextPivotLineDist,
  getClosestNextAngle,
  getSkatersWDPPivotLineDistance,
  getSkatersWDPInBounds,
  PACK_MEASURING_METHODS,
  getSkatersWDPInPlayPackSkater,
} from "../../utils/packFunctions";

import { selectCurrentTrack } from "../../app/reducers/currentTrackSlice";

import {
  selectIsPlaying,
  setIsPlaying as _setIsPlaying,
  ANIMATION_STATE,
  setAnimationState as _setAnimationState,
  selectAnimationState,
  setAnimatingTrack as _setAnimatingTrack,
  selectAnimatingTrack,
  AnimationStateType,
} from "../../app/reducers/animatingTrackSlice";
import {
  Sequence,
  SkaterDataType,
  SkaterType,
  SkaterWithPivotLineDist,
  TrackData,
} from "../../types/LibraryData";
import { selectGeneralSettings } from "../../app/reducers/settingsGeneralSlice";

const PLAYBACK_TYPES = {
  SIMPLE: "SIMPLE",
  MEASUREMENT_LINE: "MEASUREMENT_LINE",
};

type PlayerProps = {
  sequence: Sequence;
};

function Player({ sequence }: PlayerProps) {
  const dispatch = useDispatch();
  const currentTrack = useSelector(selectCurrentTrack);
  const currentSequence = sequence;
  const isPlaying = useSelector(selectIsPlaying);
  const settings = useSelector(selectGeneralSettings);
  const animatingTrack = useRef<TrackData | null>(null);
  const animationState = useSelector(selectAnimationState);
  const timeline = useRef<GSAPTimeline | null>(null);

  const playbackType = PLAYBACK_TYPES.SIMPLE;

  const setIsPlaying = (val: boolean) => dispatch(_setIsPlaying(val));
  function setAnimatingTrack<T extends TrackData>(track: T) {
    dispatch(_setAnimatingTrack(track));
  }
  const setAnimationState = (val: AnimationStateType) =>
    dispatch(_setAnimationState(val));

  useEffect(() => {
    if (isPlaying) {
      // start animation with current track
      let startingTrack = getTrackWithRelativeVPositions(
        _.cloneDeep(currentTrack)
      );
      startingTrack.skaters = addDerivedPropertiesToSkaters(
        startingTrack.skaters
      );
      animatingTrack.current = startingTrack;
      // store the animating track for <TrackAnimating> component
      setAnimatingTrack(_.cloneDeep(startingTrack));
      setAnimationState(ANIMATION_STATE.PLAYING);
    } else {
      if (timeline.current) timeline.current.kill();
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
      if (timeline.current) timeline.current.kill();
      setAnimationState(ANIMATION_STATE.STOPPED);
    };
  }, []);

  function addDerivedPropertiesToSkaters(
    skaters: SkaterDataType[]
  ): SkaterType[] {
    let ret = getSkatersWDPInBounds(skaters);
    ret = getSkatersWDPPivotLineDistance(ret);
    if (settings.packMeasuringMethod === PACK_MEASURING_METHODS.SECTOR) {
      ret = getSkatersWDPInPlayPackSkater(ret, {
        method: PACK_MEASURING_METHODS.SECTOR,
      });
    } else {
      ret = getSkatersWDPInPlayPackSkater(ret, {
        method: PACK_MEASURING_METHODS.RECTANGLE,
      });
    }
    return ret;
  }

  function animateSequence() {
    if (playbackType === PLAYBACK_TYPES.SIMPLE) {
      animateSimple();
    } else {
      animateAlongMeasurementLine();
    }
  }

  function animateSimple() {
    if (!animatingTrack.current) {
      throw new Error("Expected an animatedTrack to exists");
    }

    let tl = gsap.timeline({
      onUpdate: () => {
        if (animatingTrack.current) {
          let track = purgeTrack(animatingTrack.current);
          track.skaters = addDerivedPropertiesToSkaters(track.skaters);
          setAnimatingTrack(track);
        }
      },
    });
    let tracks = currentSequence.sequence;
    let firstTrack = true;
    let prevTrackIdx;
    let prevTrackEnd = 0;
    for (let i = 0; i < tracks.length; i++) {
      let track = tracks[i];
      if (track.empty) continue;

      for (let j = 0; j < track.skaters.length; j++) {
        if (firstTrack) {
          tl.to(
            animatingTrack.current.skaters[j],
            {
              // rotation: track.skaters[j].rotation,
              x: track.skaters[j].x,
              y: track.skaters[j].y,
              duration: 0.2,
            },
            0
          );
        } else {
          if (typeof prevTrackIdx === "undefined") {
            throw new Error("Should be defined");
          }
          tl.to(
            animatingTrack.current.skaters[j],
            {
              // rotation: track.skaters[j].rotation,
              x: track.skaters[j].x,
              y: track.skaters[j].y,
              duration: 0.2 * (i - prevTrackIdx),
            },
            prevTrackEnd + 0.5
          );
        }
      }

      if (firstTrack) {
        prevTrackEnd = 0.2 + 0.5;
      } else {
        if (typeof prevTrackIdx === "undefined") {
          throw new Error("Should be defined");
        }
        prevTrackEnd = prevTrackEnd + 0.5 + 0.2 * (i - prevTrackIdx);
      }

      prevTrackIdx = i;
      firstTrack = false;
    }
    tl.add(() => {
      setIsPlaying(false);
    }, "+=1");
    timeline.current = tl;
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
        track.skaters = addDerivedPropertiesToSkaters(track.skaters);
        setAnimatingTrack(track);
      },
    });

    let tracks = currentSequence.sequence;
    let firstTrack = true;
    let prevTrackIdx;
    let prevTrack = _.cloneDeep(currentTrack);
    prevTrack.skaters = addDerivedPropertiesToSkaters(prevTrack.skaters);
    let prevTrackEnd = 0;
    for (let i = 0; i < tracks.length; i++) {
      let track = _.cloneDeep(tracks[i]);
      if (track.empty) continue;

      track.skaters = addDerivedPropertiesToSkaters(track.skaters);
      track = getTrackWithRelativeVPositions(track);

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

        if (firstTrack) {
          tl.to(
            animatingTrack.current.skaters[j],
            {
              rotation: skaterNow.rotation,
              pivotLineDist: skaterNow.pivotLineDist,
              v: skaterNow.v,
              duration: 0.2,
            },
            0
          );
        } else {
          if (typeof prevTrackIdx === "undefined") {
            throw new Error("Should be defined");
          }
          // set pivot Line Dist based on prevTrack
          tl.to(
            animatingTrack.current.skaters[j],
            {
              rotation: skaterNow.rotation,
              pivotLineDist: skaterNow.pivotLineDist,
              v: skaterNow.v,
              duration: 0.2 * (i - prevTrackIdx),
            },
            prevTrackEnd + 0.5
          );
        }
      }

      if (firstTrack) {
        prevTrackEnd = 0.2 + 0.5;
      } else {
        if (typeof prevTrackIdx === "undefined") {
          throw new Error("Should be defined");
        }
        prevTrackEnd = prevTrackEnd + 0.5 + 0.2 * (i - prevTrackIdx);
      }

      prevTrackIdx = i;
      prevTrack = track;
      firstTrack = false;
    }
    tl.add(() => {
      setIsPlaying(false);
    }, "+=1");
    timeline.current = tl;
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
