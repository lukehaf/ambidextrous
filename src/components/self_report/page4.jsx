// self_report/page4.jsx
import React from 'react';
import useStore from '../../store';
import styles from '../welcome/welcome.module.scss';

const Page4 = (props) => {
  const { heardAboutStudy, otherSourceText, name } = useStore((state) => state.reportSlice.page4);
  const setReport = useStore((state) => state.reportSlice.setReport);
  const nextScreen = useStore((state) => state.welcomeSlice.nextScreen);
  const submitSurvey = useStore((state) => state.reportSlice.submitSurvey);
  return (
    <div className={styles.container}>
      <h2 className={styles.subtitle}>Questionnaire (page 4/4)</h2>
      <div className={styles.prompt}>How did you hear about this study?</div>
      <p className={styles.greyText} style={{ marginTop: -20 }}>
        (This question could help investigate potential differences between the following groups.)
      </p>
      <label>
        <input
          type="radio"
          checked={heardAboutStudy === 'flierBathroom'}
          onChange={() => setReport('page4', 'heardAboutStudy', 'flierBathroom')}
        />
        A flier, posted on campus at Dartmouth College. (In a bathroom stall)
      </label>
      <br />
      <label>
        <input
          type="radio"
          checked={heardAboutStudy === 'flierElsewhere'}
          onChange={() => setReport('page4', 'heardAboutStudy', 'flierElsewhere')}
        />
        A flier, posted on campus at Dartmouth College. (Elsewhere)
      </label>
      <br />
      <label>
        <input
          type="radio"
          checked={heardAboutStudy === 'friend'}
          onChange={() => setReport('page4', 'heardAboutStudy', 'friend')}
        />
        I am friends with the author, and heard about it from him.
      </label>
      <br />
      <label>
        <input
          type="radio"
          checked={heardAboutStudy === 'family'}
          onChange={() => setReport('page4', 'heardAboutStudy', 'family')}
        />
        The author (Luke) is one of my family members.
      </label>
      <br />
      <label>
        <input
          type="radio"
          checked={heardAboutStudy === 'Drew'}
          onChange={() => setReport('page4', 'heardAboutStudy', 'Drew')}
        />
        Drew Coomb's email (QSS listserve)
      </label>
      <br />
      <label>
        <input
          type="radio"
          checked={heardAboutStudy === 'Gig'}
          onChange={() => setReport('page4', 'heardAboutStudy', 'Gig')}
        />
        Gig Faux's email (Working Group on Misinformation & Memory Errors)
      </label>
      <br />
      <label>
        <input
          type="radio"
          checked={heardAboutStudy === 'other'}
          onChange={() => setReport('page4', 'heardAboutStudy', 'other')}
        />
        <span>Other </span>
        <input
          type="text"
          placeholder="(please specify)"
          value={otherSourceText || ''}
          onChange={(e) => setReport('page4', 'otherSourceText', e.target.value)}
          style={{ width: '200px' }}
        />
      </label>
      <br />
      <br />
      <div className={styles.prompt}>Would you like to enter your name?</div>
      <p className={styles.greyText} style={{ marginTop: -20 }}>
        (Only for if you know the author, and don't mind me seeing the scores;
        <br />
        this helps me build my intuition for relevant personality traits, and whether
        <br />
        some personality traits might be connected to interconnected vs on-topic thinking.)
      </p>
      <label>
        <input
          type="text"
          placeholder="(optional)"
          value={name || ''}
          onChange={(e) => setReport('page4', 'name', e.target.value)}
          style={{ width: '200px' }}
        />
      </label>
      <div>
        <br />
        <button onClick={() => props.setPage(prev => prev - 1)}>Back</button>
        <button onClick={() => {
          nextScreen('SafeToExit');
          submitSurvey();
        }}
        >Submit & go to results
        </button>
      </div>

    </div>
  );
};

export default Page4;
