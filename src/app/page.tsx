'use client';

import { useState, useEffect } from 'react';

export default function BingoGame() {
  // 遊戲格子數量設定
  const BOARD_SIZE = 25; // 5x5 的遊戲板
  const GRID_COLS = 5; // 5 列
  const GRID_ROWS = 5; // 5 行
  const CALL_LIMIT = 15; // 叫號次數限制

  const [board, setBoard] = useState<number[]>([]);
  const [marked, setMarked] = useState<boolean[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [remainingCalls, setRemainingCalls] = useState(CALL_LIMIT);

  // 初始化遊戲板
  const initializeBoard = () => {
    const numbers = Array.from({ length: BOARD_SIZE }, (_, i) => i);
    // Fisher-Yates 洗牌算法
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    setBoard(numbers);
    setMarked(new Array(BOARD_SIZE).fill(false));
    setGameStarted(true);
    setGameWon(false);
    setGameLost(false);
    setWinningLine([]);
    setCalledNumbers([]);
    setCurrentNumber(null);
    setRemainingCalls(CALL_LIMIT);
  };

  // 叫號
  const callNumber = () => {
    if (calledNumbers.length >= CALL_LIMIT || gameWon || gameLost) return;
    
    let newNumber;
    do {
      newNumber = Math.floor(Math.random() * 51); // 0-50
    } while (calledNumbers.includes(newNumber));
    
    setCurrentNumber(newNumber);
    setCalledNumbers([...calledNumbers, newNumber]);
    setRemainingCalls(prev => prev - 1);

    // 檢查是否用完叫號次數
    if (remainingCalls === 1) {
      setGameLost(true);
    }
  };

  // 檢查勝利條件
  const checkWin = (newMarked: boolean[]) => {
    // 檢查橫線
    for (let i = 0; i < GRID_ROWS; i++) {
      const row = Array.from({ length: GRID_COLS }, (_, j) => i * GRID_COLS + j);
      if (row.every(index => newMarked[index])) {
        setWinningLine(row);
        return true;
      }
    }

    // 檢查直線
    for (let i = 0; i < GRID_COLS; i++) {
      const col = Array.from({ length: GRID_ROWS }, (_, j) => i + j * GRID_COLS);
      if (col.every(index => newMarked[index])) {
        setWinningLine(col);
        return true;
      }
    }

    // 檢查對角線
    const diagonal1 = Array.from({ length: GRID_ROWS }, (_, i) => i * (GRID_COLS + 1));
    if (diagonal1.every(index => newMarked[index])) {
      setWinningLine(diagonal1);
      return true;
    }

    const diagonal2 = Array.from({ length: GRID_ROWS }, (_, i) => (i + 1) * (GRID_COLS - 1));
    if (diagonal2.every(index => newMarked[index])) {
      setWinningLine(diagonal2);
      return true;
    }

    return false;
  };

  // 處理格子點擊
  const handleCellClick = (index: number) => {
    if (!gameStarted || gameWon || gameLost || !currentNumber) return;
    
    // 只能標記當前叫到的數字
    if (board[index] !== currentNumber) return;
    
    const newMarked = [...marked];
    newMarked[index] = !newMarked[index];
    setMarked(newMarked);
    
    if (checkWin(newMarked)) {
      setGameWon(true);
    }
  };

  return (
    <main className="min-h-screen p-4 flex flex-col items-center bg-gradient-to-b from-blue-50 to-white">
      <h1 className="text-4xl font-bold mb-6 text-blue-800 tracking-wide">賓果遊戲</h1>
      
      {!gameStarted && (
        <div className="max-w-2xl text-center mb-6 p-6 bg-white rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">遊戲規則：</h2>
          <ul className="text-left list-disc pl-6 space-y-2 text-gray-700">
            <li>點擊「開始遊戲」按鈕開始新遊戲</li>
            <li>點擊「叫號」按鈕來叫出下一個數字（0-50）</li>
            <li>只能標記當前叫到的數字</li>
            <li>完成一條線（橫、直或斜）即可獲勝</li>
            <li>叫號次數限制為 {CALL_LIMIT} 次</li>
            <li>用完叫號次數前未完成連線則遊戲失敗</li>
          </ul>
        </div>
      )}
      
      {!gameStarted ? (
        <button
          onClick={initializeBoard}
          className="bg-blue-500 text-white px-6 py-3 rounded-xl text-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          開始遊戲
        </button>
      ) : (
        <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-lg">
          <div className="mb-4 flex flex-col items-center">
            <div className="text-xl font-bold mb-2">
              剩餘叫號次數：<span className="text-red-600 text-2xl">{remainingCalls}</span>
            </div>
            <button
              onClick={callNumber}
              disabled={gameWon || gameLost || remainingCalls === 0}
              className="bg-green-400 text-white px-6 py-3 rounded-xl text-xl hover:bg-green-600 disabled:bg-gray-400 mb-4 transform hover:scale-105 transition-all duration-200 shadow-md disabled:transform-none"
            >
              叫號
            </button>
            {currentNumber !== null && (
              <div className="w-43 h-13 text-2xl font-bold mb-3 p-3 bg-blue-50 rounded-xl shadow-inner flex items-center justify-center">
                當前數字：<span className="text-blue-600 ml-2">{currentNumber}</span>
              </div>
            )}
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl max-w-lg overflow-auto">
              已叫出：{calledNumbers.join(', ')}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
            {board.map((number, index) => (
              <div
                key={index}
                onClick={() => handleCellClick(index)}
                className={`
                  w-16 h-16 flex items-center justify-center text-xl font-bold
                  border-2 rounded-lg cursor-pointer transition-all duration-200
                  shadow-sm hover:shadow-md transform hover:scale-105
                  ${marked[index] ? 'bg-green-200 border-green-500 shadow-green-100' : 'bg-white border-gray-300'}
                  ${winningLine.includes(index) ? 'bg-yellow-200 border-yellow-500 shadow-yellow-100' : ''}
                  ${currentNumber === number ? 'border-blue-500 border-3 shadow-blue-100' : ''}
                  hover:bg-gray-50
                `}
              >
                {number}
              </div>
            ))}
          </div>
          
          {gameWon && (
            <div className="text-2xl font-bold text-green-600 mb-4 p-3 bg-green-50 rounded-xl animate-bounce">
              恭喜你贏了！🎉
            </div>
          )}
          
          {gameLost && (
            <div className="text-2xl font-bold text-red-600 mb-4 p-3 bg-red-50 rounded-xl">
              遊戲結束！未能在限定次數內完成連線 😢
            </div>
          )}
          
          <button
            onClick={initializeBoard}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl text-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            重新開始
          </button>
        </div>
      )}
    </main>
  );
}
