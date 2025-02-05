import React from 'react';
import useStore from '../../store';
import styles from './progress_bar.module.scss';

import Domino from './domino.jsx';

// objects-pair timebar is purple, slower, with a varying duration (specified for each object-pair), so that participants spend sufficient time with each story. They can type as slowly as they like.
const ProgressBar = (props) => { // props.duration, passed by Echo component
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar_names} style={{ animationDuration: `${props.duration}s` }} />
    </div>
  );
};

const EchoObjects = () => {
  const resetKey = useStore((state) => state.testSlice.currentScreen.echoPointer.resetKey);
  const story = useStore((state) => state.testSlice.currentScreen.echoPointer.story);
  const storyTime = useStore((state) => state.testSlice.currentScreen.echoPointer.storyTime);
  return (
    <div key={resetKey}>
      <p>${story}</p>
      <ProgressBar duration={storyTime} />
      {/* Delay EchoNames's appearance until once the progressbar finishes. */}
      <div className={styles.delayDomino} style={{ animationDelay: `${storyTime - 2}s` }}>
        <Domino />
      </div>
    </div>
  );
};

export default EchoObjects;
