import React, { useEffect, useState } from 'react';
import useStore from '../../store/index.js';
import styles from './domino_stack.module.scss';

import TestInput from './test_input.jsx';

const DominoStack = () => {
  const dominoStackHeight = useStore((state) => state.testSlice.dominoStackHeight);
  const dominoStackResults = useStore((state) => state.testSlice.dominoStackResults);
  const [isReady, setIsReady] = useState(false); // Local state to track readiness. useState is NOT synchronous; it waits for the next render cycle.

  // on mount, initialize this part of the store:
  const initializeDominoStack = useStore((state) => state.testSlice.initializeDominoStack);
  useEffect(() => {
    initializeDominoStack();
    // Delay rendering until the next render cycle
    setIsReady(true);
  }, []);

  // 1st render cycle: zustand store is still initializing. 2nd render cycle it's done, and the setIsReady(true) has landed too.
  if (!isReady) {
    return <div>Loading...</div>; // Render a loading state
  }

  return (
    <div className={styles.dominoStack}>
      {Array.from({ length: dominoStackHeight }).map((_, pairIndex) => ( // usually, dominoes get their pairIndex from the store. However, the dominoStack generates its dominoes' pairIndices from the map function, which then correspond with pairIndices in the store.
        <div key={pairIndex} className={styles.dominoPair}>
          <TestInput
            key={`left-${dominoStackResults[pairIndex].leftHalf.wrongSubmissions.length}`} // this resolves to `left-0`, `left-1`, etc, depending on which attempt this is
            pairIndex={pairIndex} // the store doesn't know this. There are multiple dominoes onscreen at once!
            leftOrRightHalf="leftHalf" // the store doesn't know this.
          />
          <TestInput
            key={`right-${dominoStackResults[pairIndex].rightHalf.wrongSubmissions.length}`}
            pairIndex={pairIndex}
            leftOrRightHalf="rightHalf"
          />
        </div>
      ))}
      {/* key is internal to react and isn't available as a prop. Keys must be unique. They're required for mapping lists (outer use). They can also be incremented to reset component state (inner use). */}
      {/* Placeholder for progressbar */}
    </div>
  );
};

export default DominoStack;

////////////////////////////////////////////////////////////////////////////////
// ok cool! Now each domino listens to zustand's "whichFocus", the reset keys work, & the flexbox-arranging is done.
////////////////////////////////////////////////////////////////////////////////////
// next, replace TestInput with the polymorphic domino (which has all of the grading logic), with WHICHHALF PASSED AS A PROP, like I'm currently doing for test_input.

// here's the polymorphic reset logic, for the left vs right half:

// the left halves need a reset key for backspaces. Add these submissions to the wrongSubmissions. (make this an array of 2-entry objects: submissionKey (backspace vs space), as well as the entry.)
// // a correct space-submission breaks the loop, and doesn't reset.
// // so, the key should just be wrongSubmissions.length, after the new entry gets pushed. No need for a separate object.

// Right halves Also need a reset key for backspaces. (People can backspace to clear. the wrongEntry gets submitted.)
// // Right half's wrongSubmissions can also be an array of objects. Both spacebar & backspace submissions can be wrong, and should get added to the array.
// // it's just that for wrongSubmissions, for the right, a spacebar submission (wrong) doesn't trigger the reset. (that's different from leftHalf, so provide whichHalf as an argument)

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

//
///////////////////////////////////////////////////////////////////////////////////////

// Everything below depends on the "was it correct" domino logic
// fading the contents of a prior domino, via a css transition: see notion for the logic.
// // Why a css transition? Don't clear the cell; it was correct. Just fade it out/hide it.

// css: make red block appear for incorrect right-half submissions.
// css: make IDK button appear for really-long-waits, when the timebar has asymptotically approached it's 1/3rd size.
// no checkmarks/red xs, for recall.

//
//
//
//
//
//
//
//
//

////////////////////////////////////////////////////////////////////////////////////////////////////
// Make the whole-screen transitions (a fade in & out per screen, and which provides a delay before the progressbar starts moving. The delay is also when you can flash red the names bar to indicate they weren't typing quickly enough. & maybe have a red x temporarily replace the 2 checkmarks. For recall, it could flash red as a "wrong" indicator on submit. Same for spacebar submit on echo. For backspace on echo, they already saw red, so no need.)
// make sure the final time (from the progressbar) is also being grabbed & submitted, for each of the 3 wrappers.
// // when the space bar gets pressed: start over the stopwatch/counter of “seconds elapsed between spacebar presses” to the hundredth of a second. Display this counter onscreen as a static timestamp only after they press the spacebar.
// next I'll make 2 versions of the 3 wrappers: an intro/walkthrough version w extra text, and secondly the store-connected version which iterates through a whole array.
// write all the stories into a state slice, so they can get passed in to echo_objects.
// then I have all the screens & content, and am ready to link together the progressing-through-the-test logic. I think it's better to pass a single thing to the screen component, rather than passing the whole list & having the screen component handle local state of which has been done. Keep that all in the store; just pass the screen component a single pair of objects and their story, etc.
// finally, refine the instructional screens (all conditionally rendered in the `Test` component).

// FINAL TASK IS GOING THROUGH NOTION TO VERIFY WHETHER I'VE MET ALL THOSE CRITERIA.
////////////////////////////////////////////////////////////////////////////////////////////////////
