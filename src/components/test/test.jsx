import React from 'react';
import useStore from '../../store';

// import TestHasThreeUIs from './test_has_three_uis.jsx'; {currentScreenTest === 'TestHasThreeUIs' && <TestHasThreeUIs />} // for troubleshooting
import EchoNames from './echo_names.jsx';
import EchoObjects from './echo_objects.jsx';
import Recall from './recall.jsx';
import Results from '../results/results.jsx';

import SpecificInstructions from '../verbiage/specific_instructions.jsx';
import SelfReport from '../verbiage/self_report.jsx';

function Test() {
  const currentScreenTest = useStore(({ testSlice }) => testSlice.currentScreen.whichScreen);
  return (
    <div>
      {currentScreenTest === 'SpecificInstructions' && <SpecificInstructions />}
      {currentScreenTest === 'EchoNames' && <EchoNames />}
      {currentScreenTest === 'EchoObjects' && <EchoObjects />}
      {currentScreenTest === 'Recall' && <Recall />}
      {currentScreenTest === 'Results' && <Results />}
      {currentScreenTest === 'SelfReport' && <SelfReport />}
    </div>
  );
};

export default Test;

///////////////////////////////////////////
// then I NEED TO HAVE THE WHICHSCREEN CONDITIONALLY RENDER A COMPONENT. SO I NEED TO REFACTOR 'TEST' OR WHATEVER TO IMPORT ALL THOSE COMPONENTS AND CONDITIONALLY RENDER THEM.
