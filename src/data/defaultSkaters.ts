import { SkaterDataType } from "roller-derby-track-utils";

const defaultSkaters: SkaterDataType[] = [
  {
    id: 1,
    x: 0,
    y: 5,
    rotation: 180,
    team: "A",
  },
  {
    id: 2,
    x: 0,
    y: 6,
    rotation: 180,
    team: "A",
  },
  {
    id: 3,
    x: 0,
    y: 7,
    rotation: 180,
    team: "A",
  },
  {
    id: 4,
    x: 4,
    y: 5,
    rotation: 180,
    team: "A",
    isPivot: true,
  },
  {
    id: 5,
    x: -4.5,
    y: 5,
    rotation: 0,
    team: "A",
    isJammer: true,
  },
  {
    id: 6,
    x: 2,
    y: 5,
    rotation: 180,
    team: "B",
  },
  {
    id: 7,
    x: 2,
    y: 6,
    rotation: 180,
    team: "B",
  },
  {
    id: 8,
    x: 2,
    y: 7,
    rotation: 180,
    team: "B",
  },
  {
    id: 9,
    x: 4,
    y: 7,
    rotation: 180,
    team: "B",
    isPivot: true,
  },
  {
    id: 10,
    x: -4.5,
    y: 7,
    rotation: 0,
    team: "B",
    isJammer: true,
  },
];

export default defaultSkaters;
