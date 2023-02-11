import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

function OutlinedText({ text, size = 0.9 }) {
  const filterId = useId();
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const textNode = useRef(null);
  const isMounted = useRef(false);

  const fontSize = 16 * size;
  const dilationRadius = 0.14 * fontSize;

  const updateSize = () => {
    if (!textNode.current) return;
    const bbox = textNode.current.getBBox();

    setWidth(bbox.width);
    setHeight(bbox.height);
  };

  useLayoutEffect(() => {
    updateSize();
  }, [text, size]);

  useEffect(() => {
    isMounted.current = true;
    document.fonts.ready.then(() => {
      if (isMounted.current) updateSize();
    });
    return () => (isMounted.current = false);
  }, []);

  return (
    <>
      <svg
        width={width}
        height={height}
        viewBox={`${-0.25 * dilationRadius},${-0.25 * dilationRadius} ${
          width + 0.5 * dilationRadius
        },${height + 0.5 * dilationRadius}`}
      >
        <filter id={filterId}>
          {/* Increase alpha and clip back to 1 */}
          <feComposite
            in="SourceAlpha"
            operator="arithmetic"
            k2="100"
            result="thresholdedAlpha"
          ></feComposite>

          {/* dilate and output thresholded alpha */}
          <feMorphology
            in="thresholdedAlpha"
            result="dilatedSource"
            operator="dilate"
            radius={dilationRadius}
          ></feMorphology>
          <feFlood floodColor="#fff" result="outlineColor"></feFlood>
          <feComposite
            in="outlineColor"
            in2="dilatedSource"
            operator="in"
            result="outline"
          ></feComposite>
        </filter>

        {/* dilated text */}
        <text
          fontSize={fontSize}
          dy=".92em"
          fontStyle="italics"
          style={{ filter: `url(#${filterId})` }}
        >
          {text}
        </text>

        {/* draw original text on top */}
        <text ref={textNode} fontSize={fontSize} dy=".92em" fontStyle="italics">
          {text}
        </text>
      </svg>
    </>
  );
}

export default OutlinedText;
