// App conditionally renders 1 component at a time (either the Welcome screen, or the Test) depending on Zustand store.
// I modified the store so that currentScreen starts out with a default value of 'Welcome'.

// Now I need to modify Welcome/Navbar so that (clicking the test button) sets currentScreen to a value of 'Test'.
// First I modified store to include a setter function: goToTest. Import that as a hook

import React from 'react';
import useStore from '../store';
import '../style.scss';

import Welcome from './welcome/welcome.jsx';
import TestHasThreeUIs from './test/test.jsx';

// (props) might be needed here, IDK. Everything I write, though, uses zustand hooks rather than props.
function App(props) {
  const currentScreen = useStore(({ welcomeSlice }) => welcomeSlice.currentScreen);
  return (
    <div>
      {currentScreen === 'Welcome' && <Welcome />}
      {currentScreen === 'TestHasThreeUIs' && <TestHasThreeUIs />}
    </div>
  );
};

export default App;
