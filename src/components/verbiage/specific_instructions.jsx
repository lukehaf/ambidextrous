// specific_instructions.jsx
import React, { useState } from 'react';
import useStore from '../../store/index.js';

import styles from '../welcome/study_info.module.scss';

import { GeneralInstructionsText } from './general_instructions.jsx';

const SpecificInstructions = () => {
  const [showGeneral, setShowGeneral] = useState(false);
  const nextScreen = useStore(({ testSlice }) => testSlice.nextScreen);

  return (
    <div>
      <h2 className={styles.subheader}>Progress & Next Instructions</h2>
      <p className={styles.paragraph}>
        Progress: 0/8ths complete.
        <br></br>
        [here's where you are in the sequence]
      </p>
      { /* conditionally render Next Instructions */}
      <h2 className={styles.subheader}>Next Instructions:</h2>
      <p className={styles.paragraph}>
        [here's an instructions-block which conditionally renders. 4 versions: EchoNames, RecallNames, EchoObjects, RecallObjects]
      </p>
      { /* button for <GeneralInstructions /> and nextScreen */}
      <div>
        <button
          onClick={() => setShowGeneral((prev) => !prev)}
          className={styles.navButton}
        >
          {showGeneral ? 'Hide' : 'Show'} General Instructions
        </button>
        { /* NextScreen button */}
        <button onClick={nextScreen} className={styles.navButton}>Next Screen</button>
        { /* conditionally render <GeneralInstructions /> */}
        {showGeneral && <GeneralInstructionsText />}
      </div>
    </div>
  );
};

export default SpecificInstructions;
