// onboarding.jsx
import React, { useState, useRef } from 'react';
import useStore from '../../store';
import styles from './welcome.module.scss';

const DartmouthOnboarding = () => {
  const nextScreen = useStore(({ welcomeSlice }) => welcomeSlice.nextScreen);
  return (
    <div>
      <div className={styles.container} style={{ textAlign: 'center' }}>
        <h2 className={styles.prompt}>Please enter your Dartmouth ID: </h2>
        <input
          type="text"
          id="studentID"
          name="studentID"
          pattern="f00\d{4}"
          placeholder="f00xxxx"
          maxLength="7"
          required
        />
      </div>
      <div className={styles.container} style={{ textAlign: 'center' }}>
        <h2 className={styles.prompt}>Please enter your Dartmouth ID: </h2>
        <input
          type="text"
          id="studentID"
          name="studentID"
          pattern="f00\d{4}"
          placeholder="f00xxxx"
          maxLength="7"
          required
        />
        <p>Unrecognized Dartmouth ID format. Please try again</p>
      </div>
      <div className={styles.container} style={{ textAlign: 'center' }}>
        <h2 className={styles.prompt}>Please enter your Dartmouth ID: </h2>
        <input
          type="text"
          id="studentID"
          name="studentID"
          pattern="f00\d{4}"
          placeholder="f00xxxx"
          maxLength="7"
          required
        />
        <p>This Dartmouth ID has already completed the test. Thank you for participating!</p>
      </div>
      <div className={styles.container} style={{ textAlign: 'center' }}>
        <h2 className={styles.prompt}>Please enter your Dartmouth ID: </h2>
        <input
          type="text"
          id="studentID"
          name="studentID"
          pattern="f00\d{4}"
          placeholder="f00xxxx"
          maxLength="7"
          required
        />
        <p>Thank you! ID was approved.</p>
        <button
          className={styles.navButton}
          onClick={() => nextScreen('FirstAttempt')} // (check that on their past attempt they got far enough to hit “begin test”. Entering your email but not having begun it yet is still valid.)
        >Begin Test
        </button>
      </div>
    </div>
  );
};

const NonDartOnboarding = () => {
  const nextScreen = useStore(({ welcomeSlice }) => welcomeSlice.nextScreen);
  const { initCounterbal } = useStore((state) => state.testSlice);
  const { setBeta, fetchNth } = useStore((state) => state.welcomeSlice);

  const handleBeginTest = () => {
    nextScreen('GeneralInstructions');
    fetchNth.noID(); // This setter makes an axios call (and then calls initCounterbal)
  };
  const handleBetaTesters = () => {
    nextScreen('GeneralInstructions');
    initCounterbal({ beta: true }); // initializes counterbalanced.screenArray and counterbalanced.keysArray. They aren't yet needed by GeneralInstructions, but they WILL need to be ready by the time SpecificInstructions has its 'Next Screen' button clicked.
    setBeta(true); // is this a race condition with nextScreen? I don't think so, since they don't depend on each other. <GeneralInstructions /> and {beta && <BetaShortcuts />} simply render next to each other in <App />.
  };

  return (
    <div className={styles.container} style={{ textAlign: 'center' }}>
      <div className={styles.navbar}>
        <div className={styles.navbar_left}>
          <button className={styles.navButton} onClick={handleBeginTest}>Begin Test
          </button>
        </div>
        <div className={styles.navbar_right}>
          <button className={styles.navButton} onClick={handleBetaTesters}>Beta Testers
          </button>
        </div>
      </div>
    </div>
  );
};

const Onboarding = () => {
  // for conditional render
  const [whichOnboarding, setWhichOnboarding] = useState(null);
  // handle scrolling
  const onboardRef = useRef(null);
  const showAndScroll = (screen) => {
    setWhichOnboarding(screen);
    setTimeout(() => { // Delay scrolling slightly to ensure ConsentForm is rendered
      if (onboardRef.current) {
        onboardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };
  return (
    <div>
      <div className={styles.container} style={{ textAlign: 'center' }}>
        <h2 className={styles.subtitle}>Onboarding</h2>
        <br />
        <div className={styles.navbar}>
          <div className={styles.navbar_left}>
            <button className={styles.navButton} onClick={() => showAndScroll('DartmouthOnboarding')}>For students with a Dartmouth ID</button>
          </div>
          <div className={styles.navbar_right}>
            <button className={styles.navButton} onClick={() => showAndScroll('NonDartOnboarding')}>No Dartmouth ID (for friends and family)</button>
          </div>
        </div>
      </div>
      <div ref={onboardRef}>
        {whichOnboarding === 'DartmouthOnboarding' && <DartmouthOnboarding />}
        {whichOnboarding === 'NonDartOnboarding' && <NonDartOnboarding />}
      </div>
    </div>
  );
};

export default Onboarding;
