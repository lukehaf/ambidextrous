import React from 'react';

// import our components
import Counter from './counter';
import Controls from './controls';

function App(props) {
  return (
    <div>
      <Counter />
      <Controls />
    </div>
  );
};

export default App;
