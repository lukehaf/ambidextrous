// welcome.jsx.
import React from 'react';
import useStore from '../../store';

import WelcomeText from './welcome_text.jsx';
import Navbar from './navbar.jsx';
import StudyInfo from './study_info.jsx';

const Welcome = () => {
  const studyInfoVisible = useStore(({ welcomeSlice }) => welcomeSlice.studyInfoVisible);
  return (
    <div>
      <WelcomeText />
      <Navbar />
      {studyInfoVisible === true && <StudyInfo />}
    </div>
  );
};

export default Welcome;
