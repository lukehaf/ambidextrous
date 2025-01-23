import React from 'react';
import useStore from '../../store';

import TestHasThreeUIs from './test_has_three_uis.jsx';
import EchoNames from './echo_names.jsx';
import EchoObjects from './echo_objects.jsx';
import Recall from './recall.jsx';
import DominoStack from './domino_stack.jsx';

function Test() {
  const currentScreenTest = useStore(({ testSlice }) => testSlice.currentScreenTest);
  const dominoStackResetKey = useStore(({ testSlice }) => testSlice.dominoStackResetKey);
  return (
    <div>
      {currentScreenTest === 'TestHasThreeUIs' && <TestHasThreeUIs />}
      {currentScreenTest === 'EchoNames' && <EchoNames />}
      {currentScreenTest === 'EchoObjects' && <EchoObjects />}
      {currentScreenTest === 'Recall' && <Recall />}
      {currentScreenTest === 'DominoStack' && <DominoStack key={dominoStackResetKey} />}
    </div>
  );
};

export default Test;
