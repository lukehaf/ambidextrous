// self_report/page3.jsx
import React from 'react';
import useStore from '../../store';
import styles from '../welcome/welcome.module.scss';

const Page3 = (props) => {
  const { ADHD, dyslexia, autism, OCD, anxiety, otherDiagnosis, otherDiagnosisText } = useStore((state) => state.reportSlice.page3);
  const setReport = useStore((state) => state.reportSlice.setReport);
  return (
    <div className={styles.container}>
      <h2 className={styles.subtitle}>Questionnaire (page 3/4)</h2>
      <div className={styles.prompt}>Have you ever received a diagnosis of the following?</div>
      <p className={styles.greyText} style={{ marginTop: -20 }}>
        (Some of these might involve more or less-interconnected thinking, or other differences in memory.)
      </p>
      <label>
        <input
          type="checkbox"
          checked={ADHD || ''} // true means it is checked
          onChange={(e) => setReport('page3', 'ADHD', e.target.checked)} // e.target.checked → Returns true when checked, false when unchecked.
        />
        ADHD
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          checked={dyslexia || ''} // true means it is checked
          onChange={(e) => setReport('page3', 'dyslexia', e.target.checked)} // e.target.checked → Returns true when checked, false when unchecked.
        />
        dyslexia
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          checked={autism || ''} // true means it is checked
          onChange={(e) => setReport('page3', 'autism', e.target.checked)} // e.target.checked → Returns true when checked, false when unchecked.
        />
        autism
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          checked={OCD || ''} // true means it is checked
          onChange={(e) => setReport('page3', 'OCD', e.target.checked)} // e.target.checked → Returns true when checked, false when unchecked.
        />
        OCD
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          checked={anxiety || ''} // true means it is checked
          onChange={(e) => setReport('page3', 'anxiety', e.target.checked)} // e.target.checked → Returns true when checked, false when unchecked.
        />
        anxiety
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          checked={otherDiagnosis || ''} // true means it is checked
          onChange={(e) => setReport('page3', 'otherDiagnosis', e.target.checked)} // e.target.checked → Returns true when checked, false when unchecked.
        />
        <span>some other diagnosis </span>
        <input
          type="text"
          placeholder="(if you think it might be relevant)"
          value={otherDiagnosisText || ''}
          onChange={(e) => setReport('page3', 'otherDiagnosisText', e.target.value)}
          style={{ width: '200px' }}
        />
      </label>
      <div>
        <br />
        <button onClick={() => props.setPage(prev => prev - 1)}>Back</button>
        <button onClick={() => props.setPage(prev => prev + 1)}>Next</button>
      </div>
    </div>
  );
};

export default Page3;
