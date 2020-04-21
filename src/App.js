import React from 'react';
import './App.css';
import { Counter } from './features/counter/Counter';

import TrackDragging from './components/Track/TrackDragging';

function App() {
  return (
    <div className="App">
      <Counter />
      <TrackDragging />
    </div>
  );
}

export default App;
