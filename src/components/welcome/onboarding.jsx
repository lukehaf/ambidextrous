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
      <h3>3 Possible reply screens: (once they enter their ID, the above screen will turn into one of the following: </h3>
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
        <p>Unrecognized Dartmouth ID format. Please try again?</p>
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
        <p>It appears that your Dartmouth ID has already been used once before, on this test. Thank you for participating! We only accept one attempt per participant, since people improve as they go along.</p>
        <button
          className={styles.navButton}
          onClick={() => nextScreen('Sandbox')} // (check that on their past attempt they got far enough to hit “begin test”. Entering your email but not having begun it yet is still valid.)
        >Sandbox Mode
        </button>
        <p> For those who have already participated, we also offer the test in "Sandbox Mode". (Sandbox Mode does not submit any results, and is just for those who are interested in seeing the test again; it is also for our beta testers.)</p>
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
        <p>Thank you! We sent you a verification email. Please click the link in that email to begin the test. It will take you to an instructions screen, with a button to officially begin the test.</p>
        <p>(Or if email verification is too complicated to do by Wednesday, I'll just give them this button below to begin the test: </p>
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
  return (
    <div className={styles.container} style={{ textAlign: 'center' }}>
      <h2 className={styles.prompt}>Have you taken the test before?</h2>
      <p>Since people improve as they go along, it’s important to only submit your first attempt on the test. However, we also offer a “sandbox mode” for those who have taken the test already, and for our beta testers!</p>
      <div className={styles.navbar}>
        <div className={styles.navbar_left}>
          <button className={styles.navButton} onClick={() => nextScreen('FirstAttempt')}>First Attempt
          </button>
        </div>
        <div className={styles.navbar_right}>
          <button className={styles.navButton} onClick={() => nextScreen('Sandbox')}>Sandbox Mode
          </button>
        </div>
      </div>
      <p>Sandbox Mode does not submit any results, and will not become part of the study's data. "First Attempt" is for officially participating in the study; it will take you to another instructions screen, with a button to officially begin the test.</p>
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
