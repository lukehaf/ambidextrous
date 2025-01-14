import React from 'react';
import useStore from '../../store/index.js';

import Domino from './domino.jsx';
import CustomProgressBar from './progress_bar';

const DominoProgressWrapper = () => {
  const dominoResetKey = useStore(({ testSlice }) => testSlice.dominoResetKey);
  return (
    <div key={dominoResetKey} // here's LUKE'S key, from the zustand store. when this key changes it triggers a domino rerender, since it's placed here on the domino component.
    >
      <Domino />
      <CustomProgressBar />
    </div>
  );
};

export default DominoProgressWrapper;
