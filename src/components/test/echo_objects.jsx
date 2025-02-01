import React from 'react';
import useStore from '../../store';
import styles from './progress_bar.module.scss';

import Domino from './domino.jsx';

// objects-pair timebar is purple, slower, with a varying duration (specified for each object-pair),
// so that participants spend sufficient time with each story. They can type as slowly as they like.

const story = useStore(({ testSlice }) => testSlice.targetPairs.objects[oneOrTwo][pairIndex].storyText); // have the red squigglies listen to the zustand store, to some state thing like whichFocus (but that's for the dominoStack)
const animationDuration = useStore(({ testSlice }) => testSlice.targetPairs.objects[oneOrTwo][pairIndex].storyTime); // this should maybe be specific to the story's wordcount. It comes from the zustand store
// const pairIndex
// Just pairIndex is needed. (No need to also have scrambledPairIndex.) echo_objects.jsx is the only file which needs to present pairs in a novel order.
// but echo_objects.jsx doesn't even need to know the order!! the similar-to-whichFocus state in the Zustand store handles the order, and will move the current pairIndex state (in the zustand store, probably not even necessary as props so much) through the proper order: 02413.

const CustomProgressBar = () => {
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar_objects} style={{ animationDuration: `${animationDuration}s` }} />
    </div>
  );
};
////////////////////////////////
// PROPS STUFF: I still need to update echo_objects so that it passes <Domino /> all the required props.

const EchoObjects = () => {
  const dominoResetKey = useStore(({ testSlice }) => testSlice.dominoResetKey); // here's LUKE'S key, from the zustand store. when this key changes it triggers a domino rerender, since it's placed here on the domino component.
  return (
    <div key={dominoResetKey}>
      <p>${story}</p>
      <CustomProgressBar />
      {/* Delay EchoNames's appearance until once the progressbar finishes. */}
      <div className={styles.delayDomino} style={{ animationDelay: `${animationDuration - 2}s` }}>
        <Domino />
      </div>
    </div>
  );
};

export default EchoObjects;
