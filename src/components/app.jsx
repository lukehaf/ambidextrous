import React from 'react';
import '../style.scss';

// import our components
import Counter from './counter';
import Controls from './controls';
import NavbarAndPage from './routing.jsx';

function App(props) {
  return (
    <div>
      <Counter />
      <Controls />
      <NavbarAndPage />
    </div>
  );
};

export default App;
