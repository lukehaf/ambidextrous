// self_report/page2.jsx
import React from 'react';
import useStore from '../../store';
import styles from '../welcome/welcome.module.scss';

const Page2 = (props) => {
  const { sleep, freshBefore, freshAfter } = useStore((state) => state.reportSlice.page2);
  const setReport = useStore((state) => state.reportSlice.setReport);
  return (
    <div className={styles.container}>
      <h2 className={styles.subtitle}>Questionnaire (page 2/4)</h2>
      <div className={styles.prompt}>How much sleep did you get last night?</div>
      <label>
        <input
          type="radio"
          checked={sleep === 'good'}
          onChange={() => setReport('page2', 'sleep', 'good')}
        />
        I slept well, and I felt well-rested
      </label>
      <br />
      <label>
        <input
          type="radio"
          checked={sleep === 'neutral'}
          onChange={() => setReport('page2', 'sleep', 'neutral')}
        />
        <span className={styles.greyText}>(neutral)</span>
      </label>
      <br />
      <label>
        <input
          type="radio"
          checked={sleep === 'poor'}
          onChange={() => setReport('page2', 'sleep', 'poor')}
        />
        I slept poorly, and I felt tired and foggy
      </label>
      <br />
      <br />
      <br />
      <div className={styles.prompt}>Did you feel mentally fresh, upon starting the test?</div>
      <p className={styles.greyText} style={{ marginTop: -20 }}>
        (Or conversely, did you already feel cognitively fatigued, for instance due to a full day of work?)
      </p>
      <label>
        <input
          type="radio"
          checked={freshBefore === 'fresh'}
          onChange={() => setReport('page2', 'freshBefore', 'fresh')}
        />
        I felt mentally fresh
      </label>
      <br />
      <label>
        <input
          type="radio"
          checked={freshBefore === 'neutral'}
          onChange={() => setReport('page2', 'freshBefore', 'neutral')}
        />
        <span className={styles.greyText}>(neutral)</span>
      </label>
      <br />
      <label>
        <input
          type="radio"
          checked={freshBefore === 'fatigued'}
          onChange={() => setReport('page2', 'freshBefore', 'fatigued')}
        />
        I felt cognitively fatigued
      </label>
      <br />
      <br />
      <br />
      <div className={styles.prompt}>How do you currently feel, after completing the test?</div>
      <label>
        <input
          type="radio"
          checked={freshAfter === 'fresh'}
          onChange={() => setReport('page2', 'freshAfter', 'fresh')}
        />
        I feel mentally fresh
      </label>
      <br />
      <label>
        <input
          type="radio"
          checked={freshAfter === 'neutral'}
          onChange={() => setReport('page2', 'freshAfter', 'neutral')}
        />
        <span className={styles.greyText}>(neutral)</span>
      </label>
      <br />
      <label>
        <input
          type="radio"
          checked={freshAfter === 'fatigued'}
          onChange={() => setReport('page2', 'freshAfter', 'fatigued')}
        />
        I feel cognitively fatigued
      </label>
      <br />
      <br />
      <div>
        <br />
        <button onClick={() => props.setPage(prev => prev - 1)}>Back</button>
        <button onClick={() => props.setPage(prev => prev + 1)}>Next</button>
      </div>
    </div>
  );
};

export default Page2;
