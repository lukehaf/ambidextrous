// navbar.jsx
import React from 'react';
import styles from './navbar.module.scss';
import useStore from '../../store';

// here's the 3rd flexbox element
function ParticipantCounter() {
  const count = useStore(({ welcomeSlice }) => welcomeSlice.participantsStillNeeded);
  return (
    <div className={styles.counter}>
      Counter: {count} participants still needed.
    </div>
  );
}

const Navbar = () => {
  const consent = useStore(({ welcomeSlice }) => welcomeSlice.consent); // subscribe to a piece of state, rather than fetching the whole state (this affects rerender frequency)
  const goToTest = useStore(({ welcomeSlice }) => welcomeSlice.goToTest);
  const showStudyInfo = useStore(({ welcomeSlice }) => welcomeSlice.showStudyInfo);
  return (
    <div className={styles.navbar}>
      <button onClick={showStudyInfo} className={styles.navButton}>Information about the test</button>
      <button onClick={goToTest} className={`${styles.navButton} ${!consent ? styles.disabled : ''}`} disabled={!consent}> I agree, I would like to participate, and am ready to begin </button>
      <ParticipantCounter />
    </div>
  );
};

export default Navbar;
