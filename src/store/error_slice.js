// error_slice.js
import { toast } from 'react-toastify';

export default function createErrorSlice(set) {
  return {
    newError: (message) => toast.error(message),
  };
}
