import { LibraryData, TrackData } from "../../types/LibraryData";

export const EXPORT_VERSION = "0.1.0"; // current version for exporting

export const EXPORT_TYPES = {
  SINGLE_TRACK: "SINGLE_TRACK",
  LIBRARY: "LIBRARY",
} as const;

type ExportTypes = typeof EXPORT_TYPES;

type LibraryExportData = LibraryData & {
  type: ExportTypes["LIBRARY"];
};

type SingleTrackExportData = TrackData & {
  type: ExportTypes["SINGLE_TRACK"];
};

// ExportData is exported to the public JSON schema
export type ExportData = { version: typeof EXPORT_VERSION } & (
  | LibraryExportData
  | SingleTrackExportData
);

/**
 * Removes inferred data from skater data
 */
export const cleanupExportData = (data: ExportData): ExportData => {
  if (data.type === EXPORT_TYPES.LIBRARY) {
    return {
      ...data,
      version: data.version,
      type: data.type,
      sequences: data.sequences.map((sequence) => ({
        ...sequence,
        sequence: sequence.sequence.map((scenario) => {
          return {
            ...scenario,
            skaters: scenario.skaters.map(
              ({
                id,
                x,
                y,
                rotation,
                team,
                isJammer,
                isPivot,
                color,
                description,
                pattern,
              }) => ({
                id,
                x,
                y,
                rotation,
                team,
                isJammer,
                isPivot,
                color,
                description,
                pattern,
              })
            ),
          };
        }),
      })),
    };
  } else {
    return {
      ...data,
      version: data.version,
      type: data.type,
      skaters: data.skaters.map(
        ({
          id,
          x,
          y,
          rotation,
          team,
          isJammer,
          isPivot,
          color,
          description,
          pattern,
        }) => ({
          id,
          x,
          y,
          rotation,
          team,
          isJammer,
          isPivot,
          color,
          description,
          pattern,
        })
      ),
    };
  }
};
