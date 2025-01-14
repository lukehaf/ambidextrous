import React, { useState, useRef, useEffect } from 'react';
import useStore from '../../store/index.js'; // Zustand store

function Domino() {
  const targetString = useStore(({ testSlice }) => testSlice.targetString); // targetString is what users have to type. It's an array of single characters with styles. //Each character is wrapped in a <span> with individual styles for color and background.
  const setWrongSubmission = useStore(({ testSlice }) => testSlice.setWrongSubmission);// submit userEntry to the store. (it'll only get submitted in the case where wrongChar = true upon submission, either due to space2 = true or backspace = true.
  //                                                                                 // also make a zustand setter to submit time, backspace or char, and maybe something else?
  const incrementDominoResetKey = useStore(({ testSlice }) => testSlice.incrementDominoResetKey);
  const setHasReceivedCorrectSubmission = useStore(({ testSlice }) => testSlice.setHasReceivedCorrectSubmission);

  // useState() is a react hook for managing state locally (within the component). Helps unclutter the Zustand store.
  const [remainderString, setRemainderString] = useState(
    targetString.split('').map((char) => ({ // initialize remainderString with targetString (except map it into a char array, important for rendering)
      char: char === ' ' ? '\u00A0' : char, // Replace space with non-breaking space. \u00A0 is the Unicode representation of a non-breaking space (&nbsp; in HTML).
    })),
  );
  const [userEntry, setUserEntry] = useState([]); // initialize userEntry with an empty array; they haven't typed anything yet

  // Changing a ref does not trigger a re-render. This means refs are perfect for storing information that doesn’t affect the visual output of your component.
  // useRef vs useState: useRef's great here bc it's synchronous, and lets wrongChar get detected AND USED within the same render cycle.
  // useRef vs local variable: useRef's value isn't destroyed each render cycle, whereas local variables get reinitialed each render back to their initial values.
  const firstSpace = useRef(false); // firstSpace becomes true in order to track whether they've pressed the spacebar a first time, yet
  const wrongChar = useRef(false); // wrongChar === false means no typing-mistakes have been made. (Typing-mistakes include both wrong characters & exceeding the length of the targetString).
  const dominoRef = useRef(null);

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
    const firstChild = dominoElement.children[0]; // children includes only element nodes, ignoring text and comment nodes.

    if (firstChild) {
      const offset = firstChild.childNodes.length;
      range.setStart(firstChild, offset);
    }
    range.collapse(true); // Collapse to a single point (caret placement)

    // Update the Selection:
    // Get the current Selection object using window.getSelection(), and then clear any existing selections and apply the new range.
    selection.removeAllRanges();
    selection.addRange(range);
  };

  // // Function for keeping caret at end of userEntry string, as they type
  // const placeCaretAtEnd = (dominoElement) => {
  //   if (!dominoElement) return;

  //   // To control the caret position programmatically, you interact with both the Selection and Range APIs.
  //   // The <Domino /> is available here as a "document"; each document has a unique "selection" state-object, which handles
  //   // where the caret's displayed & what's highlighted. To programmatically specify a selection, first you create a range, and then pass that to the selection.
  //   const range = document.createRange();
  //   const selection = window.getSelection();

  //   // Create a Range:
  //   // Identify the text node or element where the caret should go.
  //   // Use the Range API to set the exact start and end of the range (both at the same point for a collapsed caret (= nothing's highlighted/selected)).
  //   const firstChild = dominoElement.secondChild;

  //   if (firstChild) {
  //     const offset = firstChild.childNodes.length; // offset counts the <spans> in firstChild (the userEntry string)
  //     range.setStart(firstChild, offset); // sets the startpoint of the range to the firstChild element, at the calculated offset
  //   }
  //   else {
  //     range.setStart(dominoElement.firstChild, 0); // Empty userEntry
  //   }
  //   range.collapse(true); // Collapse to a single point (caret placement)

  //   // Update the Selection:
  //   // Get the current Selection object using window.getSelection(), and then clear any existing selections and apply the new range.
  //   selection.removeAllRanges();
  //   selection.addRange(range);
  // };

  // pre-submission logic: here’s how the strings change.
  const handleKeyDown = (e) => { // "e" is the event.
    // Prevent newlines and tabbing; prevent arrow keys from moving the caret
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      return;
    }

    // change "backspace" to include submit & reset behaviors
    else if (e.key === 'Backspace') {
      e.preventDefault();
      if (wrongChar.current === true || userEntry.length !== targetString.length) {
        setWrongSubmission(userEntry); // Only submit the user's entry if it was interesting (i.e., wrong). // also submits if it was correct but incomplete (too short).
      }
      // rerender the domino (reset its state), by incrementing its "key", located in the zustand store. Eventually we'll actually use the key to rerender a parent component which includes the timebar etc.
      incrementDominoResetKey();
    }

    // detect when spacebar's pressed
    else if (e.key === ' ') {
      e.preventDefault();
      if (firstSpace.current === true) { // detect whether the spacebar's already been pressed once; it's the 2nd press which indicates a submission.
      // execute the submission-logic. (DO NOT execute the non-submission logic.)
        if (wrongChar.current === false && userEntry.length === targetString.length) { // detect case 1: a correct submission. (Too short (with all the characters correct) doesn't flip wrongChar but should still count as an incorrect submission.)
          // the zustand store should record:
          setHasReceivedCorrectSubmission(); // sets this as true
        }
        else { // case 2: an incorrect submission.
          // the zustand store should NOT record hasReceivedCorrectSubmission as true.
          setWrongSubmission(userEntry);// record incorrect submissions (correct ones are boring & don't get recorded)
        }
        // execute the clear-domino logic, regardless of (evaluating lengths & wrongChar).
        incrementDominoResetKey();
      }
      else { // execute the non-submission logic:
        // Now we know that a space was typed, and it was the first space, so set that to true. Thus it's not indicating a submission.
        firstSpace.current = true;
        // determine whether this space should set wrongChar = true:
        if (remainderString[0].char !== '\u00A0') { // is the next remaining character a space? if not, set wrongChar = true. // spaces are mapped into remainderString as this unicode sequence for non-breakable-space
          wrongChar.current = true; // CHECK IF ^^ ALSO HANDLES THE CASE WHERE THERE'S NO MORE remainderString REMAINING (& IT'S JUST A NULL OR SOMETHING), MEANING THE USER HAS OVERTYPED. THAT SHOULD DEFINITELY SET wrongChar = true.
        }

        // adjust the char arrays (userEntry and remainderString):
        // create newChar, which can hold a style attribute if needed, & which we'll append onto the userEntry array.
        const newChar = { char: '\u00A0' }; // unicode for nonbreakable space
        if (wrongChar.current === true) { // if they've ever typed a wrongChar, all future letters will get a red background.
          newChar.backgroundColor = 'rgb(208, 63, 63)';
        }
        else { // else: all entries are correct. Don't set red background. Remove first char from remainderString.
          setRemainderString((prev) => prev.slice(1)); // .slice(1) creates a new array starting from the second element (index 1) and skips the first element. Returns an empty array [] if there's nothing left.
        }
        // unconditionally add newChar to userEntry. It's a local usestate hook, so define it inline. Spread operator handles objects fine.
        setUserEntry((prev) => [...prev, newChar]);
      }
    }
    else if (e.key.length === 1) { // This filters for letter keys, as opposed to all the remaining non-letter keys (which all have an e.key.length > 1). They return strings, actually: Control Alt Meta CapsLock Shift. But I didn't want to e.preventDefault() them, bc things like shift are useful.
      // handle regular character
      e.preventDefault(); // Prevent default text input behavior

      // if they mistyped, or typed beyond the length of the targetString, set wrongChar = true.
      if (remainderString.length === 0 || e.key !== remainderString[0].char) {
        wrongChar.current = true;
      };

      const newChar = { // we want each letter to have two attributes, rather than just having a 1d list of letters.
        char: e.key,
        backgroundColor: wrongChar.current ? 'rgb(208, 63, 63)' : undefined, // if they've ever typed a wrongChar, all future letters will get a red background.
      //                                                             // undefined: react essentially behaves as if the property isn't set. // other options: an if statement (outside the object literal) or the spread operator (inside the object literal).
      // color: (just in case I want to conditionally change that, too)
      };
      // unconditionally add newChar to userEntry. It's a local usestate hook, so define it inline. Spread operator handles objects fine.
      setUserEntry((prev) => [...prev, newChar]);
      // if the typed char is correct, lop off remainderString's first letter. (as soon as wrongChar becomes false, no more of remainderString's first letters will ever get lopped off.)
      if (wrongChar.current === false) {
        setRemainderString((prev) => prev.slice(1)); // .slice(1) creates a new array starting from the second element (index 1) and skips the first element.
      }
    }
  };

  // show remainderString in grey, to the right of the userEntry.
  return (
    <div
      ref={dominoRef} // so useEffect can auto-focus this div on mount
      contentEditable={true} // Disables cursor placement by clicking. Enter & Tab are disabled. Only typing and backspace are supported.
      suppressContentEditableWarning={true} // React isn't designed to manage contentEditable elements safely, and gives a warning. Don't disable this warning unless you're confident you're manually handling all updates to the DOM in the contentEditable area (including user input), & disabling the contentEditable div's desire to display its own stuff, & explicitly only showing letters which are from the react state.
      tabIndex={0} // Make div focusable
      onKeyDown={handleKeyDown}
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
            key={index} // The key prop is required by React when rendering lists to uniquely identify each element.
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
