import React from 'react';
import useStore from '../store';
import '../style.scss';
import { ToastContainer } from 'react-toastify'; // displays errors to the user, rather than just my previous approach of console logging them
import { usePreventReload, useDisableBackButton } from './disable_browser_navigation.jsx';

import Welcome from './welcome/welcome.jsx';
import Onboarding from './welcome/onboarding.jsx';
import GeneralInstructions, { BetaShortcuts } from './welcome/general_instructions.jsx';
import Test from './test/test.jsx';
import Questionnaire from './self_report/questionnaire.jsx';
import SafeToExit from './self_report/safe_to_exit.jsx';

// (props) might be needed here, IDK. Everything I write, though, uses zustand hooks rather than props.
function App(props) {
  useDisableBackButton();
  usePreventReload();
  const currentScreen = useStore(({ welcomeSlice }) => welcomeSlice.currentScreen);
  const beta = useStore(({ welcomeSlice }) => welcomeSlice.beta);
  return (
    <div>
      {currentScreen === 'Welcome' && <Welcome />}
      {currentScreen === 'Onboarding' && <Onboarding />}
      {currentScreen === 'GeneralInstructions' && <GeneralInstructions />}
      {currentScreen === 'Test' && <Test />}
      {currentScreen === 'Questionnaire' && <Questionnaire />}
      {currentScreen === 'SafeToExit' && <SafeToExit />}
      {beta && <BetaShortcuts />}
      <ToastContainer
        position="bottom-right"
        autoClose={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        theme="light"
      />
    </div>
  );
};

export default App;
