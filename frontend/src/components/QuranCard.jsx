import React from 'react';

const QuranCard = ({ surah, verse, onAddToHafalan }) => {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-4 m-2">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-gray-800">
          {surah.englishName} ({surah.number})
        </h3>
        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          Ayah {verse.numberInSurah}
        </span>
      </div>
      
      <div className="text-right mb-4">
        <p className="text-2xl font-arabic leading-relaxed" style={{ fontFamily: "'Traditional Arabic', serif" }}>
          {verse.text}
        </p>
      </div>
      
      <div className="space-y-2">
        <p className="text-gray-700">{verse.translation?.id || 'No Indonesian translation available'}</p>
        <p className="text-sm text-gray-500 italic">{verse.translation?.en || 'No English translation available'}</p>
      </div>
      
      <button
        onClick={() => onAddToHafalan(verse)}
        className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-2xl shadow focus:outline-none focus:ring-2 focus:ring-green-400 w-full"
      >
        Tambahkan ke Hafalan
      </button>
    </div>
  );
};

export default QuranCard;
