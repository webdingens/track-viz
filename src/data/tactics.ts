import { LibraryData } from "../types/LibraryData";

const data: LibraryData = {
  description:
    "Library description (shows on load, and on click on button [i] at top)",
  sequences: [
    {
      id: 1,
      title: "Sequence Title for dropdown",
      description: "Sequence description",
      sequence: [
        {
          id: 1,
          title: "Entry title (optional)",
          description: "Entry description",
          transitionEffect: "ANIMATE_POSITIONS",
          type: "DESCRIPTION",
          settings: {
            track2D: {
              view: "FULL",
            },
          },
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
          annotations: [
            {
              type: "ARROW",
              from: {
                x: 0,
                y: 0,
              },
              to: {
                x: 0,
                y: 0,
              },
            },
            {
              type: "TOOLTIP",
              position: {
                x: 0,
                y: 0,
              },
              text: "Lorem ipsum dolor sit amet.",
            },
          ],
        },
      ],
    },
  ],
};

export default data;
