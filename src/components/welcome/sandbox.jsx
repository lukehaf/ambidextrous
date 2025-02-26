// sandbox.jsx
/* eslint-disable @stylistic/max-statements-per-line */
import React, { useState } from 'react';
import useStore from '../../store';
import styles from './welcome.module.scss';

const Sandbox = () => {
  const nextScreen = useStore(({ welcomeSlice }) => welcomeSlice.nextScreen);
  const setSandbox = useStore((state) => state.welcomeSlice.setSandbox);
  return (
    <div className={styles.container}>
      <h2 className={styles.subtitle}>Sandbox Mode</h2>
      <p>Cheerful reminder! Please do not use Sandbox Mode to explore the test before making your official “First Attempt”. This experience would bias your results compared to other participants. (It’s ok to have heard a few of the test’s names or objects beforehand, for instance during conversation with Luke. We just ask that you do not show the test itself to other participants, before they've had the chance to take it themselves for the first time.)</p>
      <p>
        <i>Do not close your browser while taking the test— </i>
        currently it does not have a login option, and closing the test would unfortunately delete your progress. (The browser's refresh and back arrow buttons have also been disabled for this reason— please test that now, if you wouldn't mind. If nothing happens, proceed.)
      </p>
      <button onClick={() => { nextScreen('Test'); setSandbox(true); }} className={styles.navButton}>Begin Test in Sandbox Mode</button>
    </div>
  );
};

export const SandboxShortcuts = () => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const sandboxShortcutTo = useStore((state) => state.testSlice.sandboxShortcutTo);
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
          console.log('scroll');
        }}
      >
        {showShortcuts ? 'Hide' : 'Show'} Shortcuts
      </button>
      {showShortcuts && (
        <div className={styles.container}>
          <h2 className={styles.subtitle}>Shortcuts through test</h2>
          <p>(only available for Sandbox Mode)</p>
          <button className={styles.navButton} onClick={() => sandboxShortcutTo(1)}>Echo Names1</button>
          <br />
          <br />
          <button className={styles.navButton} onClick={() => sandboxShortcutTo(3)}>Recall Names1</button>
          <br />
          <br />
          <button className={styles.navButton} onClick={() => sandboxShortcutTo(5)}>Echo Names2</button>
          <br />
          <br />
          <button className={styles.navButton} onClick={() => sandboxShortcutTo(7)}>Recall Names2</button>
          <br />
          <br />
          <button className={styles.navButton} onClick={() => sandboxShortcutTo(9)}>Echo Objects1</button>
          <br />
          <br />
          <button className={styles.navButton} onClick={() => sandboxShortcutTo(11)}>Recall Objects1</button>
          <br />
          <br />
          <button className={styles.navButton} onClick={() => sandboxShortcutTo(13)}>Echo Objects2</button>
          <br />
          <br />
          <button className={styles.navButton} onClick={() => sandboxShortcutTo(15)}>Recall Objects2</button>
          <br />
        </div>
      )}
    </div>
  );
};

export default Sandbox;
