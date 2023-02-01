import { ExportData, EXPORT_VERSION } from "./export";

export function convertToCurrentVersion(data: ExportData) {
  switch (data.version) {
    case "0.1.0":
      return data;
    default:
      console.error("Tried to load unimplemented version");
  }
}
