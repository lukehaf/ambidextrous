// outro.jsx.
import React from 'react';
import useStore from '../../store';
import styles from '../welcome/welcome.module.scss';

const Outro = () => {
  const submitResults = useStore((state) => state.testSlice.submitResults);
  const nextScreen = useStore(({ welcomeSlice }) => welcomeSlice.nextScreen);
  return (
    <div className={styles.container} style={{ textAlign: 'center' }}>
      <h2 className={styles.prompt}>Short Questionnaire (roughly two minutes)</h2>
      <button onClick={() => {
        submitResults();
        nextScreen('Questionnaire');
      }}
      >proceed to questionnaire
      </button>
    </div>
  );
};

export default Outro;
