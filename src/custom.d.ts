declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "react-svg-textures";
declare module "textures";

declare module "*?raw" {
  const defaultExportValue: string | null;
  export default defaultExportValue;
}
