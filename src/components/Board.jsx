import React, { useState, useEffect } from 'react';
import Cell from './Cell';

const BOARD_SIZE = 10;
const MINES_COUNT = 15;

const Board = () => {
  const [board, setBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [flags, setFlags] = useState(MINES_COUNT);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // ゲーム初期化
  const initializeBoard = () => {
    // 空のボードを作成
    const newBoard = Array(BOARD_SIZE).fill(null).map(() => 
      Array(BOARD_SIZE).fill(null).map(() => ({
        value: 0,
        isRevealed: false,
        isFlagged: false
      }))
    );

    // 地雷を配置
    placeMines(newBoard, MINES_COUNT);

    // 数字を計算
    calculateNumbers(newBoard);

    setBoard(newBoard);
    setGameOver(false);
    setGameWon(false);
    setFlags(MINES_COUNT);
    setStartTime(null);
    setElapsedTime(0);
  };

  // 地雷配置ロジック
  const placeMines = (board, minesCount) => {
    const mines = [];
    while (mines.length < minesCount) {
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);
      if (board[row][col].value !== '💣') {
        board[row][col].value = '💣';
        mines.push([row, col]);
      }
    }
    return board;
  };

  // 数字計算ロジック
  const calculateNumbers = (board) => {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col].value !== '💣') {
          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              const newRow = row + i;
              const newCol = col + j;
              if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                if (board[newRow][newCol].value === '💣') count++;
              }
            }
          }
          board[row][col].value = count;
        }
      }
    }
    return board;
  };

  // セルオープンロジック
  const revealCell = (board, row, col) => {
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return board;
    if (board[row][col].isRevealed || board[row][col].isFlagged) return board;
    
    board[row][col].isRevealed = true;
    
    if (board[row][col].value === 0) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          revealCell(board, row + i, col + j);
        }
      }
    }
    
    return board;
  };

  // 勝利判定
  const checkWin = (board) => {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col].value !== '💣' && !board[row][col].isRevealed) {
          return false;
        }
      }
    }
    return true;
  };

  // セルクリック処理
  const handleCellClick = (row, col) => {
    if (gameOver || gameWon || board[row][col].isFlagged) return;

    // タイマー開始
    if (!startTime) {
      setStartTime(Date.now());
    }

    const newBoard = [...board];
    
    // 地雷をクリックした場合
    if (newBoard[row][col].value === '💣') {
      newBoard[row][col].isRevealed = true;
      setBoard(newBoard);
      setGameOver(true);
      return;
    }

    // セルを開く
    revealCell(newBoard, row, col);
    setBoard(newBoard);

    // 勝利判定
    if (checkWin(newBoard)) {
      setGameWon(true);
    }
  };

  // 右クリック処理
  const handleRightClick = (e, row, col) => {
    e.preventDefault();
    if (gameOver || gameWon || board[row][col].isRevealed) return;

    const newBoard = [...board];
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    setBoard(newBoard);
    setFlags(prev => newBoard[row][col].isFlagged ? prev - 1 : prev + 1);
  };

  // タイマー更新
  useEffect(() => {
    let interval;
    if (startTime && !gameOver && !gameWon) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, gameOver, gameWon]);

  // 初期化
  useEffect(() => {
    initializeBoard();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">マインスイーパー</h1>
      <div className="mb-4 flex items-center justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold">🚩:</span>
          <span className="text-lg font-bold text-blue-600">{flags}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold">⏱️:</span>
          <span className="text-lg font-bold text-green-600">{elapsedTime}</span>
        </div>
        <button 
          onClick={initializeBoard}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
        >
          リスタート
        </button>
      </div>
      <div className="grid grid-cols-10 gap-1 bg-gray-300 p-3 rounded-lg shadow-lg">
        {board.map((row, rowIndex) => 
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              value={cell.value}
              isRevealed={cell.isRevealed}
              isFlagged={cell.isFlagged}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              onRightClick={(e) => handleRightClick(e, rowIndex, colIndex)}
            />
          ))
        )}
      </div>
      {gameOver && (
        <div className="mt-6 text-2xl font-bold text-red-600 animate-pulse">
          💥 ゲームオーバー！
        </div>
      )}
      {gameWon && (
        <div className="mt-6 text-2xl font-bold text-green-600 animate-bounce">
          🎉 おめでとう！あなたの勝ち！
        </div>
      )}
      <div className="mt-6 text-sm text-gray-600 text-center">
        <p>左クリック: セルを開く | 右クリック: フラグを立てる</p>
      </div>
    </div>
  );
};

export default Board;