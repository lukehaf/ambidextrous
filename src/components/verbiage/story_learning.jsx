// specific_instructions.jsx
import React, { useState } from 'react';
import useStore from '../../store/index.js';

import styles from '../welcome/welcome.module.scss';

import { GeneralInstructionsText } from '../welcome/general_instructions.jsx';

export const StoryLearningText = () => { // make this importable, so it can always be shown at the bottom the screen
  return (
    <div>
      <h2 className={styles.prompt}>Next Phase: Story-based Learning</h2>
      <ul>
        <li>A short story will be provided, which helps link together two words. Reflect on the story and try to imagine it.</li>
        <li>After a few seconds, a box will appear, and you will type the pair of words.</li>
        <li>Each story will only be shown once.</li>
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

const StoryLearning = () => {
  const [showGeneral, setShowGeneral] = useState(false);
  const nextScreen = useStore(({ testSlice }) => testSlice.nextScreen);

  return (
    <div>
      <div className={styles.container}>
        <StoryLearningText />
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

export default StoryLearning;
