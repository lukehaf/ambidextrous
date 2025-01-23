import React from 'react';
import useStore from '../../store';
import styles from './progress_bar.module.scss';

import Domino from './domino.jsx';

// objects-pair timebar is purple, slower, with a varying duration (specified for each object-pair),
// so that participants spend sufficient time with each story. They can type as slowly as they like.

const story = 'Here\'s a really long story which helps form a reason-based linkage between the two words, and which so long that the text might even need to wrap around to another line. The story comes from the Zustand store';

const animationDuration = 7; // this should maybe be specific to the story's wordcount. It comes from the zustand store

const CustomProgressBar = () => {
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar_objects} style={{ animationDuration: `${animationDuration}s` }} />
    </div>
  );
};

const EchoObjects = () => {
  const dominoResetKey = useStore(({ testSlice }) => testSlice.dominoResetKey); // here's LUKE'S key, from the zustand store. when this key changes it triggers a domino rerender, since it's placed here on the domino component.
  return (
    <div key={dominoResetKey}>
      <p>${story}</p>
      <CustomProgressBar />
      {/* Delay EchoNames's appearance until once the progressbar finishes. */}
      <div className={styles.delayDomino} style={{ animationDelay: `${animationDuration - 2}s` }}>
        <Domino />
      </div>
    </div>
  );
};

export default EchoObjects;
