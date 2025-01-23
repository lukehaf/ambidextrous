import React from 'react';
import useStore from '../../store';
import styles from './progress_bar.module.scss';

import Domino from './domino.jsx';

// DOES RECALL NEED A PROGRESS-BAR?

const ProgressBar = () => {
  const animationDuration = 4;
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar_names} style={{ animationDuration: `${animationDuration}s` }} />
    </div>
  );
};

const Recall = () => {
  const dominoResetKey = useStore(({ testSlice }) => testSlice.dominoResetKey); // here's LUKE'S key, from the zustand store. when this key changes it triggers a domino rerender, since it's placed here on the domino component.
  return (
    <div key={dominoResetKey}>
      <Domino />
      <ProgressBar />
    </div>
  );
};

export default Recall;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Recall is the 3rd wrapper for Domino + Progressbar. EchoNames & EchoObjects are the other two.
// Currently this Recall file is a stub, and I'm actually doing all the work in DominoStack, and I'll copy/paste it all into this Recall file.
//  DominoStack just lets me ignore the timebar for now. This Recall file has a timebar stub.
