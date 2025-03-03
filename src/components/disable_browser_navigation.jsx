// disable_browser_navigation.jsx
import { useEffect } from 'react';

export function useDisableBackButton() { // LOOKS LIKE A DETERMINED DOUBLE-CLICKER CAN STILL MAKE THE BACK ARROW GO, but it then results in the chrome "are you sure you want to leave the page?" dialogue box (just like reload does).
  useEffect(() => {
    const handlePopState = (event) => {
      // Prevent navigation by pushing the current state back to the history stack
      window.history.pushState(null, '', window.location.href);
    };

    // Push an initial state to prevent back navigation
    window.history.pushState(null, '', window.location.href);

    // Add the event listener
    window.addEventListener('popstate', handlePopState);

    return () => {
      // Cleanup event listener on unmount
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
}

export function usePreventReload() {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ''; // Most browsers display a default confirmation dialog
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}
