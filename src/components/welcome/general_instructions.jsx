// general_instructions.jsx
import React, { useState } from 'react';
import useStore from '../../store';
import styles from './welcome.module.scss';

export const GeneralInstructionsText = () => {
  return (
    <div>
      <h2 className={styles.subtitle}>General Instructions: What does participation involve?</h2>
      <p>
        There is a
        <b> learning phase </b>
        which involves “echoing back” (typing) several pairs of words that are shown onscreen. Secondly, there is a
        <b> testing phase </b>
        where participants’ recall of these pairs of words is assessed.
      </p>
      <h2 className={styles.prompt}>Two Strategies:</h2>
      <p>
        The memory test provides two strategies for memorizing pairs of words, and you will have a chance to try both strategies. The first strategy is similar to
        <b> using flashcards, </b>
        and allows pairs of first names to be learned through repeated exposure & feedback.
      </p>
      <p>
        The second strategy involves reading a
        <b> short story </b>
        which contains both words and helps link them together as a pair.
      </p>
    </div>
  );
};

export const GeneralInstructions = () => {
  const nextScreen = useStore(({ welcomeSlice }) => welcomeSlice.nextScreen);
  // originally, when GeneralInstructions was part of the screenArray, it used the testSlice.nextScreen. That had some extra functionality: setting currentScreen.counterbalanced.screenIndex++ (to one), and setting currentScreen.whichScreen to 'SpecificInstructions'. But now both are initialized as such, and don't require setting.
  const allowNextScreen = useStore(({ testSlice }) => testSlice.currentScreen.counterbalanced.initialized);
  return (
    <div className={styles.container}>
      <GeneralInstructionsText />
      <div className={styles.navbar}>
        { /* conditionally disable the <GeneralInstructions /> Next Screen button, once initializeCounterbal has run (an async process, which for non beta testers requires getting nthParticipant from server) */}
        {!allowNextScreen && (
          <div style={{ display: 'flex' }} // places the button and text side by side
          >
            <button disabled>Next Screen</button>
            <div style={{ color: 'red' }}>Waiting for server. Please allow up to 45 seconds, since I am having to make do with a free tier of the server. -Luke </div>
          </div>
        )}
        {allowNextScreen && (
          <button onClick={() => nextScreen('Test')} className={styles.navButton}>Next Screen</button>
        )}
      </div>
    </div>
  );
};

export default GeneralInstructions;

export const BetaShortcuts = () => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const betaShortcutTo = useStore((state) => state.testSlice.betaShortcutTo);
  const submitResults = useStore((state) => state.testSlice.submitResults);
  const resultsSubmissionSuccess = useStore((state) => state.testSlice.resultsSubmissionSuccess);
  return (
    <div>
      <br />
      <button
        className={styles.navButton}
        onClick={() => {
          setShowShortcuts((prev) => !prev);
          setTimeout(() => { // Delay scrolling slightly to ensure the buttons have rendered
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }, 100);
        }}
      >
        {showShortcuts ? 'Hide' : 'Show'} Shortcuts
      </button>
      {showShortcuts && (
        <div className={styles.container}>
          <h2 className={styles.subtitle}>Shortcuts through test</h2>
          <p>(only available for Beta Testers)</p>
          <button className={styles.navButton} onClick={() => betaShortcutTo(0)}>Echo Names1</button>
          <br />
          <br />
          <button className={styles.navButton} onClick={() => betaShortcutTo(2)}>Recall Names1</button>
          <br />
          <br />
          <button className={styles.navButton} onClick={() => betaShortcutTo(4)}>Echo Names2</button>
          <br />
          <br />
          <button className={styles.navButton} onClick={() => betaShortcutTo(6)}>Recall Names2</button>
          <br />
          <br />
          <button className={styles.navButton} onClick={() => betaShortcutTo(8)}>Echo Objects1</button>
          <br />
          <br />
          <button className={styles.navButton} onClick={() => betaShortcutTo(10)}>Recall Objects1</button>
          <br />
          <br />
          <button className={styles.navButton} onClick={() => betaShortcutTo(12)}>Echo Objects2</button>
          <br />
          <br />
          <button className={styles.navButton} onClick={() => betaShortcutTo(14)}>Recall Objects2</button>
          <br />
          <br />
          <button className={styles.navButton} onClick={() => betaShortcutTo(16)}>Outro Page</button>
          <br />
          <br />
          <button onClick={submitResults}>button to submit "results" datastructure, right now</button>
          {resultsSubmissionSuccess === false && (
            <p style={{ color: 'red' }}>
              Please do not navigate away... waiting for server confirmation
              <br />
              (this should take less than a minute)
            </p>
          )}
          {resultsSubmissionSuccess === true && (
            <p>Results submitted successfully. Thank you for participating, and it is now safe to close the test! </p>
          )}
        </div>
      )}
    </div>
  );
};
