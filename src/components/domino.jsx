import React from 'react';
import useStore from '../store'; // Import Zustand store

function Domino({ onDominoChange }) {
  const { dominoTerm, setDominoTerm } = useStore();

  const onInputChange = (event) => {
    const term = event.target.value;
    setDominoTerm(term); // Update Zustand store
    onDominoChange(term); // Call the parent component's callback
  };

  return (
    <div id="domino">
      <input
        onChange={onInputChange}
        value={dominoTerm}
        placeholder="larry"
      />
    </div>
  );
}

export default Domino;
