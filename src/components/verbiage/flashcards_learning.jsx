// specific_instructions.jsx
import React, { useState } from 'react';
import useStore from '../../store/index.js';

import styles from '../welcome/welcome.module.scss';

import { GeneralInstructionsText } from '../welcome/general_instructions.jsx';

export const FlashcardsLearningText = () => { // make this importable, so it can always be shown at the bottom the screen
  return (
    <div>
      <h2 className={styles.prompt}>Next Phase: Flashcards Learning</h2>
      <ul>
        <li>A pair of names will appear, for you to type.</li>
        <li>You will cycle through the full list twice.</li>
        <li>Try to keep up with the Green Pacer Bar, but if it goes too quickly, nothing will interrupt you. It is just to encourage a quick pace.</li>
        <li>Avoid creating any specific reason that links the two names together. Instead, just let each pair become familiar.</li>
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

const FlashcardsLearning = () => {
  const [showGeneral, setShowGeneral] = useState(false);
  const nextScreen = useStore(({ testSlice }) => testSlice.nextScreen);

  return (
    <div>
      <div className={styles.container}>
        <FlashcardsLearningText />
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

export default FlashcardsLearning;
