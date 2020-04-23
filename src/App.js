import React from 'react';
import './App.css';

import Navigation from './components/Navigation/Navigation'
import TrackOverlay from './components/Track/TrackOverlay';
import Track3D from './components/Track3D/Track3D';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router>
        <Navigation />

        <Switch>
          <Route exact path="/">
            <TrackOverlay />
          </Route>

          <Route path="/3dview">
            <Track3D />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
