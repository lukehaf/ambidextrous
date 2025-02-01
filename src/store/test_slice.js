// Here's a function for initializing the results datastructure.
// It creates an echo-results-object and a recall-results object, and gets called 4 times.
// First 2 times are both for names, and require this parameter:
const names = { lapsEcho: 2, repsEcho: 2, lapsRecall: 3, dominoHeight: 5 }; // also used by currentScreen
// Second 2 times are both for objects, and require this parameter:
const objects = { lapsEcho: 1, repsEcho: 1, lapsRecall: 3, dominoHeight: 5 }; // also used by currentScreen

function createQuarterResults({ lapsEcho, repsEcho, lapsRecall, dominoHeight }) {
  return {
    // results of the echo-practice (from the perspective of calling this function for the 1st listHalf of names):
    echo: Array.from({ length: lapsEcho }, () => ( // an array of length lapsEchoNames = 2, because everyone gets two laps of practice.
      Array.from({ length: dominoHeight }, () => ( // 1st lap: needs to be an array of length dominoHeightNames = 5. It holds 5 objects: one for each domino.
        Array.from({ length: repsEcho }, () => ({ // 1st domino: needs to be an array of length repsNames = 2. It holds 2 objects: one for each rep.
          // Here's the object-shape per rep:
          completed: false,
          elapsedTime: null, // the whole echo-domino shares a counter (and perhaps a timebar?), which isn't reset by wrongSubmissions.
          wrongSubmissions: [], // wrongSubmissions contains type, submission, and time. No initialization needed, since each submission-object is submitted as a unit, and can simply be appended.
          targetPair: null, // I’d be happy for each domino-pair to know it’s correct targetString… that’s a good safeguard, in case there’s confusion about how the list-order works.
        }))
      ))
    )),
    // results of the recall-test (for the 1st listHalf of names):
    recall: Array.from({ length: lapsRecall }, () => ( // an array of length lapsRecall = 3, because everyone gets 3 laps through the recall-test
      Array.from({ length: dominoHeight }, () => ({ // 1st lap: needs to be an array of length dominoHeightNames = 5. It holds 5 objects: one for each domino-pair.
        // Here's the object-shape for each domino pair:
        elapsedTime: null, // the whole domino pair shares a timebar, which isn't reset by wrongSubmissions to leftHalf or rightHalf. That's their incentive to get it right the first time. And if they have to hit IDK, they don't get any timebar area whatsoever.
        leftHalf: { completed: false, wrongSubmissions: [] }, // The wrongSubmissions array remains empty if they get it right first try. Each incorrect userEntry is added as another object in the array.
        //                                                    // each wrongSubmissions object needs a type key, with space, backspace, or IDK button. It also needs another submissionTime (since I want to see if the time they take on their FIRST entry predicts incorrectness)
        rightHalf: { completed: false, wrongSubmissions: [] }, // wrongSubmission (for the rightHalf) now allows multiple attempts, to detect unordered schemas (valid entry, wrong place).
        reinforcementAttempts: [],
        targetPair: null, // I’d be happy for each domino-pair in the dominoStack to know it’s correct targetString… that’s a good safeguard, in case there’s confusion about how the list-order works.
      }))
    )),
  };
}

export default function createTestSlice(set) {
  return {
    // testSlice includes 3 large datastructures: presentables (for all screens), results (from all screens), and currentScreen (so the currently-rendered screen knows which part of presentables to draw from, and which part of results to write to).
    // eventually I could make these 3 datastructures into 3 different slices, I bet. But no need.

    currentScreen: {
      // All the state that a currentScreen (or its components) might need. Favor the components listening directly, rather than passing them props.
      // Pretty much everything here is read/write pointers; this lets me compartmentalize away data within 'presentables' and 'results'.
      // Every component should get its own state-object to listen to. Even if that creates some redundancy in the store. The upside is that each store-object is only listened to by one component. No hidden dependencies that could break when reformatting a store-object.
      // // Naming-rule: append "pointer" to a state-object's name whenever its purpose is to subset 'presentables' or 'results'.

      whichScreen: null, // stub. Currently I'm using the legacy currentScreenTest. // possible values: 'TestHasThreeUIs', 'EchoNames', 'EchoObjects', 'Recall', 'DominoStack'.

      // maybe append "pointer" to the below echoObjects and echoNames objects? (Definitely do so if these objects contain pointers which are used to access parts of presentables or results.)
      echoNames: {},
      echoObjects: {}, // maybe the two echo-screens have identically shaped objects? Then I could combine the two objects into one, since their screens never render at the same time.

      dominoStack: {
        whichFocus: { // Listened to by dominoes that know they're part of a dominoStack. // initializes which domino starts out focused.
          pairIndex: 0,
          whichHalf: 'leftHalf',
        },
        reinforcementNeeded: null, // listened to by domino-pairs that know they're part of a dominoStack. // for IDK-button submissions or incorrect rightHalf followed by a correct rightHalf.
      },

      dominoPointer: { // dominoPointer contains everything that a domino needs, in order to find the right targetString and submit to the correct location.
        // these props get us the correct list (and the correct pair from the list)
        namesOrObjects: 'objects',
        listHalf: 1,
        pairIndex: 0, // no need for an additional scrambledPairIndex anymore, for echo_objects. pairIndex points to a location in presentables and results, independent from the order in which the 5 echo_objects screens are presented. // I like this 02413 order because you’re not consciously chaining anything until the last moment. It’s just a faith in the process kind of thing. // const scrambledPairIndex = (pairIndex < Math.ceil(dominoStackHeight / 2)) ? (pairIndex * 2) : ((pairIndex - Math.ceil(dominoStackHeight / 2)) * 2 + 1); // use the modulo operator to cycle the indices back when pairIndex exceeds half the height.
        //            // for dominoStack, pairIndex is provided by the dominoStack, since there are multiple onscreen. dominoPointer's pairIndex is set to null.
        // these props decide how it's displayed
        echoOrRecall: 0, // leftOrRight is provided by recall/dominoStack. It's not used by the echo-screens.
        // this prop's for labeling the submission, and for moving them on after 1 attempt
        whichAttempt: 0, // set it via {dominoStackResults[pairIndex][leftOrRight].wrongSubmissions.length + 1}
      },
    },
    presentables: {
      targetPairs: { // FOR DOMINO (names & objects; one and two)
        // targetPairs also contains the stories & storyTimes. That's fine. They belong together conceptually & are accessed together.
        names: {
          one: [
            { leftHalf: 'liam', rightHalf: 'emma' },
            { leftHalf: 'emma', rightHalf: 'noah' },
            { leftHalf: 'noah', rightHalf: 'ava' },
            { leftHalf: 'ava', rightHalf: 'mia' },
            { leftHalf: 'mia', rightHalf: 'ethan' },
          ],
          two: [
            { leftHalf: 'chloe', rightHalf: 'owen' },
            { leftHalf: 'owen', rightHalf: 'caleb' },
            { leftHalf: 'caleb', rightHalf: 'jack' },
            { leftHalf: 'jack', rightHalf: 'hannah' },
            { leftHalf: 'hannah', rightHalf: 'leo' },
          ],
        },
        objects: {
          one: [
            { leftHalf: 'rake', rightHalf: 'leaves', storyTime: 17, storyText: 'placeholder story, written in the Zustand store' },
            { leftHalf: 'leaves', rightHalf: 'stream', storyTime: 17, storyText: 'placeholder story, written in the Zustand store' },
            { leftHalf: 'stream', rightHalf: 'bees', storyTime: 17, storyText: 'placeholder story, written in the Zustand store' },
            { leftHalf: 'bees', rightHalf: 'hivebox', storyTime: 17, storyText: 'placeholder story, written in the Zustand store' },
            { leftHalf: 'hivebox', rightHalf: 'mouse', storyTime: 17, storyText: 'placeholder story, written in the Zustand store' },
          ],
          two: [
            { leftHalf: 'peas', rightHalf: 'trellis', storyTime: 17, storyText: 'placeholder story, written in the Zustand store' },
            { leftHalf: 'trellis', rightHalf: 'fish', storyTime: 17, storyText: 'placeholder story, written in the Zustand store' },
            { leftHalf: 'fish', rightHalf: 'coins', storyTime: 17, storyText: 'placeholder story, written in the Zustand store' },
            { leftHalf: 'coins', rightHalf: 'flag', storyTime: 17, storyText: 'placeholder story, written in the Zustand store' },
            { leftHalf: 'flag', rightHalf: 'shoes', storyTime: 17, storyText: 'placeholder story, written in the Zustand store' },
          ],
        },
      },
    },

    // initialize results for the 4 listHalfs, according to createQuarterResults()
    results: {
      names: {
        // which listHalf
        one: createQuarterResults(names),
        two: createQuarterResults(names),
      },
      objects: {
        // which listHalf
        one: createQuarterResults(objects),
        two: createQuarterResults(objects),
      },
    },
    // setters (anything that modifies results):
    //////////////////////////////
    // MODIFY SETWRONGSUBMISSION IN LIGHT OF THE UPDATED ARGUMENTS; PASS IT THEM. BUT FIRST, INITIALIZE RESULTS APPROPRIATELY.
    setWrongSubmission: (pairIndex, whichHalf, whichAttempt, userEntry, spaceOrBackspace) => set(({ testSlice: draftState }) => {
      draftState.dominoStackResults[pairIndex][whichHalf].wrongSubmissions[whichAttempt] = { spaceOrBackspace: spaceOrBackspace, userEntry: userEntry };
    }, false, 'setWrongSubmission'),
    //////////////////////////////////////////////////////////////////
    // LEGACY CODE. GRADUALLY MOVE EVERYTHING BELOW UP INTO THE DESIRED 3 DATASTRUCTURES.
    // screen-state stuff for knowing which screen-type to render. (right now, you select this via TestHasThreeUIs, but eventually it will also listen to whichPR)
    currentScreenTest: 'TestHasThreeUIs', // eventually this can be encompassed by just currentScreen, but for now I'm actually trying to show 2 screens at once sometimes
    goToEchoNames: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'EchoNames'; }, false, 'goToEchoNames'), // couldn't I have just one function for all this? and pass the screen name? & then somehow get that out into the devtools middleware?
    goToEchoObjects: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'EchoObjects'; }, false, 'goToEchoObjects'),
    goToRecall: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'Recall'; }, false, 'goToRecall'),
    goToDominoStack: () => set(({ testSlice: draftState }) => { draftState.currentScreenTest = 'DominoStack'; }, false, 'goToDominoStack'),

    // we also need a counterBalanced object: an array of strings, dictating the order, say Names1 Names2 Objects1 Objects2. That lets the store be set up in the same order each time, and handles some conditional render type thing about what ([namesOrObjects][1vs2] gets passed to recall, echo_names, and echo_objects)?
    ////////////////////////////////
    dominoStackResults: [], // Each domino in the domino_stack gets its own object in this array.
    // Initialize the array, to schema out its structure (and initialize each "completed" to false).
    // Call this initialization function when the component loads. Or eventually, when we have the bigger structure, that will get initialized on the app's load.
    initializeDominoStack: () => {},
    // Setters, for the recall-task domino stack
    setElapsedTime: (pairIndex, time) => set(({ testSlice: draftState }) => {
      draftState.dominoStackResults[pairIndex].elapsedTime = time;
    }, false, 'setElapsedTime'),
    setHasReceivedCorrectSubmission: (pairIndex, whichHalf) => set(({ testSlice: draftState }) => {
      draftState.dominoStackResults[pairIndex][whichHalf].completed = true;
      if (whichHalf === 'leftHalf') {
        draftState.whichFocus.whichHalf = 'rightHalf';
      }
      else if (whichHalf === 'rightHalf') {
        draftState.whichFocus.whichHalf = 'leftHalf';
        draftState.whichFocus.pairIndex++;
      }
    }, false, 'setHasReceivedCorrectSubmission'),

    dominoResetKey: 0, // in the recall task, this is used by each domino-pair. We might need another for the whole domino-stack.
    incrementDominoResetKey: () => set(({ testSlice: draftState }) => { draftState.dominoResetKey += 1; }, false, 'incrementDominoResetKey'),

    dominoStackResetKey: 0, // in the recall task, this is used by each domino-pair. We might need another for the whole domino-stack.
    incrementDominoStackResetKey: () => set(({ testSlice: draftState }) => { draftState.dominoStackResetKey += 1; }, false, 'incrementDominoStackResetKey'),
  };
}
