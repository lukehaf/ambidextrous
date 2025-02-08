import React from 'react';
// import { useEffect, useState } from 'react';
import useStore from '../../store/index.js';
import styles from './domino_stack.module.scss';

import Domino from './domino.jsx';

const Recall = () => {
  const stackResetKey = useStore((state) => state.testSlice.currentScreen.recallPointer.stackResetKey); // reset key for the whole DominoStack, for when "lap" changes. (since each domino's targetString & userEntry needs to get reinitialized/wiped clean.)
  const dominoResetKeys = useStore((state) => state.testSlice.currentScreen.recallPointer.dominoResetKeys);
  const dominoStackHeight = useStore((state) => state.testSlice.currentScreen.recallPointer.dominoStackHeight);

  // const [isReady, setIsReady] = useState(false); // Local state to track readiness. useState is NOT synchronous; it waits for the next render cycle.
  // // on mount, initialize this part of the store:
  // const initializeDominoStack = useStore((state) => state.testSlice.initializeDominoStack);
  // useEffect(() => {
  //   initializeDominoStack();
  //   // Delay rendering until the next render cycle
  //   setIsReady(true);
  // }, []);
  // // 1st render cycle: zustand store is still initializing. 2nd render cycle it's done, and the setIsReady(true) has landed too.
  // if (!isReady) {
  //   return <div>Loading...</div>; // Render a loading state
  // }

  ///////////////////////////////////////////////////////

  return (
    <div key={stackResetKey} className={styles.dominoStack}>
      {Array.from({ length: dominoStackHeight }).map((_, pairIndex) => ( // these dominoes get their pairIndices generated by map() and are passed them as a prop.
        <div key={pairIndex} className={styles.dominoPair}>
          {/* Keys must be unique. They're required for mapping lists in React. They can also be incremented to reset component state (like the innermost key and outermost key, here). Key is internal to react and isn't available as a prop. */}
          <Domino
            key={dominoResetKeys[pairIndex].leftHalf}
            pairIndex={pairIndex} // There are multiple dominoes onscreen at once, so they need 2 props to access the correct currentScreen dominoPointer in the store.
            leftOrRightHalf="leftHalf"
          />
          <Domino
            key={dominoResetKeys[pairIndex].rightHalf}
            pairIndex={pairIndex}
            leftOrRightHalf="rightHalf"
          />
        </div>
      ))}
      {/* Placeholder for progressbar */}
    </div>
  );
};

export default Recall;
