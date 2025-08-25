import React from 'react';

const Cell = ({ value, isRevealed, isFlagged, onClick, onRightClick }) => {
  const getCellContent = () => {
    if (!isRevealed) {
      return isFlagged ? '🚩' : '';
    }
    if (value === '💣') return '💣';
    return value === 0 ? '' : value;
  };

  const getCellColor = () => {
    if (!isRevealed) return 'bg-gray-400 hover:bg-gray-500';
    if (value === '💣') return 'bg-red-500';
    const colors = ['', 'text-blue-600', 'text-green-600', 'text-red-600', 'text-purple-600', 'text-yellow-600', 'text-pink-600', 'text-black', 'text-gray-600'];
    return colors[value] || 'text-black';
  };

  return (
    <div
      className={`w-8 h-8 flex items-center justify-center border border-gray-600 cursor-pointer font-bold text-sm ${getCellColor()}`}
      onClick={onClick}
      onContextMenu={onRightClick}
    >
      {getCellContent()}
    </div>
  );
};

export default Cell;