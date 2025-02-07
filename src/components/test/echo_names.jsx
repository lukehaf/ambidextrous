import React from 'react';
import useStore from '../../store';
import styles from './progress_bar.module.scss';

import Domino from './domino.jsx';

// names-bar is green, quick, and has the same duration for each name.

const ProgressBar = () => {
  const animationDuration = 4; // limit the time per name-pair, so they can't invent mnemonics.
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar_names} style={{ animationDuration: `${animationDuration}s` }} />
    </div>
  );
};

const EchoNames = () => {
  const dominoResetKey = useStore((state) => state.testSlice.currentScreen.echoPointer.dominoResetKey);
  return (
    <div key={dominoResetKey}>
      <Domino />
      <ProgressBar />
    </div>
  );
};

export default EchoNames;
