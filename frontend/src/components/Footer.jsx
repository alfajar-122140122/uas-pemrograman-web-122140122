import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-bg-secondary text-text-tertiary py-6 border-t border-border-color mt-auto">
      <div className="max-w-screen-xl mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} HafidzTracker. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
