// general_instructions.jsx
import React from 'react';
import useStore from '../../store';
import styles from '../welcome/welcome.module.scss';

export const GeneralInstructionsText = () => {
  return (
    <div>
      <h2 className={styles.subtitle}>General Instructions: What does participation involve?</h2>
      <p>There is a memorization phase which involves “echoing back” (typing) several pairs of words that are shown onscreen. Secondly, there is a recall-phase where participants’ recall of these pairs of words is assessed. </p>
      <p>
        <b>Two Strategies:</b>
        <br />
        The memory test provides two strategies for memorizing pairs of words, and you will have a chance to try both strategies. The first strategy is repetition, and is applied to name-pairs from a list of first names. This is similar to using flashcards, and the names are learned through repeated exposure & feedback, rather than coming up with any specific reason for why two names go together. You are encouraged to relax into the flow of learning the names at the (comfortable) provided pace, and to save any preference for “coming up with linking reasons” for the objects-test, which uses this alternative strategy.
      </p>
      <p>The second strategy involves “coming up with reasons” which link two words, and which help them be recalled as a pair. This strategy is utilized on the part of the test which has you memorize pairs of objects from a zen garden/arboretum type of scene, providing a one or two sentence “cue” involving the two objects to be memorized. You will have a chance to imagine and reflect on this scene for several seconds, in order to link this pair of objects in their memory. You will then get to “echo back” and practice typing the pair like you did for the pairs of names.</p>
      <p>
        <b>Arrangement of the test: quarters and eighths</b>
        <br />
        You will learn 6 names at a time, as overlapping pairs. The names are in a helpful order. You will also learn 6 objects at a time, but the objects are not in a helpful order; their order is "scrambled" compared to the order in which you will have to recall them. Instead, you should try to memorize the objects using the linking scenes which are provided. The test is divided in quarters, where each quarter involves both an "echo" and "recall" phase for a list of six words. The quarters of the test will be arranged differently for some participants, such as in this arrangement: Objects1 Objects 2, then Names1 Names2. Finally, each quarter has both an "echo" and "recall" phase, which explains why the test is in eighths.
      </p>
      <p>After the test, there will be several multiple-choice questions and then a results screen. I would recommend taking a photo of your scores. This documents your completion of the study, and could also encourage some friendly competition (for if you have a friend who is taking the test as well!)</p>
    </div>
  );
};

export const GeneralInstructions = () => {
  const nextScreen = useStore(({ testSlice }) => testSlice.nextScreen);
  return (
    <div className={styles.container}>
      <GeneralInstructionsText />
      { /* NextScreen button */}
      <button onClick={nextScreen} className={styles.navButton}>Next Screen</button>
    </div>
  );
};
