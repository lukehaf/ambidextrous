// self_report/page1.jsx
import React from 'react';
import useStore from '../../store';
import styles from '../welcome/welcome.module.scss';

const Page1 = (props) => {
  const { age, major1, major2, major3, preMed, athlete, occupation1, occupation2 } = useStore((state) => state.reportSlice.page1);
  const setReport = useStore((state) => state.reportSlice.setReport);
  return (
    <div className={styles.container}>
      <h2 className={styles.subtitle}>Questionnaire (page 1/4)</h2>
      <br />
      <div className={styles.prompt}>What is your age?</div>
      <span>
        <input
          type="text"
          placeholder="22"
          value={age || ''}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value)) { // only allow integers
              setReport('page1', 'age', value);
            }
          }}
          onKeyDown={(e) => { // prevent these keys. onKeyDown happens before onChange
            if (e.key === 'e' || e.key === '-' || e.key === '+' || e.key === '.') {
              e.preventDefault();
            }
          }}
        />
        <span> years</span>
      </span>
      <br />
      <br />
      <div className={styles.prompt}>If you are a student, please enter up to 3 academic majors/minors.</div>
      <input
        type="text"
        value={major1 || ''}
        onChange={(e) => setReport('page1', 'major1', e.target.value)}
      />
      <br />
      <input
        type="text"
        value={major2 || ''}
        onChange={(e) => setReport('page1', 'major2', e.target.value)}
      />
      <br />
      <input
        type="text"
        value={major3 || ''}
        onChange={(e) => setReport('page1', 'major3', e.target.value)}
      />
      <div>
        <span>pre med? </span>
        <input
          type="checkbox"
          checked={preMed || ''} // true means it is checked
          onChange={(e) => setReport('page1', 'preMed', e.target.checked)} // e.target.checked → Returns true when checked, false when unchecked.
        />
      </div>
      <div>
        <span>athlete? </span>
        <input
          type="checkbox"
          checked={athlete || ''} // true means it is checked
          onChange={(e) => setReport('page1', 'athlete', e.target.checked)} // e.target.checked → Returns true when checked, false when unchecked.
        />
      </div>
      <br />
      <div className={styles.prompt}>If not a student, what is your occupation?</div>
      <input
        type="text"
        value={occupation1 || ''}
        onChange={(e) => setReport('page1', 'occupation1', e.target.value)}
      />
      <br />
      <input
        type="text"
        value={occupation2 || ''}
        onChange={(e) => setReport('page1', 'occupation2', e.target.value)}
      />
      <br />
      <br />
      <br />
      <button onClick={() => props.setPage(prev => prev + 1)}>Next Page</button>
    </div>
  );
};

export default Page1;
