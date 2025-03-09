// welcome.jsx.
/* eslint-disable @stylistic/jsx-one-expression-per-line */

import React, { useRef } from 'react';
import useStore from '../../store';
import styles from './welcome.module.scss';

const WelcomeText = () => {
  return (
    <div className={styles.container} style={{ textAlign: 'center' }}>
      <h1 className={styles.title}>Dartmouth College Memory Study</h1>
      <h2 className={styles.subtitle}>An Interactive Online Test, Comparing 2 Memorization Strategies</h2>
      <h3 className={styles.traits}>(Flashcards/Repetition, vs. Stories & Reasons)</h3>
      <p>by Luke Hafermann, for the Quantitative Social Sciences major<br />(an undergraduate Honors Thesis in QSS)</p>
      <p>Under the Supervision of Arjen Stolk, PhD;<br />Department of Psychological and Brain Sciences</p>
      <p className={styles.invitation}><b>You are invited to participate in a research study!</b></p>
      <p style={{ color: 'red' }}><b>Study has reached 25 participants, and has no more funding for paid participants. Please feel free to take the test as a friend or family member, however! Study has a goal of roughly 77 participants total.</b></p>
      {/*
          <p>Counter: The test has received complete submissions from {count} participants. Goal: 30 participants.</p>
        */}
    </div>
  );
};

const StudyInfo = () => {
  return (
    <div>
      <p>This study investigates two memorization strategies, using a custom-designed memory test. The study will contribute to the existing literature on memory, and also lays the foundation for a future study about interconnected thinking vs on-topic thinking.</p>
      <p><b>Your participation is voluntary. </b>This memory test is all online, and takes about 20 minutes to complete. There is a learning phase which involves “echoing back” (typing) several pairs of words that are shown onscreen. Secondly, there is a testing phase where participants’ recall of these pairs of words is assessed. You may leave the study at any time.</p>
      <p>The only data recorded for this study are your Dartmouth ID, several self-report questions, and your timing and accuracy results, gathered while you memorize & recite (via typing) pairs of words. Your Dartmouth ID will be kept separate from your timing and accuracy scores. Names and other identifying information will not be used in any presentation or paper written about this project.</p>
      <p>
        Participants will be compensated with a $20 Amazon gift card, available for pickup in the QSS department office (Silsby 110), once the
        <b> study has closed to additional paid participants (true on March 9 2025). </b>
        You will receive an email when the gift cards are available. This study appreciates participants’ support and best effort— the recall task is intended to be somewhat difficult, and a 100% accurate score is not expected for most. However, if you happen to enjoy competition, keep in mind that you could prove to be the exception…
      </p>
      <p>Please feel free to contact me at <a href="mailto:Luke.D.Hafermann.25@Dartmouth.edu">Luke.D.Hafermann.25@Dartmouth.edu</a> if you have further questions about the study or if you are interested to learn more about the research and my finished paper.</p>
    </div>
  );
};

const ConsentForm = () => {
  const nextScreen = useStore(({ welcomeSlice }) => welcomeSlice.nextScreen);
  return (
    <div className={styles.container}>
      <h2 className={styles.consent}>Consent</h2>
      <p>I have read the above information about the “Memory Test for Interconnected vs. Tightly-Scoped Thinking” and have been given time to reflect and reach out with any questions. By clicking the “I agree” button, this is taken as documentation of my consent to proceed with this study. I will be emailed a copy of this online information page & consent form, and of my finished results, to document my completion of the study.</p>
      <button onClick={() => nextScreen('Onboarding')} className={styles.navButton}>I agree</button>
      <p>Thank you for participating, and I hope you find the test interesting & enjoyable!</p>
    </div>
  );
};

const Welcome = () => {
  const consentFormVisible = useStore(({ welcomeSlice }) => welcomeSlice.consentFormVisible);
  const show = useStore(({ welcomeSlice }) => welcomeSlice.showConsentForm);
  const consentFormRef = useRef(null); // Create a reference to the ConsentForm section, for scrolling purposes

  const showConsentForm = () => {
    show();
    setTimeout(() => { // Delay scrolling slightly to ensure ConsentForm is rendered
      if (consentFormRef.current) {
        consentFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100); // Adjust timing if needed
  };

  return (
    <div>
      <WelcomeText />
      <div className={styles.container}>
        <StudyInfo />
        <div className={styles.navbar}>
          <button className={styles.navButton} onClick={showConsentForm}>
            Show Consent Form below
          </button>
        </div>
      </div>
      <div ref={consentFormRef}>
        {consentFormVisible && <ConsentForm />}
      </div>
    </div>
  );
};

export default Welcome;
