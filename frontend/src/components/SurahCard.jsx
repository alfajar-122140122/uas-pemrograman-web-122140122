import React from 'react';

const SurahCard = ({ surah, onClick }) => {
  return (
    <div 
      className="bg-white shadow-lg rounded-xl p-4 m-2 cursor-pointer hover:shadow-xl transition-shadow duration-200 ease-in-out border border-border-color hover:border-accent-primary"
      onClick={() => onClick(surah.number)}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-accent-primary-dark">
          {surah.number}. {surah.englishName}
        </h3>
        <span className="text-sm text-text-secondary bg-bg-secondary px-2 py-1 rounded-md">
          {surah.revelationType}
        </span>
      </div>
      <p className="text-right text-xl font-arabic text-text-primary mb-1">{surah.name}</p>
      <p className="text-xs text-text-secondary">
        {surah.englishNameTranslation} ({surah.numberOfAyahs} ayat)
      </p>
    </div>
  );
};

export default SurahCard;
