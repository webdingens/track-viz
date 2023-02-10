import "./App.css";

import Menu from "./components/Menu/Menu";
import SplitView from "./components/SplitView/SplitView";
import Settings from "./components/Settings/Settings";
import "focus-visible";
import QueryLoader from "./components/Library/QueryLoader";

function App() {
  return (
    <div className="App">
      <Menu />

      <Settings />

      <SplitView />

      <QueryLoader />
    </div>
  );
}

export default App;
