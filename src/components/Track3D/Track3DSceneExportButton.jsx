import React from "react";

import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";

class Track3DSceneExportButton extends React.Component {
  componentWillUnmount() {
    if (this.url) URL.revokeObjectURL(this.url);
  }

  onClick() {
    if (this.sceneRequested) return; // wait till we request again

    // Instantiate a exporter
    var exporter = new GLTFExporter();
    let options = {};

    // Parse the input and generate the glTF output
    exporter.parse(
      this.props.scene,
      (gltf) => {
        this.sceneRequested = false;

        let a = document.createElement("a");

        let json = JSON.stringify(gltf);
        let blob = new Blob([json], { type: "octet/stream" });

        this.url = window.URL.createObjectURL(blob);

        a.href = this.url;
        a.download = "TrackVizScene.gltf";
        document.body.appendChild(a);
        a.dispatchEvent(new MouseEvent("click"));
        document.body.removeChild(a);
        URL.revokeObjectURL(this.url);
      },
      options
    );

    this.sceneRequested = true;
  }

  render() {
    return (
      <button
        onClick={() => this.onClick()}
        download="TrackVizScene.gltf"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        Export Scene
      </button>
    );
  }
}

export default Track3DSceneExportButton;
