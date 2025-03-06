// questionnaire.jsx

import React, { useState } from 'react';

import Page1 from './page1';
import Page2 from './page2';
import Page3 from './page3';
import Page4 from './page4';

function Questionnaire() {
  const [page, setPage] = useState(1);
  return (
    <div>
      {page === 1 && <Page1 setPage={setPage} />}
      {page === 2 && <Page2 setPage={setPage} />}
      {page === 3 && <Page3 setPage={setPage} />}
      {page === 4 && <Page4 setPage={setPage} />}
    </div>
  );
};

export default Questionnaire;
