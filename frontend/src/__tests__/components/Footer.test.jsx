import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../../components/Footer'; // Corrected import path

describe('Footer Component', () => {
  test('renders copyright information', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} HafidzTracker. All rights reserved.`)).toBeInTheDocument();
  });
});
