# TODO List

## TODOs

### General

- [ ] allow setting of colors of current scenario
  - [ ] -> Check if this is still missing
- [ ] add option to set arbitrary amount of skaters (too many skaters fielded, skaters not on the track)
  - [ ] give skaters a unique id, not by order
    - [ ] default skaters should already have a unique id
    - [ ] new skaters should get a new unique id
    - [ ] check in the current set of ids if the new id is unique across all situations
  - [ ] what about the tweening between states? should be unique id for new skaters (create set of all ids in current library, create new ids and check set for "already exists")
- [ ] add down state to skaters

- Officials:

  - [ ] add referees and nsos with 3d models
  - [ ] and others / regular bystander / dog / cat
  - [ ] makehuman route (3D):
    - [ ] create 3d models using makehuman
    - [ ] export using blender
    - [ ] export with skeleton / rigged
    - [ ] animate skeleton: set different animations for the different calls
      - [ ] enable selection of animation step
  - [ ] dynamic models route (3D):
    - [ ] add options for skaters, like height and such for specific scenarios
    - [ ] check skeletal animation
    - [ ] check if generators for simplified humans in the browser exist (like make human, maybe less options)
    - [ ] otherwise maybe generate a stick figure
  - [ ] add officials to the 2d track
  - [ ] add new annotations/markings per official
    - [ ] calling penalty or cue X
      - [ ] with Icon in 2D
    - [ ] position of official (JR, OPR etc.)
  - [ ] check to see if roller skate models appeared or how to add them to the skaters and referees
  - [ ] select the view of officials:
    - [ ] add select field to 3d view for officials' pov
    - [ ] allow fps control for selected official

- Backlog:
  - [ ] add screenshot option for easier save (download blob? screenshot api? render to canvas? render svg to canvas to jpg?)
  - [ ] add cooperation mode (node server for live interaction? everyone with link?)
  - [ ] add unit tests to pack utils package
  - [ ] add install option (service worker?) from vite plugins
  - [ ] Darkmode
  - [ ] i10n
  - [ ] add option to export current workspace that keeps the current view
  - [ ] add track measuring options
    - [ ] ruler
    - [ ] different units
    - [ ] selected person and shift + hover shows line and distance to the object being hovered (like in figma)
  - [ ] Github Project Board testen: <https://docs.github.com/en/issues/organizing-your-work-with-project-boards/managing-project-boards/about-project-boards>
  - [ ] save / export settings
  - [ ] export settings with track / library
  - [ ] load settings via url query (does this not exist?)

### Tests

- Backlog:
  - [ ] add option to randomize colors ? for tests only? leagues have their own colors
    - [ ] needs on / off switch and randomize button
    - [ ] casebook descriptions need to use the placeholders
      - [ ] maybe add a backdrop copy of the text with transparent text and if the placeholders are found surround them with spans and add a background to them
  - [ ] add testing mode:
    - [ ] engagement zone markings moving around the track, with or without skaters
    - [ ] random scenarios/loaded scenarios with question: where is the pack? then reveal
    - [ ] like penalty box math: time attack
    - [ ] prompts for Player X in Play, On Track, Part of the pack, etc.

### Track Editor 2D

- [ ] add mobile considerations
  - [ ] portrait/landscape on mobile -> allow only 180 degree changes, use full space
  - [ ] check if already built
- [ ] reorder skaters so that skaters with focus are rendered before others, so the handle is visible during overlap -> check if this already done

- Backlog:
  - [ ] add history of track editor (dispatch new history entry after drag not during)
  - [ ] add possibility to make a brace if skaters are near enough (auto brace? little wiggly arms?)
  - [ ] add touch capabilites (special rotation? two touch rotate like twisting a knob, or a figure by their head)
  - [ ] add Toogle for: center view around skaters (with some padding) / Show whole track
  - [ ] replace helmet star with a star that has no copyright issues (current one is copy paste from google image search)
  - [ ] add Option to move Scene by any degree around the track (which we could then animate)
    - [ ] needs collision detection
    - [ ] should be a modifier with preview and apply button
    - [ ] compute next position by placing them on the relative point on the line perpendicular to the inside boundary, keeping the relative position on that line with regards to the length of the line. Then iteratively resolve collisions. See if optimization for position and resolution of constraints is a better option or we already found it with the first approach.
  - [ ] Setting: Pre-Start mode, with blockers having to be on track, between jammer and pivot line
    - [ ] has different computation for inPlay, engangementZone not present
  - [ ] add Option to move Skaters 180 degrees around the track (mirroring around the center)
  - [ ] auto rotate player based on the drag vector
    - [ ] probably should use last movements and a threshold or falloff
    - [ ] probably too much magic to understand?
  - [ ] align with 3d camera position (like with gps navigation and look ahead, makes editing easier during split view)
  - [ ] UI Control: Show/Hide Pack and Engagement Area (Cycle Nub)
  - [ ] Add Focus Option / Viewport:
    - [ ] Ability to Draw a Rectangle around a part of the editor
    - [ ] Ability to zoom into rectangle (icon inside rectangle top right corner)
    - [ ] Ability to remove rectangle (icon outside rectangle, top right corner, X/Close)
    - [ ] Ability to export zoomed in mode
    - [ ] Ability to scroll to out of view parts
    - [ ] Add Option to export viewport with scene
  - [ ] Enlarge touch area around skaters
    - [ ] to have a minimum width/height or radius around skater
    - [ ] choose closest skater if two skaters are close
    - [ ] don't just use the radius of the skater, which might be too small on mobile devices
    - [ ] define what is too small
    - [ ] make decision of touch area a setting option (larger radius)

### 3D View

- Backlog:
  - [ ] Setting: perspective camera FOV (Perspektivische Verzerrung [20 - 75])
  - [ ] add collision detection of 3D models (cylinder first, realistic skater model later)
        -> which controlsMode?
  - [ ] compare loadable component and React.lazy, choose one, then start code splitting so we only load threejs when SplitView shows Track3D
  - [ ] Setting: WebGL or alternative threejs renderers for devices without webgl
  - [ ] Setting: Orthographic Camera (just perspective camera should be fine)
  - [ ] add Buttons for predefined camera positions: view on start, corner views, WFTDA standard camera position
    - [ ] for which controls?

#### Controls

- [ ] click skaters to switch camera into skater position and rotation (camera switch like google street view?) (same functionality for officials)

- Backlog:
  - [ ] Change PointerLock to use something smart for Chrome Bug detection ... maybe look at unity control handlers
        X add POV camera / movement
        X pointer lock controls (three.js)
    - [ ] first person controls
  - [ ] compare drag controls from the three examples to MapControls
    - [ ] maybe we can drag skater models? both controls possible?
  - [ ] add interaction to look at skaters
    - [ ] click then look at skater
    - [ ] for which controls? POV with cursor?
  - [ ] add a bobbing controls with skate physics

#### 3D Models

- Backlog:
  - [ ] replace lines with shape + fill so we have lines with depth
  - [ ] add poses to 3d skater models (could use a different view for the 2d editor, or make edit possible in 3d, maybe tab cycle or mouse click, or maybe add little icon on the top right of the skater to depict what stance they have)
    - [ ] try using the bones in the skinned mesh
  - [ ] add option for floor with different scenarios: plastic tiles (ice rink overlay), linoleum, concrete
  - [ ] add option for higher res textures
  - [ ] fix the shadow bug with alpha ordering? Order something?

#### VR View

- Backlog:
  - [ ] Setting: I am using Google Cardboard and want to use my custom Eye Level instead
        -> set reference space to local in initWebXR and set camera default position to eye level setting in ControlsXR
        -> might already exist?
  - [ ] add Oculus Controlers

### Library

- Backlog:
  - [ ] Add protocol to load JSON files on android (add app to list of apps used to open json, or custom web protocol trackviz+json://?)
  - [ ] Add Links option
  - [ ] Add embed option
  - [ ] create new library button (helptext: preserves current track situation) (exists?)
  - Animations / different scenario types
    - [ ] maybe use timeline, not discrete scenarios (too much work to create content?)
    - [ ] add linear tweening
    - [ ] add spring based tweening
    - [ ] add Events, with maybe different types
      - [ ] Event: 5 Seconds - the label appears
      - [ ] Event: Start - the label appears
      - [ ] place freely?
      - [ ] optional as a setting and starting at specific times on the timeline
      - [ ] Event: Call

#### Library Edit Mode

- Backlog:
  - [x] allow changing of colors (written from pov as team Color X)
    - [ ] needs hue adjustments for 3d model textures

### Testing Mode

- Backlog:
  - [ ] add description of current scene (case book)
  - [ ] create scenes of the case book
    - [ ] needs animation mode
    - [ ] maybe use step through
  - [ ] create scenarios for testing pack refs
    - [ ] with countdown (just x seconds to determine where pack is)
    - [ ] add draw mode to draw a line on the floor, then users can accept or correct, after which the pack is shown

### Casebook

- Backlog:
  - [ ] multi step scenarios with slider or dot navigation
  - [ ] scenario navigation with everything visible
  - [ ] prompt mode (show the outcome only after clicking button)
  - [ ] random prompt mode (shuffle scenarios)

## Done

- [x] add state handling
- [x] store current state to local storage
- [x] add new fonts
- [x] off canvas menu for settings
- [x] add export function
- [x] ignore certain fields from export (e.g. splitViewRerender, anything that is viewing related)
- [x] mobile view
- [x] add a documentation, like for the scoreboard
- [x] add side by side 3D option / split screen, with camera as an entity on the track editor so we can move it around (having a still image from a stream/game, what is it that we see? this? maybe not -> move skaters around a bit -> yes more like this)
- [x] continue fixing pack functions to determine the inPlay Properties
- [x] add settings view

### Done: Track Editor 2D

- [x] Add collision handling for circles
- [x] add possibility to rotate skaters (click focus, show handles for turning)
- [x] show direction indicators on skaters (don't use arrows or anything pointy, but fov cone) -> Shield (helm shield)
- [x] Update Drag Position/Rotation while dragging so it's displayed on the Track3D
- [x] compute Pack / Engagement Zone
- [x] display Pack / Engagement Zone
- [x] add inPlay derived property for Skaters
- [x] add buttons for changing the orientation (+90, 180, 270 degree)
- [x] Setting: Orientation
- [x] change font for blocker label
- [x] BUG: Pack markings are either drawn twice in some cases or the opacity changes. The pack needs to be a certain amount short for the background to be a certain color.
- [x] Setting: Focus on Starting Area -> part of view selection

### Done: 3D View

- [x] add view (modal? popup? route?) for three js
- [x] create track in three js
- [x] add Resize Updates for Renderer
- [x] add camera option for desktop
- [x] move around
- [x] add reset option to load default skater data
- [x] display Pack / Engagement Zone in 3D
- [x] save camera to the state
- [x] Setting: First Person controls
- [x] Setting: Resolution: Full, 75%, 50%, 25% for performance. Try different values
- [x] recreate bug that Ellie had, where Models and Helmets intersected and wouldn't be displayed correctly anymore
  - [x] probably fixed now that we have cancel tokens for async loading
- [x] add track markings for rectangle
- [x] add option for camera height for smaller/taller skaters (first person camera, VR camera?, gamepad already had a button for that) -> eye height setting

#### Done: 3D Models

- [x] load skater data/models/positions into the scene
- [x] add realistic skater models
- [x] create a skating hall (flat geometry, frontside rendering, with textures)
- [x] create models for skaters in 3D
  - [x] spheres, cylinders or sth.
  - [x] create small dummy helmets in Blender
    - [x] partial spheres with Jammer and Pivot texture
- [x] prevent adding of models after async loading finishes and the models have been disabled since click

#### Done: Controls

- [x] Persist Camera Position for Pointer Lock Controls
- [x] Create controls base class
- [x] Change PointerLock to use Median instead of cutoff value for outliers -> Didn't work

#### Done: VR View

- [x] Finish making the VRButton a React Component
- [x] connect the vrSessionRunning variable to the button component
- [x] connect vrModeEnabled to Track3D
- [x] switch rendering loops when vrModeEnabled changed
- [x] add VR Option so we can look around the scene
- [x] add Controls so we can run around in the scene
- [x] copy over current camera state to vr scene
- [x] add gamepad/controller controls

### Done: Library

- [x] Loading of JSON either loads single scene into Track Editor or:
      -> loads via separate button from the navigation
- [x] Loading of JSON loads multiple Sequences into the app
- [x] add bookmarks (for timelines or current state of track editor) -> can be done with library
- [x] add a Navigation (e.g. Dropdown or Modal) to the header (in Track or 3D Mode)
- [x] display sequences as a gallery, with optional transitions between the skaters

#### Done: Library Edit Mode

- [x] add Button to switch to Edit Mode and close it
- [x] add the add new button (new Sequences, Scenarios etc.)
- [x] show sequence editor at bottom of the page
      -> No directly on the side
- [x] adds edit buttons to library entries
- [x] add move situation up/down
- [x] keep edit state in redux, on save copy over to current library (prevents loss of data)
