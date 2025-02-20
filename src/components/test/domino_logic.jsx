// domino_logic.jsx
import { useEffect, useLayoutEffect } from 'react'; // for my custom useDominoFocus hook

export const initializeRemainderString = (targetPair, dominoPointer) => {
  // dominoPointer contains two keys for specifying display type:
  const echoOrRecall = dominoPointer.echoOrRecall; // (determines whether the domino grabs 2 words or just 1.)
  const leftOrRight = dominoPointer.leftOrRight; // (determines which word, if just 1.) (null in the case of 2 words (ie, an echo domino))

  if (echoOrRecall === 'echo') {
    // Concatenate leftHalf and rightHalf, separated by a non-breaking space
    const concatenated = `${targetPair.leftHalf}\u00A0${targetPair.rightHalf}`;
    return stringToCharObjects(concatenated);
  }

  if (echoOrRecall === 'recall') {
    // Use the specified half (leftHalf or rightHalf)
    return stringToCharObjects(targetPair[leftOrRight]);
  }

  // helper function: converts a string into an array of character-objects. Declare it with function (rather than const) so that it gets hoisted.
  function stringToCharObjects(str) {
    return str.split('').map((char) => ({
      char: char === ' ' ? '\u00A0' : char, // Replace space with non-breaking space. Shouldn't really be needed anymore, since now the pairs are stored as individual words (sans spaces). There shouldn't be any spaces in the string
    }));
  }

  // Default to an empty array if conditions are not met
  console.log('conditions were not met');
  return [];
};

export const handleKeyDown = (e, // "e" is the event.
  // handleKeyDown uses these hooks to update remainderString and userEntry. (useState hooks, local to the Domino component.)
  { remainderString, setRemainderString, userEntry, setUserEntry },
  // the below are all refs, which needed to be declared at the component level so that they can persist across function calls.
  { wrongChar, // wrongChar === false means no typing-mistakes have been made. (Typing-mistakes include both wrong characters & exceeding the length of the targetString).
    targetLength, // correct submissions have to be targetLength long. // targetLength initializes off the first remainderString render & is ready for the 2nd render.
    firstSpace }, // firstSpace becomes true in order to track whether they've pressed the spacebar a first time yet
  echoOrRecall, // to where should the submissions go?
  // 3 zustand setters (which act on testSlice.results). Each has 2 versions: one for echo, and one for recall.
  // Subset & call like so: submitBad[echoOrRecall](wrongEntry), where wrongEntry contains { submissionType, userEntry }
  { submitBad,
    setCorrect }, // to document a correct submission, which triggers the nextScreen setter
) => {
  // Prevent newlines and tabbing; prevent arrow keys from moving the caret
  if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    return;
  }

  // change "backspace" to include submit & reset behaviors
  else if (e.key === 'Backspace') {
    e.preventDefault();
    // if (wrongChar.current === true || userEntry.length !== targetLength.current) { // originally I was only going to submit userEntry if it was wrong or not the right length, but it turns out I always need the reset functionality of submitBad, and I don't want to refactor that out
    submitBad[echoOrRecall]({ submissionType: 'Backspace', userEntry });
    // submitBad also rerenders the domino (resets its state), by incrementing its "key", located in the zustand store.
  }

  // detect when spacebar's pressed
  else if (e.key === ' ') {
    e.preventDefault();
    if (firstSpace.current === true || echoOrRecall === 'recall') { // for echo, it's the 2nd press which indicates a submission, so firstSpace.current would have to be true. For recall, it's the 1st press which indicates a submission, so firsSpace.current can be false. For recall, there's no non-submission logic which could turn firstSpace.current to true.
      // execute the submission-logic. (DO NOT execute the non-submission logic.)
      if (wrongChar.current === false && userEntry.length === targetLength.current) { // detect case 1: a correct submission. (Too short (with all the characters correct) doesn't flip wrongChar but should still count as an incorrect submission.)
        // the zustand store should record:
        setCorrect[echoOrRecall](); // sets this as true
      }
      else { // case 2: an incorrect submission.
        // the zustand store should NOT record setCorrect[echoOrRecall](); as true.
        submitBad[echoOrRecall]({ submissionType: 'Spacebar', userEntry }); // record incorrect submissions (correct ones are boring & don't get recorded)
      }
      // execute the clear-domino logic, regardless of (evaluating lengths & wrongChar). // actually, now the clear-domino logic is included in submitBad
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

// a custom hook I made, for handling focus, bc I wanted to use useEffect inside a function (but you can't do that; you have to create a custom hook, to use a hook inside a function)
export const useDominoFocus = (
  dominoRef, // begins null; points to the DOM object once it exists. useEffect ensures that .focus() doesn't try to run before the DOM is ready.
  echoOrRecall, // echo has one domino, which auto-focuses.
  focused, // recall has multiple dominoes, only one of which has focused === true. (focused === null or undefined for echo.)
) => {
  useEffect(() => {
    if (dominoRef.current && echoOrRecall === 'echo') { // Why check that dominoRef.current is no longer null? It should be unnecessary. useEffect only runs after the DOM is updated (which populates dominoRef with a DOM element). But it's better to have my web app fail to focus than utterly crash. (they could still click the home button, and go back there.)
      dominoRef.current.focus(); //                     // DEFENSIVE PROGRAMMING: it would be nice to have a "home" button and "emergency submit" and "resume later", and login capabilities, so they can reload their progress. But, I guess I can start running the test, and close it to additional participants if >1 person has website-crash issues...
    }
  }, []);

  useLayoutEffect(() => {
    console.log('focused is ', focused);
    if (dominoRef.current && echoOrRecall === 'recall' && focused) {
      dominoRef.current.focus();
    }
  }, [focused]); // dependency array: run useEffect whenever focused changes (and once on mount, of course, just like for a [] dependency array)
};

// Automatically place caret at the end of the userEntry string (on mount and when userEntry changes). (It's another custom hook, since it also contains useEffect().)
export const useCaretAtEnd = (dominoRef, userEntry) => { // dominoRef points to the DOM object (whose caret we're interested in.) // userEntry is the dependency; just listen for when it changes.
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
};
