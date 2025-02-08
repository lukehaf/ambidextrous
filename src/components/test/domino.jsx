import React, { useState, useRef } from 'react';
import useStore from '../../store/index.js'; // Zustand store
import { initializeRemainderString, handleKeyDown, useDominoFocus, useCaretAtEnd } from './domino_logic.jsx';

function Domino(props) {
  // dominoPointer subsets `presentables` & `results`, & contains display state. // hook the correct dominoPointer: if props exist, this domino's a recall-domino, and subset for the correct one. Else, hook the echo_dominoPointer.
  const dominoPointer = useStore((state) => props ? state.testSlice.currentScreen.recall_dominoPointers[props.pairIndex][props.leftOrRight] : state.testSlice.currentScreen.echo_dominoPointer);

  // useState() is a react hook for managing state locally (within the component). Helps unclutter the Zustand store.
  const [remainderString, setRemainderString] = useState(initializeRemainderString(dominoPointer)); // remainderString is what users have left to type. It's an array of single-character-objects which get mapped into single-char <span> elements.
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
  // Outside handleKeyDown, though, first hook 3 additional Zustand setters (needed by handleKeyDown). (Hook best-practices: pass the RESULTS from hooks (such as a setter). Don't ever call hooks (eg useStore()) INSIDE a helper function. Only call them inside the react component itself, or inside a custom hook which is itself inside the react component.)
  const { submitBad, setCorrect, updateDominoResetKey } = useStore((state) => ({ submitBad: state.testSlice.submitBad, setCorrect: state.testSlice.setCorrect, updateDominoResetKey: state.testSlice.updateDominoResetKey }));
  const boundHandleKeyDown = (e) => handleKeyDown(e, { remainderString, setRemainderString, userEntry, setUserEntry }, { targetLength, firstSpace, wrongChar }, dominoPointer.echoOrRecall, { submitBad, setCorrect, updateDominoResetKey }); // this boundHandleKeyDown wrapper cleans up the JSX (by keeping all these arguments out of it)

  // for focus & for placing caret. // begins null; points to the DOM object once it exists
  const dominoRef = useRef(null);

  // a custom hook I made, for handling focus
  useDominoFocus(dominoRef,
    dominoPointer.echoOrRecall, // echo has one domino, which auto-focuses.
    dominoPointer.focused, // recall has multiple dominoes, only one of which has focused === true. (focused === null or undefined for echo.)
  );

  // Another custom hook: automatically place caret at the end of the userEntry string (on mount and when userEntry changes). (It's a hook bc it also contains useEffect(), listening for userEntry as a dependency.)
  useCaretAtEnd(dominoRef, userEntry);

  // return a contentEditable, containing: (remainderString in grey) to the right of (userEntry in black, occasionally red-highlighted).
  return (
    <div
      ref={dominoRef} // so useDominoFocus can programmatically focus this div
      tabIndex={0} // Make div programmatically focusable
      contentEditable={true}
      suppressContentEditableWarning={true} // React isn't designed to manage contentEditable elements safely, and gives a warning. Don't disable this warning unless you're confident you're manually handling all updates to the DOM in the contentEditable area (including user input), & disabling the contentEditable div's desire to display its own stuff, & explicitly only showing letters which are from the react state.
      onKeyDown={boundHandleKeyDown}
      onMouseDown={(e) => e.preventDefault()} // Prevents cursor placement via mouse clicks
      style={{
        outline: '1px solid black',
        width: '400px', // domino width
        height: '40px',
        display: 'flex',
        alignItems: 'center', // vertically centered, rather than stretched (the default). align works on the cross axis.
        flexWrap: 'nowrap', // this is the default for flexboxes; it's just here to remind me
        overflow: 'hidden', // prevents "multiline overflow." Keeps stuff from extending outside box.
        padding: '5px',
        fontSize: '16px',
        fontFamily: 'monospace',
        cursor: 'text',
      }}
    >
      {/* Next block is the userEntry string. Put it all in a span, so the cursor knows to always be on the first span. */}
      <span>
        {userEntry.map((t, index) => ( // iterate over the array & return a new array (of <span> react elements). // For each element in the array (t), the map function executes the code inside the arrow function (t, index) => ( ... )
          <span
            key={index} // The key prop is required by React when rendering lists to uniquely identify each element. // Additional use (not going on here): incrementing key, so React thinks it's a different key, & rerenders it/resets its state.
            style={{
              backgroundColor: t.backgroundColor,
              padding: '0px',
              margin: '0 1px',
            }}
          >
            {t.char}
          </span>
        ))}
      </span>

      {/* if wrongChar === true, forevermore conditionally render a single space span, between the two strings. */}
      {/* Using &nbsp; ensures a non-breaking space is explicitly rendered. (otherwise a lone space character will get ignored by browsers). Another potential solution: style={{ display: 'inlineBlock' }} for spans means their width doesn't get ignored. */}
      {wrongChar.current === true && <span>&nbsp;</span>}

      {/* Next block is the grey remainderString */}

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
