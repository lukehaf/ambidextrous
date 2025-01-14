import React from 'react';
import styles from './progress_bar.module.scss';

// objects-pair timebar is purple, slower, with a varying duration (specified for each object-pair),
// so that participants spend sufficient time with each story. They can type as slowly as they like.

const animationDuration = 7; // this should maybe be specific to the story's wordcount

const CustomProgressBar = () => {
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar_purple} style={{ animationDuration: `${animationDuration}s` }} />
    </div>
  );
};

const EchoObjects = () => {
  return (
    <div>
      <p>Here's where the story goes, to associate the two garden-related objects. Get the story from the zustand store.</p>
      <div>Here's a little counter/timebar, to give an appropriate amount of time per story before EchoNames appears.</div>
      <CustomProgressBar />
      {/* Delay EchoNames's appearance until once the progressbar finishes. */}
      <div className={styles.delayDomino} style={{ animationDelay: `${animationDuration - 2}s` }}>
        <input placeholder="domino UI placeholder" />
      </div>
    </div>
  );
};

export default EchoObjects;
