// sandbox.jsx
/* eslint-disable @stylistic/max-statements-per-line */
import React from 'react';
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

export default Sandbox;
