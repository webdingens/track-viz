# TODO List

## TODOs

### General

- add bookmarks (for timelines or current state of track editor)
- give skaters a solid id, not by order
- add screenshot option for easier save (download blob? screenshot api? render to canvas? render svg to canvas to jpg?)
- add cooperation mode (node server for live interaction? everyone with link?)
- save options?
- add options for skaters, like height and such for specific scenarios
- add option for camera height for smaller/taller skaters (benefits?)
- add side by side 3D option / split screen, with camera as an entity on the track editor so we can move it around (having a still image from a stream/game, what is it that we see? this? maybe not -> move skaters around a bit -> yes more like this)
- add feature description (or make the GUI self explanatory)
- mobile view
- add testing options
  - engagement zone markings moving around the track, with or without skaters
  - random scenarios/loaded scenarios with question: where is the pack? then reveal
- ignore certain fields from export (e.g. splitViewRerender, anything that is viewing related)
- add another redux slice for internal states, so we don't export that and don't load initial states either
- i10n
- Github Project Board testen: https://docs.github.com/en/issues/organizing-your-work-with-project-boards/managing-project-boards/about-project-boards
- add settings view
- add track measuring options
- continue fixing pack functions to determine the inPlay Properties
- setup tests the same way as penalty box math

### Track Editor

- add mobile considerations
  - portrait/landscape on mobile -> allow only 180 degree changes, use full space
- add history of track editor (dispatch new history entry after drag not during)
- reorder skaters so that skaters with focus are rendered before others, so the handle is visible during overlap
- choose better colors
- add possibility to make a brace if skaters are near enough (auto brace? little wiggly arms?)
- add Option to move Skaters 180 degrees around the track (mirroring around the center)
- Setting: Focus on Starting Area
- add touch capabilites (special rotation? two touch rotate like twisting a knob, or a figure by their head)
- replace helmet star with a star that has no copyright issues (current one is copy paste from google image search)
- add Toogle for: center view around skaters (with some padding) / Show whole track
- auto rotate player based on the drag vector (probably should use last movements and a threshold or falloff)
- add Option to move Scene by any degree around the track (which we could then animate)
  - needs collision detection
  - should be a modifier with preview and apply button
  - compute next position by placing them on the relative point on the line perpendicular to the inside boundary, keeping the relative position on that line with regards to the length of the line. Then iteratively resolve collisions. See if optimization for position and resolution of constraints is a better option or we already found it with the first approach.
- align with 3d camera position (like with gps navigation and look ahead, makes editing easier during split view)
- Setting: Show/Hide Pack and Engagement Area (Cycle Nub)
- Setting: Pre-Start mode, with blockers having to be on track, between jammer and pivot line
- Add Focus Option:
  - Ability to Draw a Rectangle around a part of the editor
  - Ability to zoom into rectangle (icon inside rectangle top right corner)
  - Ability to remove rectangle (icon outside rectangle, top right corner, X/Close)
  - Ability to export zoomed in mode
  - Ability to scroll to out of view parts
- Change drag on touch to have a minimum width/height around skater
  - choose closest skater if two skaters are close
  - don't just use the radius of the skater, which might be too small on mobile devices
  - define what is too small
  - make decision of touch area a setting option (larger radius)

### Library Mode

- Loading of JSON either loads single scene into Track Editor or:
- Loading of JSON loads multiple Sequences into the app and adds a Navigation (e.g. Dropdown or Modal) to the header
- Sequence can be thought of as a gallery, with optional transitions between the skaters
- Add protocol to load JSON files on android ()
- add install option (service worker?) from vite plugins

### 3D View

- Setting: perspective camera FOV (Perspektivische Verzerrung [20 - 75])
- add collision detection of 3D models (cylinder first, realistic skater model later)
  -> which controlsMode?
- compare loadable component and React.lazy, choose one, then start code splitting so we only load threejs when SplitView shows Track3D
- Setting: WebGL or alternative threejs renderers for devices without webgl
- Setting: Orthographic Camera (just perspective camera should be fine)
- add Buttons for predefined camera positions: view on start, corner views, WFTDA standard camera position
  - for which controls?
- recreate bug that Ellie had, where Models and Helmets intersected and wouldn't be displayed correctly anymore
- add track markings for rectangle

#### Controls

- Change PointerLock to use something smart for Chrome Bug detection ... maybe look at unity control handlers
X add POV camera / movement
  X pointer lock controls (three.js)
  - first person controls
- compare drag controls from the three examples to MapControls
  - maybe we can drag skater models? both controls possible?
- click skaters to switch camera into skater position and rotation (camera switch like google street view?)
- add interaction to look at skaters
  - click then look at skater
  - for which controls? POV with cursor?
- add a bobbing controls with skate physics

#### Models

- replace lines with shape + fill so we have lines with depth
- add poses to 3d skater models (could use a different view for the 2d editor, or make edit possible in 3d, maybe tab cycle or mouse click, or maybe add little icon on the top right of the skater to depict what stance they have)
  - try using the bones in the skinned mesh
- create models for skaters in 3D
  - spheres, cylinders or sth.
  - create small sphere with face in Blender
  - create small dummy helmets in Blender
    - partial spheres with Jammer and Pivot texture
- add option for floor with different scenarios: plastic tiles (ice rink overlay), linoleum, concrete
- add option for higher res textures
- prevent adding of models after async loading finishes and the models have been disabled since click
- fix the shadow bug with alpha ordering? Order something?

#### VR View

- add gamepad/controller controls? Don't have any :(
- Setting: I am using Google Cardboard and want to use my custom Eye Level instead
  -> set reference space to local in initWebXR and set camera default position to eye level setting in ControlsXR

### Sequence Editor

- add label to tracks
- show label in preview

#### Timeline

- add option to have more than one state and a timeline (like bookmarks but for tweening)
- add history of timeline
- add linear tweening
- add spring based tweening
- add Events, with maybe different types
  - Event: 5 Seconds - the label appears
  - Event: Start - the label appears
  - place freely?
  - optional as a setting and starting at specific times on the timeline
  - Event: Call
  - Labels freely choosable?

### Settings

- Setting: settings view (how does one create a view? One could add another button to the app overlay, which hides/shows the input fields)

### Testing Mode

- add description of current scene (case book)
- create scenes of the case book
  - needs animation mode
  - maybe use step through
- create scenarios for testing pack refs
  - with countdown (just x seconds to determine where pack is)
  - add draw mode to draw a line on the floor, then users can accept or correct, after which the pack is shown

### Casebook

- multi step scenarios with slider or dot navigation
- scenario navigation with everything visible
- prompt mode (show the outcome only after clicking button)
- random prompt mode (shuffle scenarios)
- add the 

## Done

X add state handling
X store current state to local storage
X add new fonts
X off canvas menu for settings
X add export function

### Done: Track Editor

X Add collision handling for circles
X add possibility to rotate skaters (click focus, show handles for turning)
X show direction indicators on skaters (don't use arrows or anything pointy, but fov cone) -> Shield (helm shield)
X Update Drag Position/Rotation while dragging so it's displayed on the Track3D
X compute Pack / Engagement Zone
X display Pack / Engagement Zone
X add inPlay derived property for Skaters
X add buttons for changing the orientation (+90, 180, 270 degree)
X Setting: Orientation
X change font for blocker label

### Done: 3D View

X add view (modal? popup? route?) for three js
X create track in three js
X add Resize Updates for Renderer
X add camera option for desktop
  X move around
X add reset option to load default skater data
X display Pack / Engagement Zone in 3D
X save camera to the state
X Setting: First Person controls
X Setting: Resolution: Full, 75%, 50%, 25% for performance. Try different values

#### Done: 3D Models

X load skater data/models/positions into the scene
X add realistic skater models
X create a skating hall (flat geometry, frontside rendering, with textures)

#### Done: Controls

X Persist Camera Position for Pointer Lock Controls
X Create controls base class
X Change PointerLock to use Median instead of cutoff value for outliers -> Didn't work

#### Done: VR View

X Finish making the VRButton a React Component
X connect the vrSessionRunning variable to the button component
X connect vrModeEnabled to Track3D
X switch rendering loops when vrModeEnabled changed
X add VR Option so we can look around the scene
X add Controls so we can run around in the scene
X copy over current camera state to vr scene

## Sequence Editor

X Setting: Open/Close Editor
X check if multiple small tracks beside each other triggers phobia of holes -> only for irregular patterns of holes

### Timeline
