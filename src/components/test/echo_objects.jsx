import React, { useState } from 'react';
import useStore from '../../store';
import styles from './progress_bar.module.scss';
import stylesWelcome from '../welcome/welcome.module.scss';

import Domino from './domino.jsx';
import { StoryLearningText } from '../verbiage/story_learning.jsx';
import { GeneralInstructionsText } from '../welcome/general_instructions.jsx';

// objects-pair timebar is purple, slower, with a varying duration (specified for each object-pair), so that participants spend sufficient time with each story. They can type as slowly as they like.
const ProgressBar = (props) => { // props.duration, passed by Echo component
  return (
    <div className={styles.progressContainer_objects}>
      <div className={styles.progressBar_objects} style={{ animationDuration: `${props.duration}s` }} />
    </div>
  );
};

const EchoObjects = () => {
  const dominoResetKey = useStore((state) => state.testSlice.currentScreen.echoPointer.dominoResetKey);
  const story = useStore((state) => state.testSlice.currentScreen.echoPointer.storyText);
  const storyTime = useStore((state) => state.testSlice.currentScreen.echoPointer.storyTime);
  // for toggling instructions
  const [showInstructions, setShowInstructions] = useState(false);
  return (
    <div>
      <div className={stylesWelcome.container} key={dominoResetKey}>
        <div className={stylesWelcome.prompt}>Imagine:</div>
        <p>{story}</p>
        <ProgressBar duration={storyTime} />
        {/* Delay EchoNames's appearance until once the progressbar finishes. */}
        <br />
        <div className={styles.delayDomino} style={{ animationDelay: `${storyTime}s` }}>
          <Domino storyTime={storyTime} />
        </div>
      </div>
      <div>
        <br />
        <button
          className={stylesWelcome.navButton}
          onClick={() => {
            setShowInstructions((prev) => !prev);
            setTimeout(() => { // Delay scrolling slightly to ensure the buttons have rendered
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 100);
          }}
        >
          {showInstructions ? 'Hide' : 'Show'} Instructions
        </button>
        {showInstructions && (
          <div>
            <div className={stylesWelcome.container}>
              <StoryLearningText />
            </div>
            <div className={stylesWelcome.container}>
              <GeneralInstructionsText />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EchoObjects;
