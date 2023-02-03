import "./App.css";

import Toolbar from "./components/Toolbar/Toolbar";
import SplitView from "./components/SplitView/SplitView";
import Settings from "./components/Settings/Settings";
import "focus-visible";
import QueryLoader from "./components/Library/QueryLoader";

function App() {
  return (
    <div className="App">
      <Toolbar />

      <Settings />

      <SplitView />

      <QueryLoader />
    </div>
  );
}

export default App;
