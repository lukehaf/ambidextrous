import React, { useState } from 'react';
import useStore from '../../store';
import styles from './progress_bar.module.scss';
import stylesWelcome from '../welcome/welcome.module.scss';

import Domino from './domino.jsx';
import { GeneralInstructionsText } from '../welcome/general_instructions.jsx';
import { FlashcardsLearningText } from '../verbiage/flashcards_learning.jsx';

// names-bar is green, quick, and has the same duration for each name.

const ProgressBar = () => {
  const animationDuration = 4; // limit the time per name-pair, so they can't invent mnemonics.
  return (
    <div className={styles.progressContainer_names}>
      <div className={styles.progressBar_names} style={{ animationDuration: `${animationDuration}s` }} />
    </div>
  );
};

const EchoNames = () => {
  const dominoResetKey = useStore((state) => state.testSlice.currentScreen.echoPointer.dominoResetKey);
  // for toggling instructions
  const [showInstructions, setShowInstructions] = useState(false);
  return (
    <div>
      <div key={dominoResetKey} className={stylesWelcome.container}>
        <Domino />
        <br />
        <ProgressBar />
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
              <FlashcardsLearningText />
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

export default EchoNames;
