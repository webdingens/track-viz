# Track-Viz

Roller Derby Track Visualization. Started out as a clone of [NURDS](https://nurds.space/).

- [Demo](https://trackviz.netlify.app/)
- [Docs](https://trackviz-docs.netlify.app/)

## Features

- 2D View
- Rotatable
- 3D View
- Import/Export
- Sequences

## Requirements

Node 16+, npm

## Run

```bash
npm install
npm run dev
```

## Pack Computation Methods

Supports two different pack computation methods:

- [Rectangle (WFTDA)](https://trackviz.netlify.app/?showRefLane=0&showPackEndRectangles=1&packMeasuringMethod=rectangle&showEngagementZoneEndRectangles=1&showPackMethodDuringRectangleMethod=rectangle)

- [Sector (NURDS)](https://trackviz.netlify.app/?showRefLane=0&packMeasuringMethod=sector)
