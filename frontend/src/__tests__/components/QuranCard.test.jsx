import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuranCard from '../../components/QuranCard';

const mockSurah = {
  englishName: 'Al-Fatiha',
  number: 1,
};

const mockVerse = {
  numberInSurah: 1,
  text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  translation: {
    id: 'Dengan menyebut nama Allah Yang Maha Pemurah lagi Maha Penyayang.',
    en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
  },
};

const mockVerseNoTranslation = {
  numberInSurah: 2,
  text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
  translation: null, // Simulate missing translation
};


describe('QuranCard Component', () => {
  test('renders Quran card with all details', () => {
    const mockOnAddToHafalan = jest.fn();
    render(<QuranCard surah={mockSurah} verse={mockVerse} onAddToHafalan={mockOnAddToHafalan} />);

    expect(screen.getByText('Al-Fatiha (1)')).toBeInTheDocument();
    expect(screen.getByText('Ayah 1')).toBeInTheDocument();
    expect(screen.getByText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')).toBeInTheDocument();
    expect(screen.getByText('Dengan menyebut nama Allah Yang Maha Pemurah lagi Maha Penyayang.')).toBeInTheDocument();
    expect(screen.getByText('In the name of Allah, the Entirely Merciful, the Especially Merciful.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tambahkan ke Hafalan/i })).toBeInTheDocument();
  });

  test('calls onAddToHafalan when button is clicked', () => {
    const mockOnAddToHafalan = jest.fn();
    render(<QuranCard surah={mockSurah} verse={mockVerse} onAddToHafalan={mockOnAddToHafalan} />);

    const addButton = screen.getByRole('button', { name: /Tambahkan ke Hafalan/i });
    fireEvent.click(addButton);

    expect(mockOnAddToHafalan).toHaveBeenCalledTimes(1);
    expect(mockOnAddToHafalan).toHaveBeenCalledWith(mockVerse);
  });

  test('renders correctly when translations are missing', () => {
    const mockOnAddToHafalan = jest.fn();
    render(<QuranCard surah={mockSurah} verse={mockVerseNoTranslation} onAddToHafalan={mockOnAddToHafalan} />);

    expect(screen.getByText('Al-Fatiha (1)')).toBeInTheDocument();
    expect(screen.getByText('Ayah 2')).toBeInTheDocument();
    expect(screen.getByText('الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ')).toBeInTheDocument();
    expect(screen.getByText('No Indonesian translation available')).toBeInTheDocument();
    expect(screen.getByText('No English translation available')).toBeInTheDocument();
  });
});
