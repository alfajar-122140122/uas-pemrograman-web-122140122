/**
 * JWT token utility functions
 */

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - true if token is expired, false otherwise
 */
export const isTokenExpired = (token) => {
  if (!token) {
    return true; // No token means it's expired
  }

  try {
    // Parse the JWT token to get the payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check if token has an expiration time
    if (!payload.exp) {
      return true; // No expiration means it's invalid
    }

    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return true; // Error means the token is invalid
  }
};

/**
 * Get user ID from JWT token
 * @param {string} token - JWT token
 * @returns {number|null} - user ID or null if token is invalid
 */
export const getUserIdFromToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    // Parse the JWT token to get the payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user_id;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};
