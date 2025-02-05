import React, { useState, useRef, useEffect } from 'react';
import useStore from '../../store/index.js'; // Zustand store
import { initializeRemainderString, handleKeyDown } from './domino_logic.jsx';

function Domino(props) {
  const dominoPointer = useStore((state) => state.testSlice.currentScreen.dominoPointer); // dominoPointer subsets `presentables` & `results`, & contains display state. `Props` is auxiliary, and is passed into dominoes which reside in a dominoStack.
  const dominoPointer = useStore((state) => state.testSlice.currentScreen[props.echoOrRecall].dominoPointer); // no, it has to conditionally use props.echoOrRecall; they have diff structures.



  // useState() is a react hook for managing state locally (within the component). Helps unclutter the Zustand store.
  const [remainderString, setRemainderString] = useState(initializeRemainderString(dominoPointer, props)); // remainderString is what users have left to type. It's an array of single-character-objects which get mapped into single-char <span> elements.
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
  const boundHandleKeyDown = (e) => handleKeyDown(e, { remainderString, setRemainderString, userEntry, setUserEntry }, { targetLength, firstSpace, wrongChar }); // this boundHandleKeyDown wrapper cleans up the JSX (by keeping all these arguments out of it)

  // NEXT, CONTINUE CHECKING THAT ALL THE HANDLEKEYDOWN LOGIC WORKS, NOW THAT IT'S SILOED AWAY IN DOMINO_LOGIC.
  //////////////////////////////////////////////////////////
  // THEN, SEE IF I CAN TURN PLACECARETATEND INTO A FUNCTION, AND SIMILARLY SILO IT AWAY.
  const dominoRef = useRef(null); // WHAT'S THIS FOR? focus and placing caret.
  ///////////////////////////////////

  useEffect(() => {
    // Automatically focus the domino div on mount
    if (dominoRef.current) {
      dominoRef.current.focus();
    }
  }, []);

  // Automatically place caret at the end of the userEntry string (on mount and when userEntry changes).
  useEffect(() => {
    if (dominoRef.current) {
      placeCaretAtEnd(dominoRef.current);
    }
  }, [userEntry]); // Dependency-- listen for when userEntry changes

  // Function for keeping caret at end of userEntry string, as they type
  const placeCaretAtEnd = (dominoElement) => {
    if (!dominoElement) return;

    // To control the caret position programmatically, you interact with both the Selection and Range APIs.
    // The <Domino /> is available here as a "document"; each document has a unique "selection" state-object, which handles
    // where the caret's displayed & what's highlighted. To programmatically specify a selection, first you create a range, and then pass that to the selection.
    const range = document.createRange();
    const selection = window.getSelection();

    // Create a Range:
    // Identify the text node or element where the caret should go.
    // Use the Range API to set the exact start and end of the range (both at the same point for a collapsed caret (= nothing's highlighted/selected)).
    const firstChild = dominoElement.children[0]; // children includes only element nodes, ignoring text and comment nodes. The 0th child is thus the span containing all the userEntry char spans.

    if (firstChild) {
      const offset = firstChild.childNodes.length; // the offset is the number of single-char spans within the userEntry span, so the offset grows as the user types.
      range.setStart(firstChild, offset);
    }
    range.collapse(true); // Collapse to a single point (caret placement)

    // Update the Selection:
    // Get the current Selection object using window.getSelection(), and then clear any existing selections and apply the new range.
    selection.removeAllRanges();
    selection.addRange(range);
  };

  // show remainderString in grey, to the right of the userEntry.
  return (
    <div
      ref={dominoRef} // so useEffect can auto-focus this div on mount
      contentEditable={true} // Disables cursor placement by clicking. Enter & Tab are disabled. Only typing and backspace are supported.
      suppressContentEditableWarning={true} // React isn't designed to manage contentEditable elements safely, and gives a warning. Don't disable this warning unless you're confident you're manually handling all updates to the DOM in the contentEditable area (including user input), & disabling the contentEditable div's desire to display its own stuff, & explicitly only showing letters which are from the react state.
      tabIndex={0} // Make div programmatically focusable
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

// Here's some timer logic

// const [startTime, setStartTime] = useState(null); // useState(<initialize the state here>) is a react hook for managing local state, without cluttering the zustand store.

// // Set startTime when component first renders
// useEffect(() => {
//   setStartTime(Date.now());
// }, []); // Empty dependency array means it runs only once, on mount
