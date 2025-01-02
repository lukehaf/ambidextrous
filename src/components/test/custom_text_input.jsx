import React, { useRef, useState } from 'react';

function CustomTextInput() {
  const [text, setText] = useState([]); // Array of characters with styles.   //Each character is wrapped in a <span> with individual styles for color and background.
  const containerRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault(); // Prevent newlines and tabbing
      return;
    }

    if (e.key === 'Backspace') {
      setText((prev) => prev.slice(0, -1)); // Remove last character
      return;
    }

    if (e.key.length === 1) {
      e.preventDefault(); // Prevent default text input behavior
      const newChar = {
        char: e.key,
        color: getRandomColor(), // Example: Dynamic color
        backgroundColor: getRandomColor(), // Example: Dynamic background
      };
      setText((prev) => [...prev, newChar]); // Add new character
    }
  };

  const getRandomColor = () => {
    const colors = ['red', 'blue', 'green', 'purple', 'orange'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // The scrollToEnd function ensures the container scrolls to the latest character as the user types.
  const scrollToEnd = () => {
    const container = containerRef.current;
    if (container) {
      container.scrollLeft = container.scrollWidth; // Scroll to the end
    }
  };

  React.useEffect(scrollToEnd, [text]); // Scroll whenever text changes

  return (
    <div
      ref={containerRef}
      contentEditable={false} // Disables cursor placement by clicking. Only typing and backspace are supported. Other keys (like Enter and Tab) are disabled.
      tabIndex={0} // Make div focusable
      onKeyDown={handleKeyDown}
      style={{
        outline: '1px solid black',
        width: '400px', // domino width
        height: '40px',
        overflow: 'hidden', // prevents multiline overflow.
        whiteSpace: 'nowrap', // ensures the text stays on one line.
        display: 'flex',
        alignItems: 'center',
        padding: '5px',
        fontSize: '16px',
        fontFamily: 'monospace',
        cursor: 'text',
      }}
    >
      {text.map((t, index) => (
        <span
          key={index}
          style={{
            color: t.color,
            backgroundColor: t.backgroundColor,
            padding: '2px',
            margin: '0 1px',
          }}
        >
          {t.char}
        </span>
      ))}
    </div>
  );
}

export default CustomTextInput;
