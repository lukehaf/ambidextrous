// error_slice.js
import { toast } from 'react-toastify';

export default function createErrorSlice(set) {
  return {
    newError: (...messages) => toast.error(messages.join('')), // The ... collects all the messages into an array, and then .join concatenates them into a single string.
  };
}
