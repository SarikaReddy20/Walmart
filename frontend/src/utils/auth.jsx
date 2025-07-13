// utils/auth.js
import jwtDecode from 'jwt-decode';

export const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded; // Includes _id, role, email, etc.
  } catch (err) {
    console.error('Invalid token:', err);
    return null;
  }
};
