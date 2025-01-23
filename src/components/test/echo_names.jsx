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
  const dominoResetKey = useStore(({ testSlice }) => testSlice.dominoResetKey); // here's LUKE'S key, from the zustand store. when this key changes it triggers a domino rerender, since it's placed here on the domino component.
  return (
    <div key={dominoResetKey}
      // The key prop is required by React when rendering lists to uniquely identify each element. Additional use: incrementing key, so React thinks it's a different key, & rerenders it/resets its state.
    >
      <Domino />
      <ProgressBar />
    </div>
  );
};

export default EchoNames;
