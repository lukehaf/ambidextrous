import React from 'react';
import styles from './echo_objects.module.scss';
// USE @KEYFRAMES & .SCSS TO MAKE THE STORY-TIMEBAR TAKE __ SECONDS.
// no need for a js counter in the react component. Way overkill.
// built-in progress bar can't have a dynamic progress value, so I do have to design my own. I kept an ok-looking chatgpt one.
// how do I pass a __ seconds value to the .module.scss style? I know it can use a variable: $time. but how do I import that from the zustand state, or the react component?

// import EchoNames from './echo_names.jsx'; // style EchoNames to appear after __ seconds, too.

import styles from './echo_objects.module.scss';

// here's an example of how to pass the duration time.  the line which starts style= can either receive it from the <EchoObjects />
// or it can receive it from a variable in the EchoObjects function, such as a zustand store hook.
const EchoObjects = ({ animationDuration }) => {
  return (
    <div
      className={styles.progressBar}
      style={{ animationDuration: `${animationDuration}s` }}
    >
      Animating...
    </div>
  );
};

// Example Usage
<EchoObjects animationDuration={4} />;


const CustomProgressBar = () => {
  return <div className={styles.hoverDiv}>Hover me!</div>;
};

// const CustomProgressBar = () => {
//   const value = 1;
//   return (
//     <div>
//       <div style={styles.container}>
//         <div
//           style={{
//             ...styles.bar,
//             width: `${value * 100}%`,
//             transition: 'width 0.5s ease',
//           }}
//         />
//       </div>
//       <div
//         style={:hover {
//             width: 300px;
//           }
//         }
//       />
//     </div>

//   );
// };

// const styles = {
//   container: {
//     width: '100%',
//     height: '20px',
//     backgroundColor: '#e0e0e0',
//     borderRadius: '10px',
//     overflow: 'hidden',
//   },
//   bar: {
//     height: '100%',
//     backgroundColor: '#76c7c0',
//   },
// };

const EchoObjects = () => {
  return (
    <div>
      <p>Here's where the story goes, to associate the two garden-related objects. Get the story from the zustand store.</p>
      <div>Here's a little counter/timebar, to give an appropriate amount of time per story before EchoNames appears.</div>
      <CustomProgressBar />
    </div>

  );
};

// const EchoObjects = () => {
//   let isVisible = false;
//   const startCountdown = () => {
//     let timeRemaining = 6; // here's what actually gets decremented, and which timeRemaining tracks
//     const intervalId = setInterval(() => {
//       if (timeRemaining <= 0) {
//         clearInterval(intervalId); // Stop the interval once the timer hits 0; intervalID is returned conveniently by the preexisting setInterval function
//         isVisible = true;
//       }
//       else { timeRemaining--; } // decrement time
//     }, 1000); // 1000 milliseconds
//   };

//   // Start the countdown when the component is mounted
//   useEffect(() => {
//     startCountdown();
//   }, [startCountdown]);

//   return (
//     <div>
//       <p>Here's where the story goes, to associate the two garden-related objects. Get the story from the zustand store.</p>
//       <div>Here's a little counter/timebar, to give an appropriate amount of time per story before EchoNames appears.</div>

//       <progress value={0.5} />

//       {/* Show EchoNames after the countdown finishes */}
//       <div style={{ opacity: isVisible ? 1 : 0.5, transition: 'opacity 1s ease-out' }}>
//         {isVisible ? <EchoNames /> : null}
//       </div>
//     </div>
//   );
// };

export default EchoObjects;
// const EchoObjects = () => {
//   const timeRemaining = useStore(({ testSlice }) => testSlice.timeRemaining);
//   const isVisible = useStore(({ testSlice }) => testSlice.isVisible);
//   const startCountdown = useStore(({ testSlice }) => testSlice.startCountdown);

//   // Start the countdown when the component is mounted
//   useEffect(() => {
//     startCountdown();
//   }, [startCountdown]);

//   return (
//     <div>
//       <p>Here's where the story goes, to associate the two garden-related objects. Get the story from the zustand store.</p>
//       <div>Here's a little counter/timebar, to give an appropriate amount of time per story before EchoNames appears.</div>

//       {/* Progress Bar */}
//       <div style={{ width: '100%', backgroundColor: '#ddd', height: '20px', borderRadius: '5px' }}>
//         <div
//           style={{
//             height: '100%',
//             backgroundColor: '#4caf50',
//             width: `${(timeRemaining / 6) * 100}%`, // Shrinks as time decreases
//             borderRadius: '5px',
//             transition: 'width 1s ease-out',
//           }}
//         >
//         </div>
//       </div>
//       <div> timeRemaining is {timeRemaining} </div>
//       <div>width is {(timeRemaining / 3) * 100}%</div>

//       {/* Show EchoNames after the countdown finishes */}
//       <div style={{ opacity: isVisible ? 1 : 0.5, transition: 'opacity 1s ease-out' }}>
//         {isVisible ? <EchoNames /> : null}
//       </div>
//     </div>
//   );
// };

// export default EchoObjects;
