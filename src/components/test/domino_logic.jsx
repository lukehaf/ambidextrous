// domino_logic.jsx

import useStore from '../../store/index.js'; // Zustand store

export const initializeRemainderString = (dominoPointer, props) => {
  // dominoPointer subsets `presentables` & `results` & contains display state.
  // // // keys for subsetting:
  const namesOrObjects = dominoPointer.namesOrObjects;
  const listHalf = dominoPointer.listHalf;
  let pairIndex = dominoPointer.pairIndex; // (overwritten by props.pairIndex, if that's defined)
  // // // keys for display-type:
  const echoOrRecall = dominoPointer.echoOrRecall; // (determines whether the domino grabs 2 words or just 1.)

  // props also subsets & contains display state. Only exists for the dominoes which reside in a dominoStack.
  // props.leftOrRightHalf: dominoStack dominoes get just half of a word-pair.
  // props.pairIndex:
  if (props) { // if props.pairIndex exists, overwrite the pairIndex from dominoPointer (which should be null in the cases involving a dominoStack, anyways)
    pairIndex = props.pairIndex;
  }

  // hook the correct pair from the Zustand store
  const targetPair = useStore((state) => state.testSlice.presentables.targetPairs[namesOrObjects][listHalf][pairIndex]); // targetPair also includes a storyText and a storyTime, if it's for an objects-list. Unused, here.

  if (echoOrRecall === 'echo') {
    // Concatenate leftHalf and rightHalf, separated by a non-breaking space
    const concatenated = `${targetPair.leftHalf}\u00A0${targetPair.rightHalf}`;
    return stringToCharObjects(concatenated);
  }

  if (echoOrRecall === 'recall') {
    // Use the specified half (leftHalf or rightHalf)
    const selectedHalf = targetPair[props.leftOrRightHalf];
    return stringToCharObjects(selectedHalf);
  }

  // helper function: converts a string into an array of character-objects. Declare it with function (rather than const) so that it gets hoisted.
  function stringToCharObjects(str) {
    str.split('').map((char) => ({
      char: char === ' ' ? '\u00A0' : char, // Replace space with non-breaking space. Shouldn't really be needed anymore, since now the pairs are stored as individual words (sans spaces). There shouldn't be any spaces in the string
    }));
  }

  // Default to an empty array if conditions are not met
  return [];
};
/// //// ALL THE KEYS IN GENERAL
// dominoPointer subsets `presentables` & `results` & contains display state.
// // keys for subsetting:
// //     namesOrObjects
// //     listHalf
// //     pairIndex (overwritten by props.pairIndex, if it is defined)
// //     whichAttempt (increments for spaces and backspaces, if incorrect)
// // keys for display-type & submission-logic:
// //     echoOrRecall (2vs1 space logic depends on this, and whether the domino grabs 2 words or just 1.)
// //     HMMM DO WE NEED ANOTHER KEY? The rightHalf needs to show grey, and behave like a leftHalf, IF they've clicked the IDK button or correctly submitted the rightHalf following an incorrect submission of rightHalf.

// props exists only for the dominoes which reside in a dominoStack.
// //     pairIndex (for subsetting & focus)
// //     leftOrRight (for display-type & submission-logic) (controls whether the grey text is shown, and whether they get unlimited tries.)

export const handleKeyDown = (e, // "e" is the event.
  // handleKeyDown uses these hooks to update remainderString and userEntry.
  { remainderString, setRemainderString, userEntry, setUserEntry },
  // the below are all refs, which needed to be declared at the component level so that they can persist across function calls.
  { wrongChar, // wrongChar === false means no typing-mistakes have been made. (Typing-mistakes include both wrong characters & exceeding the length of the targetString).
    targetLength, // correct submissions have to be targetLength long. // targetLength initializes off the first remainderString render & is ready for the 2nd render.
    firstSpace }, // firstSpace becomes true in order to track whether they've pressed the spacebar a first time yet
) => {
// I BET SETWRONGSUBMISSION NEEDS A REFORMATTED RESULTS OBJECT, AND TO BE PASSED THE DOMINOPOINTER.
  const setWrongSubmission = useStore((store) => store.testSlice.setWrongSubmission);// record userEntry in the store. Called only in the event of a wrong submission. (wrongChar === true) (or wrongLength?) (where a submission is triggered by space (or space2), or by backspace)
  //                                                                                 // also make a zustand setter to submit time, backspace or char, and maybe something else?
  const incrementDominoResetKey = useStore(({ testSlice }) => testSlice.incrementDominoResetKey);
  const setHasReceivedCorrectSubmission = useStore(({ testSlice }) => testSlice.setHasReceivedCorrectSubmission);

  // Prevent newlines and tabbing; prevent arrow keys from moving the caret
  if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    return;
  }

  // change "backspace" to include submit & reset behaviors
  else if (e.key === 'Backspace') {
    e.preventDefault();
    if (wrongChar.current === true || userEntry.length !== targetLength) {
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
      if (wrongChar.current === false && userEntry.length === targetLength) { // detect case 1: a correct submission. (Too short (with all the characters correct) doesn't flip wrongChar but should still count as an incorrect submission.)
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
