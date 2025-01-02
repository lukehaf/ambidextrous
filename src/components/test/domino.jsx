import React, { useState, useEffect } from 'react';
import useStore from '../../store/index.js'; // Zustand store
import CustomTextInput from './custom_text_input.jsx';

function Domino({ onDominoChange }) {
  const { dominoTerm, setDominoTerm, elapsedTime, setElapsedTime } = useStore();
  const [startTime, setStartTime] = useState(null); // react hook for managing local state (within a functional component)
  const [warning, setWarning] = useState(false); // cool! they also have setters, but the setters are here, rather than in the store.
  const targetWord = 'larry';

  // Set startTime when component first renders
  useEffect(() => {
    setStartTime(Date.now());
  }, []); // Empty dependency array means it runs only once, on mount

  const onInputChange = (event) => {
    const input = event.target.value;

    if (input.length > 20) {
      setWarning(true);
    }
    else {
      setWarning(false);
    }

    setDominoTerm(input); // Update Zustand store
    onDominoChange(input); // Notify parent component, so it rerenders
  };

  const handleKeyDown = (event) => {
    if (event.key === ' ') {
      const now = Date.now();
      const timeElapsed = ((now - startTime) / 1000).toFixed(2);
      setElapsedTime(timeElapsed); // Update Zustand store
      setStartTime(now); // update local state
    }
  };

  const renderInputDisplay = () => {
    const characters = dominoTerm.split('');
    return targetWord.split('').map((char, index) => {
      if (index < characters.length) {
        const userChar = characters[index];
        if (userChar === char) {
          return <span key={index} style={{ color: 'black' }}>{char}</span>;
        }
        else {
          return (
            <span key={index} style={{ color: 'black', backgroundColor: 'red' }}>
              {userChar}
            </span>
          );
        }
      }
      // I want the following grey text to get overwritten character by character
      else {
        return <span key={index} style={{ color: 'grey' }}>{char}</span>;
      }
    });
  };

  // tabIndex = 0 makes that div focusable. Other possible values are -1 and any positive #
  return (
    <div id="domino" onKeyDown={handleKeyDown} tabIndex={0}>
      <div contenteditable="true">This text is editable.</div>
      <input
        onChange={onInputChange}
        value={dominoTerm}
        placeholder="larry"
      />
      <p>State value: {renderInputDisplay()}</p>
      {warning && <p style={{ color: 'red' }}>Max characters exceeded</p>}
      {elapsedTime !== null && <p>Time elapsed: {elapsedTime} seconds</p>}
      <CustomTextInput />
    </div>
  );
}

export default Domino;
