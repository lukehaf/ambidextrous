import React from 'react';
import useStore from '../../store';
import EchoNames from './echo_names.jsx';
import EchoObjects from './echo_objects.jsx';
import Recall from './recall.jsx';

const TestHasThreeUIs = () => {
  const currentScreenTest = useStore(({ testSlice }) => testSlice.currentScreenTest);
  const goToEchoNames = useStore(({ testSlice }) => testSlice.goToEchoNames);
  const goToEchoObjects = useStore(({ testSlice }) => testSlice.goToEchoObjects);
  const goToRecall = useStore(({ testSlice }) => testSlice.goToRecall);
  return (
    <div>
      <p>The Test will have 3 user interfaces:</p>
      <ul>
        <li><a onClick={goToEchoNames}>Domino Echo UI (for names)</a></li>
        <li><a onClick={goToEchoObjects}>Domino Echo UI (for objects)</a></li>
        <li><a onClick={goToRecall}>Dominoes Recall-Test (works for both names & objects)</a></li>
      </ul>
      <p>Click one of the above UIs to see it displayed below, in its currently-developed version:</p>
      <div>
        {currentScreenTest === 'EchoNames' && <EchoNames />}
        {currentScreenTest === 'EchoObjects' && <EchoObjects />}
        {currentScreenTest === 'Recall' && <Recall />}
      </div>
    </div>
  );
};

export default TestHasThreeUIs;
