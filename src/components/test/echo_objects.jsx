import React from 'react';
import styles from './echo_objects.module.scss';

const animationDuration = 7; // this should maybe be specific to the story's wordcount

const CustomProgressBar = () => {
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar} style={{ animationDuration: `${animationDuration}s` }} />
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
      <div className={styles.delayEchoNames} style={{ animationDelay: `${animationDuration - 2}s` }}>
        <input placeholder="domino UI placeholder" />
      </div>
    </div>
  );
};

export default EchoObjects;
