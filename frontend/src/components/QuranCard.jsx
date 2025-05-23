import React from 'react';

const QuranCard = ({ surah, ayat, terjemahan, onAddToHafalan }) => {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-4 m-2">
      <h3 className="text-xl font-semibold text-gray-800">{surah} : {ayat}</h3>
      <p className="text-gray-600 my-2">{terjemahan.text}</p>
      <p className="text-sm text-gray-500 my-1"><em>{terjemahan.latin}</em></p>
      <button
        onClick={onAddToHafalan}
        className="mt-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-2xl shadow focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        Tambahkan ke Hafalan
      </button>
    </div>
  );
};

export default QuranCard;
