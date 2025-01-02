import React from 'react';
import styles from './study_info.module.scss';

const StudyInfo = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Study Summary</h1>
      <p className={styles.paragraph}>
        This study investigates two hypothesized memory traits, via a custom-designed memory test (linked below). The study will contribute to the existing literature on memory, and specifically about how different people benefit from using different memory strategies.
      </p>
      <p className={styles.paragraph}>
        The memory test is all online, and takes at most 30 minutes to complete. There is a listening phase which involves “echoing back” (typing) several pairs of words that are shown onscreen & played via audio. Secondly, there is a recall-phase where participants’ recall of these pairs of words is assessed. Compensation is approximately $20 (via Venmo) upon completion of the study, with an incentive for higher accuracy & fast response times (described below).
      </p>
      <p className={styles.paragraph}>
        Please feel free to contact me at <a href="mailto:Luke.D.Hafermann.25@Dartmouth.edu">Luke.D.Hafermann.25@Dartmouth.edu</a> if you have further questions about the study not covered here on this informational page.
      </p>

      <h2 className={styles.subheader}>What does participation involve?</h2>
      <p className={styles.paragraph}>
        The memory test provides two strategies for memorizing pairs of words, and participants will have a chance to try both strategies. The first strategy is repetition, and is applied to name-pairs from a list of first names. This is similar to using flashcards, and the names are learned through repeated exposure & feedback, rather than coming up with any specific reason for why two names go together. Participants are encouraged to relax into the flow of learning the names at the (comfortable) provided pace, and to save any preference for “coming up with linking reasons” for the objects-test, which uses this alternative strategy.
      </p>
      <p className={styles.paragraph}>
        The second strategy involves “coming up with reasons” which link two words, and which help remember them as a pair. This strategy is utilized on the part of the test which has participants memorize pairs of objects from a zen garden/arboretum type of scene, providing a one or two sentence “cue” involving the two objects to be memorized. Participants will have a chance to imagine and reflect on this scene for several seconds, in order to link this pair of objects in their memory. Participants will then get to “echo back” and practice the objects-pair like they did for the pairs of names.
      </p>

      <h2 className={styles.subheader}>What kinds of data does this study collect?</h2>
      <p className={styles.paragraph}>
        The memory test involves no sensitive information about participants. The only data recorded are participants’ timing and accuracy, gathered while they memorize & recite (via typing) pairs of words. Participants also enter their DartmouthID (which doubles as an email address in the Dartmouth email system), so that a compensation link can be emailed to them.
      </p>

      <h2 className={styles.subheader}>Are there any risks involved in this study?</h2>
      <p className={styles.paragraph}>
        There are no potential risks to participants during participation, and the 2 tests gather no sensitive information.
      </p>

      <h2 className={styles.subheader}>Will you be paid to take part in this study?</h2>
      <p className={styles.paragraph}>
        Participants will be compensated with an average of $20, via Venmo. Participants are assured of receiving at least $10 and at most $30, depending on their performance on the two tests. This payment structure is designed to incentivize full effort, and rewards accuracy & timing on the recall-task.
      </p>

      <h2 className={styles.subheader}>Consent</h2>
      <p className={styles.paragraph}>
        I have read the above information about the “Memory Test of Order-Linking & Similarity-Linking”, and have been given time to reflect and reach out with any questions. By clicking the “I agree” button, this is taken as documentation of my consent to proceed with this study.
      </p>
      <p className={styles.paragraph}>Thank you for participating, and I hope you find the test interesting & enjoyable!</p>
    </div>
  );
};

export default StudyInfo;
