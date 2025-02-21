import React, { useState, useRef } from 'react';
import useStore from '../../store/index.js'; // Zustand store
import { initializeRemainderString, handleKeyDown, useDominoFocus, useCaretAtEnd } from './domino_logic.jsx';
import styles from './domino_stack.module.scss';

function Domino(props) {
  // dominoPointer subsets `presentables` & `results`, & contains display state. // hook the correct dominoPointer: if props exist, this domino's a recall-domino, and subset for the correct one. Else, hook the echo_dominoPointer. Note that React sets props as {} if not passed (which is truthy), so you have to check whether one of props' PROPERTIES is truthy. NOT the pairIndex, which is sometimes 0 (falsy).
  const dominoPointer = useStore((state) => props.leftOrRight ? state.testSlice.currentScreen.recall_dominoPointers[props.pairIndex][props.leftOrRight] : state.testSlice.currentScreen.echo_dominoPointer);
  // Targetpair is required by initializeRemainderString() (which cannot hook the store itself, since it's not a react component or custom hook).
  const targetPair = useStore((state) => state.testSlice.presentables.targetPairs[dominoPointer.namesOrObjects][dominoPointer.listHalf][dominoPointer.pairIndex]); // targetPair also includes a storyText and a storyTime, if it's for an objects-list. Unused, here.

  // useState() is a react hook for managing state locally (within the component). Helps unclutter the Zustand store.
  const [remainderString, setRemainderString] = useState(initializeRemainderString(targetPair, dominoPointer)); // remainderString is what users have left to type. It's an array of single-character-objects which get mapped into single-char <span> elements.
  const [userEntry, setUserEntry] = useState([]); // initialize userEntry with an empty array; they haven't typed anything yet.

  // Changing a ref does not trigger a re-render. This means refs are perfect for storing information that doesn’t affect the visual output of your component.
  // useRef vs useState: useRef's great here bc it's synchronous, and lets wrongChar get detected AND USED within the same render cycle.
  // useRef vs local variable: useRef's value isn't destroyed each render cycle, whereas local variables get reinitialed each render back to their initial values.

  // these refs are only used inside handleKeyDown, but need to be declared at the component level (so that they persist across function calls)
  const targetLength = useRef(remainderString.length); // correct submissions have to be targetLength long. // targetLength initializes off the first remainderString render & is ready for the 2nd render.
  const firstSpace = useRef(false); // firstSpace becomes true in order to track whether they've pressed the spacebar a first time yet
  const wrongChar = useRef(false); // wrongChar === false means no typing-mistakes have been made. (Typing-mistakes include both wrong characters & exceeding the length of the targetString).
  //                               // wrongChar is actually used both inside handleKeyDown & in Domino (to conditionally render a space).

  // handleKeyDown: modify remainderString & userEntry; handle backspace & space (for reset & submit behaviors).
  // Outside handleKeyDown, though, first hook 2 additional Zustand setters (needed by handleKeyDown). (Hook best-practices: pass the RESULTS from hooks (such as a setter). Don't ever call hooks (eg useStore()) INSIDE a helper function. Only call them inside the react component itself, or inside a custom hook which is itself inside the react component.)
  const submitBad = useStore((state) => state.testSlice.submitBad); // problem: I tried to combine them into one, but it returned an object literal (a new object) rather than a ref to the one in state; this broke the hook's memoization capability. const { submitBad, setCorrect } = useStore((state) => ({submitBad: state.testSlice.submitBad, setCorrect: state.testSlice.setCorrect, }));
  const setCorrect = useStore((state) => state.testSlice.setCorrect);

  const boundHandleKeyDown = (e) => handleKeyDown(e, { remainderString, setRemainderString, userEntry, setUserEntry }, { targetLength, firstSpace, wrongChar }, dominoPointer.echoOrRecall, { submitBad, setCorrect }); // this boundHandleKeyDown wrapper cleans up the JSX (by keeping all these arguments out of it)

  // for focus & for placing caret. // begins null; points to the DOM object once it exists
  const dominoRef = useRef(null);

  // a custom hook I made, for handling initial focus (and centrally-managed whichFocus changes, for Recall)
  useDominoFocus(dominoPointer.echoOrRecall, // echo has one domino, which auto-focuses. Recall has 10 dominoes.
    dominoPointer.focused, dominoRef, props.dominoRefToFocus); // One of the recall dominoes has focused === true, in which case its dominoRef is passed to the centralized focus manager. (focused === undefined for echo; the key doesn't exist.)

  // Handle blur events by restoring focus. Either to this (single) Domino for echo, or using the central logic (if recall).
  const [blurCount, setBlurCount] = useState(0); // so that useCaretAtEnd runs whenever handleBlur does
  const handleBlur = () => { // Blur events are when the user tries to click elsewhere, and move the cursor elsewhere.
    setTimeout(() => { // Using setTimeout ensures that the blur event completes before restoring focus.
      if (dominoPointer.echoOrRecall === 'echo' && dominoRef.current) {
        dominoRef.current.focus();
      }
      else if (dominoPointer.echoOrRecall === 'recall') {
        props.restoreFocus();
      };
      setBlurCount((prev) => prev + 1); // Increment blurCount each blur event
    }, 0);
  };

  // Another custom hook: automatically place caret at the end of the userEntry string. (It's a hook bc it also contains useEffect(), listening for userEntry as a dependency.)
  useCaretAtEnd(dominoRef, userEntry, blurCount, //  (on mount, when userEntry changes, and whenever handleBlur fires).
    dominoPointer.echoOrRecall, dominoPointer.focused); // (Only when the domino's focused).

  // Conditionally hide the grey remainderString & linting (for recall dominoes, if their leftOrRight === 'rightHalf' && thisPairIsReinforcement === false). (&& returns a boolean.) Echo dominoes don't have either of those keys, so they'll return values of 'undefined', which makes the && return false. Good.
  // hideGreyRed's a local variable. It'll be created anew each render cycle, derived from values in dominoPointer. That's fine.
  const hideGreyRed = (dominoPointer.leftOrRight === 'rightHalf' && dominoPointer.thisPairNeedsReinforcement === false);
  // Note: it's also important to hide a whole pair, as pairIndex progresses. That's handled by props.hidePair.

  // return a contentEditable, containing: (remainderString in grey) to the right of (userEntry in black, occasionally red-highlighted).
  return (
    <div
      ref={dominoRef} // so useDominoFocus can programmatically focus this div
      tabIndex={-1} // Make div only focusable programmatically
      contentEditable={true}
      suppressContentEditableWarning={true} // React isn't designed to manage contentEditable elements safely, and gives a warning. Don't disable this warning unless you're confident you're manually handling all updates to the DOM in the contentEditable area (including user input), & disabling the contentEditable div's desire to display its own stuff, & explicitly only showing letters which are from the react state.
      onKeyDown={boundHandleKeyDown} // this gives the REFERENCE to the function. Otherwise, onKeyDown={boundHandleKeyDown()} immediately evaluates the function, and doesn't respond to future onKeyDown events.
      onBlur={handleBlur}
      onMouseDown={(e) => e.preventDefault()} // Prevents cursor placement via mouse clicks. Doesn't extend outside the Recall element, though, hence the need for handleBlur within the Domino.
      className={styles.domino}
    >
      {/* Conditionally render the domino's contents, depending on props.hidePair (just show the contents of the currently focused pair and the preceding pair). */}
      {!props.hidePair && (
        <span>
          {/* This block is the userEntry string. Put it all in a span, because the cursor-logic involves always being within the first span of the first span. */}
          <span>
            {userEntry.map((t, index) => ( // iterate over the array & return a new array (of <span> react elements). // For each element in the array (t), the map function executes the code inside the arrow function (t, index) => ( ... )
              <span
                key={index} // The key prop is required by React when rendering lists to uniquely identify each element. // Additional use (not going on here): incrementing key, so React thinks it's a different key, & rerenders it/resets its state.
                style={{
                  backgroundColor: hideGreyRed ? undefined : t.backgroundColor, // for rightHalf dominoes (preIDK), don't assign the red linting, even if they typed incorrectly.
                  padding: '0px',
                  margin: '0 1px',
                }}
              >
                {t.char}
              </span>
            ))}
          </span>

          {!hideGreyRed && (
            <span>
              {/* Next block is the nbsp + remainderString, rendered conditionally. (Hide them if hideGreyRed === true.) */}
              {/* if wrongChar === true, forevermore conditionally render a single space span, between the two strings. */}
              {/* Using &nbsp; ensures a non-breaking space is explicitly rendered. (otherwise a lone space character will get ignored by browsers). Another potential solution: style={{ display: 'inlineBlock' }} for spans means their width doesn't get ignored. */}
              {wrongChar.current === true && <span>&nbsp;</span>}

              {/* Next block is the grey remainderString. */}
              {remainderString.map((t, index) => (
                <span
                  key={index}
                  style={{
                    padding: '0px', // padding grows the element; margin adds space between elements.
                    margin: '0 1px', // 0 pixels vertical margin, 1 pixel horizontal margin
                    color: 'grey',
                  }}
                >
                  {t.char}
                </span>
              ))}
            </span>
          )}
        </span>
      )}
    </div>
  );
}

export default Domino;

////////////////////////////////////////////////////////////////////
// // The scrollToEnd function ensures the container scrolls to the latest character as the user types.

// import React, { useRef, useState } from 'react';
//
// const scrollToEnd = () => {
//   const container = containerRef.current;
//   if (container) {
//     container.scrollLeft = container.scrollWidth; // Scroll to the end
//   }
// };

// React.useEffect(scrollToEnd, [text]); // Scroll whenever text changes

// return (
//   <div
//     ref={containerRef}
////////////////////////////////////////////////////////////////////
