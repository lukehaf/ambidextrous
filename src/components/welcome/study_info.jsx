import React from 'react';
import useStore from '../../store';
import styles from './study_info.module.scss';

const StudyInfo = () => {
  const gaveConsent = useStore(({ welcomeSlice }) => welcomeSlice.gaveConsent);
  return (
    <div className={styles.container}>
      <p className={styles.paragraph}>
        This study investigates two hypothesized memory traits, using a custom-designed memory test. The study will contribute to the existing literature on memory, and specifically about how different people benefit from using different memory strategies.
      </p>
      <p className={styles.paragraph}>
        <b>Your participation is voluntary.</b>
        The memory test is all online, and takes at most 30 minutes to complete. There is a listening phase which involves “echoing back” (typing) several pairs of words that are shown onscreen. Secondly, there is a recall-phase where participants’ recall of these pairs of words is assessed. You may leave the study at any time.
      </p>

      <p className={styles.paragraph}>
        The only data recorded for this study are your Dartmouth ID and your timing and accuracy results, gathered while you memorize & recite (via typing) pairs of words. Your Dartmouth ID will be kept separate from your timing and accuracy scores. Names and other identifying information will not be used in any presentation or paper written about this project
      </p>

      <p className={styles.paragraph}>
        You will be compensated upon completion of the study with an average of $20, via Venmo. You will receive at least $10 and at most $30, depending on your performance on the two tests. This payment structure is designed to encourage full effort for the accuracy & timing on the recall-task. The recall task is intended to be somewhat difficult, and a 100% accurate score is not expected for most. However, if you happen to enjoy competition, keep in mind that you might be able to be the exception…
      </p>

      <p className={styles.paragraph}>
        Please feel free to contact me at
        <a href="mailto:Luke.D.Hafermann.25@Dartmouth.edu">Luke.D.Hafermann.25@Dartmouth.edu</a>
        if you have further questions about the study or if you are interested to learn more about the research and my finished paper.
      </p>

      <h2 className={styles.subheader}>Consent</h2>
      <p className={styles.paragraph}>
        I have read the above information about the “Memory Test of Order-Linking & Similarity-Linking” and have been given time to reflect and reach out with any questions. By clicking the “I agree” button, this is taken as documentation of my consent to proceed with this study. I will be emailed a copy of this online information page & consent form, and of my finished results, to document my completion of the study.
      </p>

      <button onClick={gaveConsent} className={styles.navButton}>I agree</button>

      <p className={styles.paragraph}>Thank you for participating, and I hope you find the test interesting & enjoyable!</p>
    </div>
  );
};

export default StudyInfo;
