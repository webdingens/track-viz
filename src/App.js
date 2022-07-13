import React from "react";
import "./App.css";

import Toolbar from "./components/Toolbar/Toolbar";
import SplitView from "./components/SplitView/SplitView";
import Settings from "./components/Settings/Settings";
require("focus-visible");

function App() {
  return (
    <div className="App">
      <Toolbar />

      <Settings />

      <SplitView />
    </div>
  );
}

export default App;
