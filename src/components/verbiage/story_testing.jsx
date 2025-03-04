// specific_instructions.jsx
import React, { useState } from 'react';
import useStore from '../../store/index.js';

import styles from '../welcome/welcome.module.scss';

import { GeneralInstructionsText } from '../welcome/general_instructions.jsx';

const StoryTestingText = () => {
  return (
    <div>
      <h2 className={styles.prompt}>Instructions for Testing Phase:</h2>
      <ul>
        <li>In a grid format you will type in the word-pairs.</li>
        <li>You will perform the grid 3 times in a row.</li>
        <li>Goal: 100% accuracy by the 3rd grid.</li>
        <li>If you’re not sure of a word, type your best guess. (Only click the IDK button if you cannot get it right).</li>
      </ul>
      <h2 className={styles.prompt}>Typing Instructions:</h2>
      <ul>
        <li>Type what you see in the grey text.</li>
        <li>Everything is lowercase.</li>
        <li>Use Backspace for typing mistakes.</li>
        <li>Use the Spacebar between words AND use the Spacebar to submit your entry.</li>
      </ul>
    </div>
  );
};

const SpecificInstructions = () => {
  const [showGeneral, setShowGeneral] = useState(false);
  const nextScreen = useStore(({ testSlice }) => testSlice.nextScreen);

  return (
    <div>
      <div className={styles.container}>
        <StoryTestingText />
        { /* button for <GeneralInstructions /> and nextScreen */}
        <div className={styles.navbar}>
          <div className={styles.navbar_left}>
            <button onClick={() => setShowGeneral((prev) => !prev)} className={styles.navButton}>
              {showGeneral ? 'Hide' : 'Show'} General Instructions
            </button>
          </div>
          <div className={styles.navbar_right}>
            <button onClick={nextScreen} className={styles.navButton}>Next Screen</button>
          </div>
        </div>
      </div>
      { /* conditionally render <GeneralInstructions /> */}
      {showGeneral && (
        <div className={styles.container}>
          <GeneralInstructionsText />
        </div>
      )}
    </div>
  );
};

export default SpecificInstructions;
