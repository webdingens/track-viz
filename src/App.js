import React from 'react';
import './App.css';

import Toolbar from './components/Toolbar/Toolbar'
import SplitView from './components/SplitView/SplitView';
require('focus-visible');

function App() {
  return (
    <div className="App">
      <Toolbar />

      <SplitView />
    </div>
  );
}

export default App;
