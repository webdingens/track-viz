export type LibraryFileData = {
  loadedAt?: number;
  editedAt?: number;
};

export type LibraryData = {
  [k: string]: any;
  title?: string;
  description?: string;
  povTeam?: "A" | "B" | "None";
  sequences: Sequence[];
} & LibraryFileData;

export type Sequence = {
  id: number;
  title?: string;
  description?: string;
  sequence: Situation[];
};

export const SITUATION_TYPES = {
  DESCRIPTION: "DESCRIPTION",
  PROMPT: "PROMPT",
};

export type TrackData = {
  skaters: SkaterType[];
  refs: RefData[];
};

export type Situation = {
  id: number;
  title?: string;
  description?: string;
  transitionEffect?: "NONE" | "ANIMATE_POSITIONS" | "FADE_OVER";
  settings?: Settings;
  empty?: boolean;
  annotations?: Annotation[];
} & TrackData &
  (
    | {
        type: typeof SITUATION_TYPES.DESCRIPTION;
      }
    | {
        type: typeof SITUATION_TYPES.PROMPT;
        situation: string;
        outcome: string;
      }
  );

export type RefData = {
  id: number;
} & Position &
  Rotation;

export type Settings = {
  track2D?: {
    view: "FULL" | "FIT" | "START";
  };
};

export type Annotation =
  | {
      type: "ARROW";
      from: Position;
      to: Position;
    }
  | {
      type: "TOOLTIP";
      position: Position;
      text: string;
    };

export type Position = {
  x: number;
  y: number;
};

export type Rotation = {
  rotation: number;
};

export type SkaterDataType = {
  id: number;
  team: "A" | "B";
  isPivot?: boolean;
  isJammer?: boolean;
} & Position &
  Rotation;

export type SkaterStateType = {
  hasFocus?: boolean;
};

export type SkaterInferredDataType = {
  pivotLineDist?: number;
  inBounds?: boolean;
  inPlay?: boolean;
  packSkater?: boolean;
  v?: number;
};

export const SKATER_ANNOTATION_PATTERNS = {
  SQUARES: "squares",
  NYLON: "nylon",
  WAVES: "waves",
  WOVEN: "woven",
  CAPS: "caps",
  CROSSES: "crosses",
  HEXAGONS: "hexagons",
} as const;

import { SKATER_ANNOTATION_COLORS } from "../utils/colors";
export type SkaterAnnotationType = {
  color?: typeof SKATER_ANNOTATION_COLORS;
  description?: string;
  pattern?: typeof SKATER_ANNOTATION_PATTERNS;
};

export type SkaterLibraryDataType = {
  arrowToNextPosition?: boolean;
};

export type SkaterType = SkaterDataType &
  SkaterStateType &
  SkaterInferredDataType &
  SkaterLibraryDataType &
  SkaterAnnotationType;

export type SkaterWithPivotLineDist = SkaterType & {
  pivotLineDist: number;
};
