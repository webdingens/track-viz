# TODO List

## TODOs

### General

- add export function
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

### Track Editor

- add buttons for changing the orientation (+90, 180, 270 degree)
- add mobile considerations
  - portrait/landscape on mobile -> allow only 180 degree changes, use full space
  - off canvas menu for settings
- add history of track editor (dispatch new history entry after drag not during)
- reorder skaters so that skaters with focus are rendered before others, so the handle is visible during overlap
- choose better colors
- change font for blocker label
- add possibility to make a brace if skaters are near enough (auto brace? little wiggly arms?)
- add Option to move Skaters 180 degrees around the track (mirroring around the center)
- add Option to move Scene by any degree around the track (which we could then animate)
  - needs collision detection
  - should be a modifier with preview and apply button
  - compute next position by placing them on the relative point on the line perpendicular to the inside boundary, keeping the relative position on that line with regards to the length of the line. Then iteratively resolve collisions. See if optimization for position and resolution of constraints is a better option or we already found it with the first approach.
- Setting: Orientation
- add touch capabilites (special rotation? two touch rotate like twisting a knob, or a figure by their head)
- replace helmet star with a star that has no copyright issues (current one is copy paste from google image search)
- add Toogle for: center view around skaters (with some padding) / Show whole track
- auto rotate player based on the drag vector (probably should use last movements and a threshold or falloff)
- align with 3d camera position (like with gps navigation and look ahead, makes editing easier during split view)

### 3D View

- Setting: perspective camera FOV (Perspektivische Verzerrung [20 - 75])
- Setting: Resolution: Full, 75%, 50%, 25% for performance. Try different values
- add collision detection of 3D models (cylinder first, realistic skater model later)
  -> which controlsMode?
- compare loadable component and React.lazy, choose one, then start code splitting so we only load threejs when SplitView shows Track3D
- Setting: WebGL or alternative threejs renderers for devices without webgl
- Setting: Orthographic Camera (just perspective camera should be fine)
- add Buttons for predefined camera positions: view on start, corner views, WFTDA standard camera position
  - for which controls?

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

- add poses to 3d skater models (could use a different view for the 2d editor, or make edit possible in 3d, maybe tab cycle or mouse click, or maybe add little icon on the top right of the skater to depict what stance they have)
- load skater data/models/positions into the scene
- create models for skaters in 3D
  - spheres, cylinders or sth.
  - create small sphere with face in Blender
  - create small dummy helmets in Blender
    - partial spheres with Jammer and Pivot texture
  - realistic skater models maybe later (use make human and modify ice skating boots asset in documents folder)
- create a skating hall (flat geometry, frontside rendering, with textures)
  - floor with different scenarios: plastic tiles (ice rink overlay), linoleum, concrete
- replace lines with shape + fill so we have lines with thickness

#### VR View

- add controller controls? Don't have any :(

### Timeline

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

## Done

X add state handling
X store current state to local storage
X add new fonts

### Done: Track Editor

X Add collision handling for circles
X add possibility to rotate skaters (click focus, show handles for turning)
X show direction indicators on skaters (don't use arrows or anything pointy, but fov cone) -> Shield (helm shield)
X Update Drag Position/Rotation while dragging so it's displayed on the Track3D
X compute Pack / Engagement Zone
X display Pack / Engagement Zone
X add inPlay derived property for Skaters

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
