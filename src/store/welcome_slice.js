export default function createWelcomeSlice(set) {
  return {
    // which screen should be shown right now?)
    currentScreen: 'Test', // initial screen should actually be 'Welcome'
    consent: true, // later I'll add a setter function, for once they click "agree" at the bottom of the test info
    gaveConsent: () => set(({ welcomeSlice: draftState }) => { draftState.consent = true; }, false, 'gaveConsent'),
    studyInfoVisible: false,
    showStudyInfo: () => set(({ welcomeSlice: draftState }) => { draftState.studyInfoVisible = true; }, false, 'showStudyInfo'),
    goToTest: () => set(({ welcomeSlice: draftState }) => { draftState.currentScreen = 'TestHasThreeUIs'; }, false, 'goToTest'), // I'll probably say "DominoEcho" (a specific test screen), rather than relying on an additional "which screen" variable?
    participantsStillNeeded: 24, // counter state
  };
}
