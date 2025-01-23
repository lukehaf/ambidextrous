/* eslint-disable @stylistic/jsx-one-expression-per-line */
import React from 'react';
import useStore from '../../store/index.js';

const TestHasThreeUIs = () => {
  const goToEchoNames = useStore(({ testSlice }) => testSlice.goToEchoNames);
  const goToEchoObjects = useStore(({ testSlice }) => testSlice.goToEchoObjects);
  const goToRecall = useStore(({ testSlice }) => testSlice.goToRecall);
  const goToDominoStack = useStore(({ testSlice }) => testSlice.goToDominoStack);

  // set something in TestHasThreeUIs which changes currentScreen to 'Test'
  return (
    <div>
      <p>The Test will have 3 user interfaces:</p>
      <ul>
        <li><a onClick={goToEchoNames}>Domino Echo UI (for names)</a></li>
        <li><a onClick={goToEchoObjects}>Domino Echo UI (for objects)</a></li>
        <li><a onClick={goToRecall}>Dominoes Recall-Test (works for both names & objects)</a></li>
        <li><a onClick={goToDominoStack}>Domino Stack UI</a></li>
      </ul>
      <p>Click one of the above UIs to see it displayed, in its currently-developed version.</p>
    </div>
  );
};

export default TestHasThreeUIs;
