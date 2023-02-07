import { memo } from "react";
import textures from "textures";
import { SKATER_ANNOTATION_PATTERNS } from "../../types/LibraryData";

type PathsProps = {
  size?: number | null;
  d?: typeof SKATER_ANNOTATION_PATTERNS | null;
  strokeWidth?: number | null;
  shapeRendering?: string | null;
  stroke?: string | null;
  background?: string | null;
  id?: string | null;
};

class Selection {
  node: SVGElement;
  constructor(node: SVGElement) {
    this.node = node;
  }

  append(tag: string) {
    const newNode = document.createElementNS("http://www.w3.org/2000/svg", tag);
    this.node.appendChild(newNode);
    return new Selection(newNode);
  }

  attr(field: string, value: string) {
    this.node.setAttribute(field, value);
    return this;
  }
}

function Paths(props: PathsProps) {
  const { id, d, strokeWidth, stroke, size, shapeRendering, background } =
    props;

  // create texture
  let texture = textures.paths();
  if (size) texture = texture.size(size);
  if (stroke) texture = texture.stroke(stroke);
  if (strokeWidth) texture = texture.strokeWidth(strokeWidth);
  if (shapeRendering) texture = texture.shapeRendering(shapeRendering);
  if (background) texture = texture.background(background);
  if (d) texture = texture.d(d);
  if (id) texture = texture.id(id);
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const selection = new Selection(svg);
  texture(selection);
  const defs = selection.node.querySelector("defs");

  return (
    <defs
      dangerouslySetInnerHTML={{ __html: defs ? defs.innerHTML : "" }}
    ></defs>
  );
}

export default memo(Paths);
