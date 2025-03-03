// specific_instructions.jsx
import React, { useState } from 'react';
import useStore from '../../store/index.js';

import styles from '../welcome/welcome.module.scss';

import { GeneralInstructionsText } from '../welcome/general_instructions.jsx';

const SpecificInstructions = () => {
  const [showGeneral, setShowGeneral] = useState(false);
  const nextScreen = useStore(({ testSlice }) => testSlice.nextScreen);
  const allowNextScreen = useStore(({ testSlice }) => testSlice.currentScreen.counterbalanced.initialized);

  return (
    <div className={styles.container}>
      <h2 className={styles.prompt}>Progress:</h2>
      <p>
        [I will put a counter here, showing that they're on the 3rd section (of eight), for example.]
        <br />
        [And here I will put this particular participant's assigned order through the test, for instance EchoNames1, RecallNames1, EchoNames2, RecallNames2, EchoObjects1, RecallObjects1, EchoObjects2, RecallObjects2.]
      </p>
      { /* conditionally render Next Instructions */}
      <h2 className={styles.prompt}>Instructions for Next Section:</h2>
      <p className={styles.greyText}>
        I would love some help with the verbiage here. I need 4 versions: EchoNames, RecallNames, EchoObjects, RecallObjects. Just one of them will be rendered onscreen at a time.
      </p>
      <p>Echo for Names is like flashcards; it will give you 2 laps of practice through all 5 pairs of names, and 2 reps per pair. (It moves on to the next pair after you type the first pair correctly twice). The green progressbar just encourages you to type quickly, but if you miss the progressbar it is no big deal (you will just have to type it again). The order of the 5 pairs is helpful; it's the order you will have to recall them in.</p>
      <p>Recall for Names is the quiz for the names you just learned. It gives you 3 laps (3 chances to recall the whole list), with corrections provided, so that your accuracy can hopefully reach 100% by the second and third laps. Best of luck!</p>
      <p>Echo for Objects involves stories; I want to give them a little Intro Paragraph about this. They’re imagining a zen garden/arboretum; scenes from a zen garden, or arboretum, with more wild-growing little sections of bushes & trees, situated in a little wild park by the river; There’s trickling water— some sections carefully/artfully maintained, situated between sections which are left to grow more wild. There are little paths that branch through the park, and you can’t see from one end to the other. It invites exploring. The park is oriented towards families-- it's a good place for families to bring their kids, with lots of things for kids to explore, from the city who don’t normally get to. Everything from parks/places to run/hide and seek, to places where kids can learn about how some different plants and crops are grown. (Community garden with teaching days). No livestock, but there is a beehive, tended by someone who keeps bees as a hobby. Participants only get one lap and one rep of practice per pair of words.</p>
      <p>Recall for objects is a quiz for the zen-garden/arboretum-related objects & scenes. It gives you 3 laps (3 chances to recall the whole list), with corrections provided, so that your accuracy can hopefully reach 100% by the second and third laps. Best of luck! If you can't recall the exact word, just type a similar one. For instance, "dirt" would be awarded partial credit if the correct answer were "soil".</p>
      <p>
        <b>Typing Instructions:</b>
        <br />
        Everything is lowercase. Spacebar is submit, and use backspace to clear any typing mistakes.
      </p>
      { /* button for <GeneralInstructions /> and nextScreen */}
      <div className={styles.navbar}>
        <div className={styles.navbar_left}>
          <button onClick={() => setShowGeneral((prev) => !prev)} className={styles.navButton}>
            {showGeneral ? 'Hide' : 'Show'} General Instructions
          </button>
        </div>
        <div className={styles.navbar_right}>
          { /* conditionally disable the <SpecificInstructions /> Next Screen button, once initializeCounterbal has run (an async process, which for non beta testers requires getting nthParticipant from server) */}
          {!allowNextScreen && (
            <div style={{ display: 'flex' }} // places the button and text side by side
            >
              <button disabled>Next Screen</button>
              <div style={{ color: 'red' }}>Waiting for server. Please allow up to 45 seconds, since I am having to make do with a free tier of the server. -Luke </div>
            </div>
          )}
          {allowNextScreen && (
            <button onClick={nextScreen} className={styles.navButton}>Next Screen</button>
          )}
        </div>
      </div>
      { /* conditionally render <GeneralInstructions /> */}
      {showGeneral && <GeneralInstructionsText />}
    </div>
  );
};

export default SpecificInstructions;
