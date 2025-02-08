import React from 'react';
// import useStore from '../../store';

// import TestHasThreeUIs from './test_has_three_uis.jsx';
// import EchoNames from './echo_names.jsx';
// import EchoObjects from './echo_objects.jsx';
import Recall from './recall.jsx';

function Test() {
  // const currentScreenTest = useStore(({ testSlice }) => testSlice.currentScreenTest);
  return (
    <div>
      <p>test has rendered</p>
      <Recall />
    </div>
  );
};

export default Test;

{ /* <div>
      {currentScreenTest === 'TestHasThreeUIs' && <TestHasThreeUIs />}
      {currentScreenTest === 'EchoNames' && <EchoNames />}
      {currentScreenTest === 'EchoObjects' && <EchoObjects />}
      {currentScreenTest === 'Recall' && <Recall />}
    </div> */ }
