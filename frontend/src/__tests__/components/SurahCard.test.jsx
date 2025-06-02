import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SurahCard from '../../components/SurahCard';

const mockSurah = {
  number: 1,
  englishName: 'Al-Fatiha',
  name: 'الفاتحة',
  revelationType: 'Meccan',
  englishNameTranslation: 'The Opener',
  numberOfAyahs: 7,
};

describe('SurahCard Component', () => {
  test('renders Surah card with all details', () => {
    const mockOnClick = jest.fn();
    render(<SurahCard surah={mockSurah} onClick={mockOnClick} />);

    expect(screen.getByText('1. Al-Fatiha')).toBeInTheDocument();
    expect(screen.getByText('Meccan')).toBeInTheDocument();
    expect(screen.getByText('الفاتحة')).toBeInTheDocument();
    expect(screen.getByText('The Opener (7 ayat)')).toBeInTheDocument();
  });

  test('calls onClick with surah number when card is clicked', () => {
    const mockOnClick = jest.fn();
    render(<SurahCard surah={mockSurah} onClick={mockOnClick} />);

    const cardElement = screen.getByText('1. Al-Fatiha').closest('div[class*="cursor-pointer"]');
    fireEvent.click(cardElement);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(mockSurah.number);
  });
});
