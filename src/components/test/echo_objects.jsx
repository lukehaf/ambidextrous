import React from 'react';
import styles from './progress_bar.module.scss';

// names-bar is green, quick, and has the same duration for each name.
// objects-bar is purple, slower, with a varying duration (specified for each object-pair.)
// How should I make sure that THIS progress bar receives the correct styles?
//  Either I put <div className={styles.purple}
//      Will ^^ get all the .purple styles, and the shared styles?
//      if I write .purple @include (mixin of the shared styles), it will.
//      is there a way to do the same thing, using nesting/indents?
//  or I

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
