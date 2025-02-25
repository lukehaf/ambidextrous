// first_attempt.jsx
/* eslint-disable @stylistic/max-statements-per-line */
import React from 'react';
import useStore from '../../store/index.js';
import styles from './welcome.module.scss';

const FirstAttempt = () => {
  const nextScreen = useStore(({ welcomeSlice }) => welcomeSlice.nextScreen);
  const setSandbox = useStore((state) => state.welcomeSlice.setSandbox);
  return (
    <div className={styles.container}>
      <h2 className={styles.subtitle}>Before you begin</h2>
      <p>
        <b>Timing and breaks: </b>
        <br />
        The test usually takes between 20 and 30 minutes, and is best taken in one sitting. There will be opportunities for small breaks, if needed, during the “Progress & Next Instructions” screen between each 1/8th of the test.
      </p>
      <p>
        <b>Do not close your browser while taking the test— </b>
        <br />
        currently it does not have a login option, and closing the test would unfortunately delete your progress. (The browser's refresh and back arrow buttons have also been disabled for this reason— please test that now, if you wouldn't mind. If nothing happens, proceed.)
      </p>
      <p>
        If you are ready to begin the test, click the button below! Alternatively, this is a last opportunity to close the test and save your official attempt for later, if you are not sure that you have the full 20-30 minutes available.
        <div className={styles.greyText}>
          (Unfortunately, interrupted tests are incomplete and cannot be included in the final data. They also cannot be restarted, since this would give the participant more practice than usual with the first memory-strategy compared to the second, and could bias the results.)
        </div>
      </p>
      <p>In advance, thank you for your effort, honesty, and generosity by signing up for this study! It makes possible this study's contribution to the memory-literature, and I would look forward to keeping you updated with its conclusions. (Opt in at the end of the test.)</p>
      <button onClick={() => { nextScreen('Test'); setSandbox(false); }} className={styles.navButton}>Begin Test!</button>
    </div>
  );
};

export default FirstAttempt;
