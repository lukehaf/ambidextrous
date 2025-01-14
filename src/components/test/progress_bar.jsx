import React from 'react';
import styles from './progress_bar.module.scss';

const animationDuration = 7; // this should maybe be specific to the story's wordcount

const CustomProgressBar = () => {
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar_purple} style={{ animationDuration: `${animationDuration}s` }} />
    </div>
  );
};

export default CustomProgressBar;
