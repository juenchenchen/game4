'use client';

import { useState, useEffect, useCallback } from 'react';

interface GameSettings {
  gridSize: number;
  numberRange: number;
  callLimit: number;
  mode: 'classic' | 'quick' | 'challenge';
}

export default function BingoGame() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  // 遊戲設置
  const [settings, setSettings] = useState<GameSettings>({
    gridSize: 5,
    numberRange: 50,
    callLimit: 15,
    mode: 'classic'
  });

  const [board, setBoard] = useState<number[]>([]);
  const [marked, setMarked] = useState<boolean[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [remainingCalls, setRemainingCalls] = useState(settings.callLimit);
  const [showSettings, setShowSettings] = useState(false);

  // 音效
  useEffect(() => {
    const playSound = (soundName: string) => {
      const audio = new Audio(`/sounds/${soundName}.mp3`);
      audio.play().catch(e => console.log('音效播放失敗:', e));
    };

    if (gameWon) {
      playSound('win');
    } else if (gameLost) {
      playSound('lose');
    }
  }, [gameWon, gameLost]);

  // 初始化遊戲板
  const initializeBoard = () => {
    const boardSize = settings.gridSize * settings.gridSize;
    const numbers = Array.from({ length: boardSize }, (_, i) => 
      Math.floor(Math.random() * (settings.numberRange + 1))
    );
    setBoard(numbers);
    setMarked(new Array(boardSize).fill(false));
    setGameStarted(true);
    setGameWon(false);
    setGameLost(false);
    setWinningLine([]);
    setCalledNumbers([]);
    setCurrentNumber(null);
    setRemainingCalls(settings.callLimit);
  };

  // 根據模式設置遊戲參數
  const setGameMode = (mode: 'classic' | 'quick' | 'challenge') => {
    switch (mode) {
      case 'classic':
        setSettings(prev => ({
          ...prev,
          mode,
          gridSize: 5,
          numberRange: 50,
          callLimit: 15
        }));
        break;
      case 'quick':
        setSettings(prev => ({
          ...prev,
          mode,
          gridSize: 3,
          numberRange: 25,
          callLimit: 8
        }));
        break;
      case 'challenge':
        setSettings(prev => ({
          ...prev,
          mode,
          gridSize: 7,
          numberRange: 75,
          callLimit: 20
        }));
        break;
    }
  };

  // 叫號
  const callNumber = () => {
    if (calledNumbers.length >= settings.callLimit || gameWon || gameLost) return;
    
    let newNumber;
    do {
      newNumber = Math.floor(Math.random() * (settings.numberRange + 1));
    } while (calledNumbers.includes(newNumber));
    
    setCurrentNumber(newNumber);
    setCalledNumbers(prev => [...prev, newNumber]);
    setRemainingCalls(prev => prev - 1);

    // 播放叫號音效
    const audio = new Audio('/sounds/call.mp3');
    audio.play().catch(e => console.log('音效播放失敗:', e));

    if (remainingCalls === 1) {
      setGameLost(true);
    }
  };

  // 檢查勝利條件
  const checkWin = (newMarked: boolean[]) => {
    // 檢查橫線
    for (let i = 0; i < settings.gridSize; i++) {
      const row = Array.from({ length: settings.gridSize }, (_, j) => i * settings.gridSize + j);
      if (row.every(index => newMarked[index])) {
        setWinningLine(row);
        return true;
      }
    }

    // 檢查直線
    for (let i = 0; i < settings.gridSize; i++) {
      const col = Array.from({ length: settings.gridSize }, (_, j) => i + j * settings.gridSize);
      if (col.every(index => newMarked[index])) {
        setWinningLine(col);
        return true;
      }
    }

    // 檢查對角線
    const diagonal1 = Array.from({ length: settings.gridSize }, (_, i) => i * (settings.gridSize + 1));
    if (diagonal1.every(index => newMarked[index])) {
      setWinningLine(diagonal1);
      return true;
    }

    const diagonal2 = Array.from({ length: settings.gridSize }, (_, i) => (i + 1) * (settings.gridSize - 1));
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
    <main className={`min-h-screen p-8 flex flex-col items-center transition-colors duration-500 ${
      isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
    }`}>
      <div className="w-full max-w-4xl relative">
        <div className="flex items-center mb-8">
          <div className="w-12">
            <button
              onClick={() => setIsDarkMode(prev => !prev)}
              className={`p-3 rounded-full transition-all duration-200 transform hover:scale-110 ${
                isDarkMode 
                  ? 'bg-yellow-400 hover:bg-yellow-300 text-gray-800' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title={isDarkMode ? '切換至白天模式' : '切換至深夜模式'}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
          <h1 className={`flex-1 text-5xl font-bold text-center tracking-wider drop-shadow-lg ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            賓果遊戲
          </h1>
          <div className="w-12"></div>
        </div>
        
        {!gameStarted && (
          <div className={`max-w-2xl mx-auto text-center mb-8 p-8 rounded-3xl shadow-2xl ${
            isDarkMode ? 'bg-gray-700/90' : 'bg-white/90'
          } backdrop-blur-sm`}>
            <h2 className={`text-2xl font-semibold mb-6 border-b pb-4 ${
              isDarkMode ? 'text-white border-gray-600' : 'text-gray-800 border-gray-200'
            }`}>遊戲規則</h2>
            <ul className={`text-left list-disc pl-8 space-y-3 mb-8 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li>點擊「開始遊戲」按鈕開始新遊戲</li>
              <li>點擊「叫號」按鈕來叫出下一個數字（0-{settings.numberRange}）</li>
              <li>只能標記當前叫到的數字</li>
              <li>完成一條線（橫、直或斜）即可獲勝</li>
              <li>叫號次數限制為 {settings.callLimit} 次</li>
              <li className={`font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                目前模式：{
                  settings.mode === 'classic' ? '經典模式' :
                  settings.mode === 'quick' ? '快速模式' :
                  '挑戰模式'
                }
              </li>
            </ul>
            <div className="flex justify-center space-x-6">
              <button
                onClick={() => setShowSettings(true)}
                className="bg-gray-600 text-white px-8 py-4 rounded-2xl text-xl hover:bg-gray-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                遊戲設置
              </button>
              <button
                onClick={initializeBoard}
                className="bg-blue-500 text-white px-8 py-4 rounded-2xl text-xl hover:bg-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                開始遊戲
              </button>
            </div>
          </div>
        )}
        
        {gameStarted && (
          <div className={`flex flex-col items-center p-8 rounded-3xl shadow-2xl ${
            isDarkMode ? 'bg-gray-700/90' : 'bg-white/90'
          } backdrop-blur-sm`}>
            <div className="w-full flex justify-between items-center mb-6 px-4">
              <span className={`text-2xl font-bold px-6 py-3 rounded-xl border ${
                isDarkMode 
                  ? 'bg-red-900/30 border-red-700 text-red-400' 
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                剩餘叫號：{remainingCalls}
              </span>
              <button
                onClick={callNumber}
                disabled={gameWon || gameLost || remainingCalls === 0}
                className="bg-green-500 text-white px-8 py-3 rounded-xl text-xl hover:bg-green-600 disabled:bg-gray-400 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:transform-none disabled:shadow-none"
              >
                叫號
              </button>
            </div>

            {currentNumber !== null && (
              <div className={`w-36 h-16 text-2xl font-bold mb-6 p-3 rounded-xl shadow-inner flex items-center justify-center border-2 ${
                isDarkMode 
                  ? 'bg-blue-900/30 border-blue-700 text-blue-400' 
                  : 'bg-blue-50 border-blue-100 text-blue-600'
              }`}>
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>當前</span>
                <span className="ml-2">{currentNumber}</span>
              </div>
            )}

            <div className={`text-sm w-full max-w-lg overflow-auto mb-6 p-4 rounded-2xl border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-gray-300' 
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
              <span className="font-medium">已叫出：</span>{calledNumbers.join(', ')}
            </div>

            <div className={`grid gap-3 mb-6 p-6 rounded-2xl border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}
                 style={{
                   gridTemplateColumns: `repeat(${settings.gridSize}, minmax(0, 1fr))`
                 }}>
              {board.map((number, index) => (
                <div
                  key={index}
                  onClick={() => handleCellClick(index)}
                  className={`
                    w-20 h-20 flex items-center justify-center text-xl font-bold
                    border-2 rounded-xl cursor-pointer transition-all duration-200
                    shadow-sm hover:shadow-lg transform hover:scale-105
                    ${marked[index] 
                      ? isDarkMode 
                        ? 'bg-green-900/50 border-green-700 text-green-400' 
                        : 'bg-green-200 border-green-500 text-green-700'
                      : isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-300'
                        : 'bg-white border-gray-300 text-gray-700'
                    }
                    ${winningLine.includes(index)
                      ? isDarkMode
                        ? 'bg-yellow-900/50 border-yellow-700 text-yellow-400'
                        : 'bg-yellow-200 border-yellow-500 text-yellow-700'
                      : ''
                    }
                    ${currentNumber === number
                      ? isDarkMode
                        ? 'border-blue-500 shadow-blue-900/50'
                        : 'border-blue-500 shadow-blue-100'
                      : ''
                    }
                    ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}
                  `}
                >
                  {number}
                </div>
              ))}
            </div>
            
            {gameWon && (
              <div className={`text-2xl font-bold mb-6 p-4 rounded-2xl animate-bounce border-2 ${
                isDarkMode 
                  ? 'bg-green-900/30 border-green-700 text-green-400' 
                  : 'bg-green-50 border-green-200 text-green-600'
              }`}>
                恭喜你贏了！🎉
              </div>
            )}
            
            {gameLost && (
              <div className={`text-2xl font-bold mb-6 p-4 rounded-2xl border-2 ${
                isDarkMode 
                  ? 'bg-red-900/30 border-red-700 text-red-400' 
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                遊戲結束！未能在限定次數內完成連線 😢
              </div>
            )}
            
            {(gameWon || gameLost) && (
              <div className="flex space-x-4">
                <button
                  onClick={initializeBoard}
                  className="bg-blue-500 text-white px-6 py-3 rounded-xl text-lg hover:bg-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  重新開始
                </button>
                <button
                  onClick={() => {
                    setGameStarted(false);
                    setGameWon(false);
                    setGameLost(false);
                    setBoard([]);
                    setMarked([]);
                    setWinningLine([]);
                    setCalledNumbers([]);
                    setCurrentNumber(null);
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-gray-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  回主選單
                </button>
              </div>
            )}
            
            {!gameWon && !gameLost && (
              <button
                onClick={initializeBoard}
                className="bg-blue-500 text-white px-8 py-4 rounded-2xl text-xl hover:bg-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                重新開始
              </button>
            )}
          </div>
        )}

        {showSettings && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`p-8 rounded-3xl shadow-2xl max-w-md w-full ${
              isDarkMode ? 'bg-gray-700/95' : 'bg-white/95'
            }`}>
              <h2 className={`text-3xl font-bold mb-6 pb-4 border-b ${
                isDarkMode ? 'text-white border-gray-600' : 'text-gray-800 border-gray-200'
              }`}>遊戲設置</h2>
              <div className="space-y-6">
                <div>
                  <label className={`block text-lg font-medium mb-4 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>遊戲模式</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setGameMode('classic')}
                      className={`p-4 rounded-xl text-center transition-all duration-200 ${
                        settings.mode === 'classic'
                          ? 'bg-blue-500 text-white shadow-lg scale-105'
                          : isDarkMode
                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      經典模式
                      <div className="text-xs mt-2 font-medium">5x5 格</div>
                    </button>
                    <button
                      onClick={() => setGameMode('quick')}
                      className={`p-4 rounded-xl text-center transition-all duration-200 ${
                        settings.mode === 'quick'
                          ? 'bg-blue-500 text-white shadow-lg scale-105'
                          : isDarkMode
                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      快速模式
                      <div className="text-xs mt-2 font-medium">3x3 格</div>
                    </button>
                    <button
                      onClick={() => setGameMode('challenge')}
                      className={`p-4 rounded-xl text-center transition-all duration-200 ${
                        settings.mode === 'challenge'
                          ? 'bg-blue-500 text-white shadow-lg scale-105'
                          : isDarkMode
                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      挑戰模式
                      <div className="text-xs mt-2 font-medium">7x7 格</div>
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowSettings(false)}
                  className="bg-blue-500 text-white px-6 py-3 rounded-xl text-lg hover:bg-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  確定
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
