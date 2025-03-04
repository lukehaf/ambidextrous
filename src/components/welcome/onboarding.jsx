// onboarding.jsx
import React, { useState, useRef } from 'react';
import useStore from '../../store';
import styles from './welcome.module.scss';

const DartmouthOnboarding = () => {
  const nextScreen = useStore(({ welcomeSlice }) => welcomeSlice.nextScreen);
  const serverSays = useStore(({ welcomeSlice }) => welcomeSlice.serverSays);
  const fetchNth = useStore(({ welcomeSlice }) => welcomeSlice.fetchNth);
  return (
    <div>
      <div className={styles.container} style={{ textAlign: 'center' }}>
        <h2 className={styles.prompt}>Please enter your Dartmouth ID: </h2>
        <form onSubmit={fetchNth.withID}>
          <input
            type="text"
            name="studentID"
            pattern="f00[a-zA-Z0-9]{4}"
            placeholder="f00xxxx"
            maxLength="7"
            required
          />
          <button type="submit">Submit</button>
        </form>
        {serverSays === 'nothingYet' && (
          <p>
            <span>Submitted!</span>
            <span style={{ color: 'red' }}>Waiting for server. Please allow up to 45 seconds, since I am having to make do with a free tier of the server. This wait is just for the initial connection. -Luke</span>
          </p>
        )}
        {serverSays === 'invalid' && (
          <p>Unrecognized Dartmouth ID format. Please try again</p>
        )}
        {serverSays === 'taken' && (
          <p>This Dartmouth ID has already completed the test. Thank you for participating!</p>
        )}
        {serverSays === 'proceed' && (
          <div>
            <p>Thank you! ID was approved.</p>
            <button
              className={styles.navButton}
              onClick={() => nextScreen('GeneralInstructions')}
            >Begin Test
            </button>
          </div>
        )}
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
        <div className={styles.navbar}>
          <div className={styles.navbar_left} />
          <div className={styles.navbar_right}>
            <p className={styles.greyText} style={{ textAlign: 'left' }}>If you would willing to take the test as a friend (no Dartmouth ID, no compensation), this help is much appreciated-- there is only enough funding available for 25 participants, after which the button on the left will close</p>
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
