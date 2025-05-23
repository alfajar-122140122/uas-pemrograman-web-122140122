// Example helper function (can be expanded)

/**
 * Formats a date string into a more readable format.
 * @param {string} dateString - The date string to format (e.g., "2025-05-23").
 * @param {object} options - Options for Intl.DateTimeFormat.
 * @returns {string} - The formatted date string.
 */
export const formatDate = (dateString, options) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const mergedOptions = { ...defaultOptions, ...options };
  try {
    return new Date(dateString).toLocaleDateString('id-ID', mergedOptions);
  } catch (e) {
    return dateString; // Return original if formatting fails
  }
};

/**
 * Simple function to show a browser alert.
 * Can be replaced with a more sophisticated toast/notification library.
 * @param {string} message - The message to display.
 * @param {string} type - 'success' or 'error' (currently just affects console log).
 */
export const showAlert = (message, type = 'success') => {
  console.log(`Alert (${type}):`, message); // Log for now
  alert(message); // Simple browser alert
  // Example: if (type === 'success') toast.success(message);
  // Example: if (type === 'error') toast.error(message);
};

// Add more utility functions as needed, for example:
// - Input validation functions
// - Text truncation
// - Number formatting
