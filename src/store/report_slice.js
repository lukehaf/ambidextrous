// report_slice.js
import axios from 'axios';
import { toast } from 'react-toastify';
import { ROOT_URL } from './welcome_slice'; // const ROOT_URL = 'https://ambi-server.onrender.com/api'; or // 'http://localhost:9090/api';

export default function createReportSlice(set, get) {
  return {
    page1: {
      age: null,
      major1: null,
      major2: null,
      major3: null,
      preMed: null,
      athlete: null,
      occupation1: null,
      occupation2: null,
    },
    page2: {
      sleep: null,
      freshBefore: null,
      freshAfter: null,
    },
    page3: {
      ADHD: null,
      dyslexia: null,
      autism: null,
      OCD: null,
      anxiety: null,
      otherDiagnosis: null,
      otherDiagnosisText: null,
    },
    page4: {
      heardAboutStudy: null,
      otherSourceText: null,
      name: null,
    },
    setReport: (page, key, value) => set((draftState) => { draftState.reportSlice[page][key] = value; }, false, 'setReport'),
    surveyReceived: null,
    setSurveyReceived: (message) => set((draftState) => { draftState.reportSlice.surveyReceived = message; }, false, 'setSurveyReceived'),
    submitSurvey: async () => {
      const { page1, page2, page3, page4 } = get().reportSlice;
      const survey = { page1, page2, page3, page4 };
      const nthParticipant = get().testSlice.nthParticipant;
      const surveyObject = { survey, nthParticipant };
      get().reportSlice.setSurveyReceived('notYet');
      try {
        const response = await axios.patch(`${ROOT_URL}/survey`, surveyObject); // ('https://ambi-server.onrender.com/api/nth/no-ID'); // ('http://localhost:9090/api/nth/no-ID')
        // response should just hold if it was successful or not.
        if (response.data.surveyReceived === true) {
          get().reportSlice.setSurveyReceived(true);
          toast.success('questionnaire datastructure successfully received');
        }
      }
      catch (error) {
        get().errorSlice.newError('error while submitting questionnaire datastructure: ', error.message, ' Please email Luke a screenshot.');
      }
    },
  };
}
