import { LibraryData } from "../types/LibraryData";

const data: LibraryData = {
  colorLabels: {
    "%%%COLOR_A%%%": "RED",
    "%%%Color_A%%%": "Red",
    "%%%color_A%%%": "red",
    "%%%COLOR_B%%%": "WHITE",
    "%%%Color_B%%%": "White",
    "%%%color_B%%%": "white",
  },
  sequences: [
    {
      id: 1,
      title: "2.2. Positions",
      description:
        "<blockquote><p>When a Jam begins, the Jammers must be touching on or behind the Jammer Line. All Blockers must be behind the Pivot Line, ahead of the Jammer Line, and all Non-Pivot Blockers must not be touching the Pivot Line. If either Pivot lines up touching the Pivot Line at the Jam’s start, all Non-Pivot Blockers must be behind that Pivot’s hips.</p><figcaption>—Origin: Section 2.2</figcaption></blockquote>",
      sequence: [
        {
          id: 1,
          title: "Scenario C2.2.A",
          type: "PROMPT",
          situation:
            "As the Jam-Starting Whistle sounds, Red Jammer’s left skate has rolled forward, past the Jammer Line.",
          outcome: "Richtext WYSIWYG",
          refs: [],
          skaters: [
            {
              id: 1,
              x: 0,
              y: 0,
              rotation: 90,
              team: "A",
              isJammer: false,
              isPivot: false,
              arrowToNextPosition: true,
            },
          ],
        },
      ],
    },
  ],
};

export default data;
