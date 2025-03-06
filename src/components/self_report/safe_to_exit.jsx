// self_report/safe_to_exit.jsx
import React from 'react';
import useStore from '../../store';
import styles from '../welcome/welcome.module.scss';

const SafeToExit = () => {
  const resultsSubmissionSuccess = useStore((state) => state.testSlice.resultsSubmissionSuccess);
  const surveyReceived = useStore((state) => state.reportSlice.surveyReceived);
  return (
    <div className={styles.container}>
      <h2 className={styles.subtitle}>Final Screen</h2>
      <div className={styles.prompt}></div>
      {resultsSubmissionSuccess === 'notYet' && (
        <p style={{ color: 'red' }}>
          Please do not navigate away... waiting for server to receive "results" datastructure.
          <br />
          (this should take less than 45 seconds)
        </p>
      )}
      {surveyReceived === 'notYet' && (
        <p style={{ color: 'red' }}>
          Please do not navigate away... waiting for server to receive "Questionnaire" datastructure.
          <br />
          (this should take less than 45 seconds)
        </p>
      )}
      {(resultsSubmissionSuccess === true && surveyReceived === true) && (
        <div>
          <p>Results & Questionnaire submitted successfully.</p>
          <p>Thank you for participating, and it is now safe to close the test!</p>
          <p>Over Spring Break I will send out an email (to those who entered a Dartmouth ID/email address), which will have information about the study, its results, and compensation. Thanks again! -Luke Daniel Hafermann</p>
        </div>
      )}
    </div>
  );
};

export default SafeToExit;
