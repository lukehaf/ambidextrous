import React, { useRef, useEffect } from 'react';
import useStore from '../../store/index.js';
import styles from './domino_stack.module.scss';

const TestInput = (props) => {
  const whichFocus = useStore((state) => state.testSlice.whichFocus);
  // const setHasReceivedCorrectSubmission = useStore((state) => state.testSlice.setHasReceivedCorrectSubmission);
  // const setWrongSubmission = useStore((state) => state.testSlice.setWrongSubmission);
  const dominoRef = useRef();

  // Evaluate whether it's this domino's turn to focus, whenever whichFocus changes
  useEffect(() => {
    if (whichFocus.pairIndex === props.pairIndex && whichFocus.whichHalf === props.whichHalf) {
      dominoRef.current.focus();
    }
  }, [whichFocus]);

  // // temporary handler
  // const correctSubmissionHandler = () => {
  //   // setHasReceivedCorrectSubmission(props.pairIndex, props.whichHalf);
  //   setWrongSubmission(props.pairIndex, props.whichHalf, props.whichAttempt, 'submission', 'spacebar');
  // };

  return (
    <div>
      <div
        ref={dominoRef} // so useEffect can programmatically focus this div
        contentEditable={true}
        suppressContentEditableWarning={true} // React isn't designed to manage contentEditable elements safely, and gives a warning. Don't disable this warning unless you're confident you're manually handling all updates to the DOM in the contentEditable area (including user input), & disabling the contentEditable div's desire to display its own stuff, & explicitly only showing letters which are from the react state.
        tabIndex={0} // Make div programmatically focusable
        // onKeyDown={handleKeyDown}
        onMouseDown={(e) => e.preventDefault()} // Prevents cursor placement via mouse clicks
        className={styles.domino}
        style={{
          outline: '1px solid black',
          display: 'flex',
          alignItems: 'center', // vertically centered, rather than stretched (the default). align works on the cross axis.
          flexWrap: 'nowrap', // this is the default for flexboxes; it's just here to remind me
          overflow: 'hidden', // prevents "multiline overflow." Keeps stuff from extending outside box.
          fontSize: '16px',
          fontFamily: 'monospace',
          cursor: 'text',
        }}
      />
    </div>
  );
};

export default TestInput;
