type TacticsData = {
  description: string
  sequences: Sequence[]
}

type Sequence = {
  title: string
  description?: string
  sequence: Situation[]
}

type Situation = {
  title?: string
  description?: string
  transitionEffect: 'NONE' | 'ANIMATE_POSITIONS' | 'FADE_OVER'
  skaters: Skater[]
  settings?: Settings
  annotations: Annotation[]
}

type SkaterData = {
  id: number
  team: 'A' | 'B'
  isJammer: boolean
  isPivot: boolean
} & Position

type Skater = SkaterData & {
  arrowToNextPosition: boolean
}

type Settings = {
  teams?: {
    A: {
      color: string
    }
    B: {
      color: string
    }
  }
  track2D?: {
    view: 'FULL' | 'FIT' | 'START'
  }
}

type Annotation = {
  type: 'ARROW'
  from: Position
  to: Position
} | {
  type: 'TOOLTIP'
  position: Position
  text: string
}

type Position = {
  x: number
  y: number
}

const data: TacticsData = {
  description: "Library description (shows on load, and on click on button [i] at top)",
  sequences: [
    {
      title: "Sequence Title for dropdown",
      description: "Sequence description",
      sequence: [
        {
          title: "Entry title (optional)",
          description: "Entry description",
          transitionEffect: "ANIMATE_POSITIONS",
          settings: {
            track2D: {
              view: "FULL"
            }
          },
          skaters: [
            {
              id: 1,
              x: 0,
              y: 0,
              team: "A",
              isJammer: false,
              isPivot: false,
              arrowToNextPosition: true
            }
          ],
          annotations: [
            {
              type: "ARROW",
              from: {
                x: 0,
                y: 0
              },
              to: {
                x: 0,
                y: 0
              }
            },
            {
              type: "TOOLTIP",
              position: {
                x: 0,
                y: 0
              },
              text: 'Lorem ipsum dolor sit amet.'
            }
          ]
        }
      ]
    }
  ]
}


export default data