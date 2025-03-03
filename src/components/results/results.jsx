// results.jsx.
import React from 'react';
import useStore from '../../store';
import styles from '../welcome/welcome.module.scss';

const Results = () => {
  const submitResults = useStore((state) => state.testSlice.submitResults);
  const resultsSubmissionSuccess = useStore((state) => state.testSlice.resultsSubmissionSuccess);
  return (
    <div className={styles.container} style={{ textAlign: 'center' }}>
      <h2 className={styles.prompt}>Test is complete!</h2>
      <button onClick={submitResults}>submit "results" datastructure</button>
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
  );
};

export default Results;
