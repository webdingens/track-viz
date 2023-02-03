import { useDispatch, useSelector } from "react-redux";
import { selectCurrentSkaters } from "../../app/reducers/currentTrackSlice";
import { setSkaters } from "../../app/reducers/currentTrackSlice";
import { SKATER_ANNOTATION_PATTERNS } from "../../types/LibraryData";

import styles from "./SkaterAnnotations.module.scss";
import { useEffect, useId, useState } from "react";
import { selectGeneralSettings } from "../../app/reducers/settingsGeneralSlice";
import {
  getAlternateColor,
  SKATER_ANNOTATION_COLORS,
} from "../../utils/colors";
import CirclePreview from "../Skater/CirclePreview";

function SkaterAnnotations() {
  const dispatch = useDispatch();
  const skaters = useSelector(selectCurrentSkaters);
  const focussedSkater = skaters.find((skater) => skater.hasFocus);
  const settings = useSelector(selectGeneralSettings);
  const teamColor = !focussedSkater
    ? null
    : focussedSkater.team === "A"
    ? settings.colorTeamA
    : settings.colorTeamB;

  const id = useId();
  const [color, setColor] = useState(
    focussedSkater?.color ?? SKATER_ANNOTATION_COLORS.ORIGINAL
  );
  const [description, setDescription] = useState(
    focussedSkater?.description ?? ""
  );
  const [pattern, setPattern] = useState(focussedSkater?.pattern ?? "");

  // sync new skaters settings into state
  useEffect(() => {
    if (!focussedSkater) return;
    setColor(focussedSkater?.color ?? SKATER_ANNOTATION_COLORS.ORIGINAL);
    setDescription(focussedSkater?.description ?? "");
    setPattern(focussedSkater?.pattern ?? "");
  }, [focussedSkater?.id]);

  useEffect(() => {
    if (!focussedSkater) return;
    const index = skaters.findIndex(
      (skater) => skater.id === focussedSkater.id
    );
    const newSkaters = [...skaters];
    newSkaters.splice(index, 1, {
      ...focussedSkater,
      color,
      description,
      pattern,
    });
    dispatch(setSkaters(newSkaters));
  }, [color, description, pattern]);

  if (!focussedSkater) return null;

  const alternateColor = getAlternateColor(teamColor);

  return (
    <div className={[styles.skaterAnnotations, "js-annotations"].join(" ")}>
      <fieldset>
        <legend>Color Variation</legend>
        <div>
          <label>
            <input
              type="radio"
              name="color"
              value={color}
              checked={color === SKATER_ANNOTATION_COLORS.ORIGINAL}
              onChange={() => {
                setColor(SKATER_ANNOTATION_COLORS.ORIGINAL);
              }}
            />
            Original
            <CirclePreview color={teamColor} />
          </label>
        </div>
        <div>
          <label>
            <input
              id={`${id}-color-alternate`}
              type="radio"
              name="color"
              value={alternateColor}
              checked={color === SKATER_ANNOTATION_COLORS.ALTERNATE}
              onChange={() => {
                setColor(SKATER_ANNOTATION_COLORS.ALTERNATE);
              }}
            />
            {teamColor.l > 0.5 ? "Darker" : "Lighter"}
            <CirclePreview color={alternateColor} />
          </label>
        </div>
      </fieldset>
      <div>
        <label htmlFor={`${id}-description`}>Description</label>
        <input
          id={`${id}-description`}
          type="text"
          name="description"
          value={description}
          onChange={(evt) => {
            setDescription(evt.target.value);
          }}
        />
      </div>
      <div>
        <label htmlFor={`${id}-pattern`}>Pattern</label>
        <select
          name="pattern"
          id={`${id}-pattern`}
          value={pattern}
          onChange={(evt) => {
            setPattern(evt.target.value);
          }}
        >
          <option value="">None</option>
          {Object.values(SKATER_ANNOTATION_PATTERNS).map((value, idx) => (
            <option value={value} key={idx}>
              {value}
            </option>
          ))}
        </select>
        <CirclePreview
          color={
            color === SKATER_ANNOTATION_COLORS.ORIGINAL
              ? teamColor
              : alternateColor
          }
          pattern={pattern}
        />
      </div>
    </div>
  );
}

export default SkaterAnnotations;
