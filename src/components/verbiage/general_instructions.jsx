// general_instructions.jsx
import React from 'react';
import styles from '../welcome/study_info.module.scss';

const GeneralInstructions = () => {
  return (
    <div>
      <h2 className={styles.subheader}>What does participation involve?</h2>
      <p className={styles.paragraph}>
        The memory test provides two strategies for memorizing pairs of words, and you will have a chance to try both strategies. The first strategy is repetition, and is applied to name-pairs from a list of first names. This is similar to using flashcards, and the names are learned through repeated exposure & feedback, rather than coming up with any specific reason for why two names go together. You are encouraged to relax into the flow of learning the names at the (comfortable) provided pace, and to save any preference for “coming up with linking reasons” for the objects-test, which uses this alternative strategy.
      </p>
      <p className={styles.paragraph}>
        The second strategy involves “coming up with reasons” which link two words, and which help remember them as a pair. This strategy is utilized on the part of the test which has you memorize pairs of objects from a zen garden/arboretum type of scene, providing a one or two sentence “cue” involving the two objects to be memorized. You will have a chance to imagine and reflect on this scene for several seconds, in order to link this pair of objects in their memory. You will then get to “echo back” and practice the objects-pair like you did for the pairs of names.
      </p>
      <p className={styles.paragraph}>
        You will learn 6 names at a time, as overlapping pairs. The names are in a helpful order. You will also learn 6 objects at a time, but the objects are not in a helpful order; you should try to rely on the linking scenes, when it’s time to recall the pairs of objects. This is repeated for another 6 names and another 6 objects, and then the test is complete. The test is divided in quarters. The quarters will be arranged differently for some participants, such as in this arrangement: Objects1 Objects 2, then Names1 Names2.
      </p>
      <p className={styles.paragraph}>
        The recall-task is the most important, from the perspective of collecting data on your timing and accuracy. If you would like to participate, your effort, honesty, and generosity in signing up for this study are most appreciated, and are what this study’s contribution to the memory-literature depends on.
      </p>
      <p className={styles.paragraph}>
        Pausing the test is possible during the learning phases, but not during the brief (timed) recall phases, which assess accuracy and timing. Refreshing the page has been disabled, since this would lose participants’ progress.
      </p>
      <p className={styles.paragraph}>
        In the event that you are interested to save your scores please take a photo of the results screen.
      </p>

    </div>
  );
};

export default GeneralInstructions;
