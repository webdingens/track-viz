const colorLabels = {
  "%%%COLOR_A%%%": "RED",
  "%%%Color_A%%%": "Red",
  "%%%color_A%%%": "red",
  "%%%COLOR_B%%%": "WHITE",
  "%%%Color_B%%%": "White",
  "%%%color_B%%%": "white",
};

export type ColorLabels = typeof colorLabels;

export type LibraryData = {
  title?: string;
  description?: string;
  sequences: Sequence[];
  colorLabels?: ColorLabels;
};

export type Sequence = {
  id: number;
  title: string;
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
  teams?: {
    A: {
      color: string;
    };
    B: {
      color: string;
    };
  };
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
  inBounds?: boolean;
  inPlay?: boolean;
  packSkater?: boolean;
};

export type SkaterLibraryDataType = {
  arrowToNextPosition?: boolean;
};

export type SkaterType = SkaterDataType &
  SkaterStateType &
  SkaterInferredDataType &
  SkaterLibraryDataType;
