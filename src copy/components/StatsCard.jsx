import React from 'react';

const colorMap = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  yellow: 'text-yellow-600',
  red: 'text-red-600',
};

const StatsCard = ({ title, value, color = 'blue' }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 text-center">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className={`text-2xl font-bold ${colorMap[color] || 'text-gray-800'}`}>{value}</p>
    </div>
  );
};

export default StatsCard;
