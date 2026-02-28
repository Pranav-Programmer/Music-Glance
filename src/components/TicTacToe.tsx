// src/components/TicTacToe.tsx (Updated with Single/Double mode)
'use client';

import { useState, useEffect } from 'react';

type Player = 'X' | 'O' | null;
type GameMode = 'single' | 'double';

export default function TicTacToe({ showModeSelector = true }: { showModeSelector?: boolean }) {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [gameMode, setGameMode] = useState<GameMode>('single');
  const [scores, setScores] = useState({ X: 0, O: 0, Draw: 0 });
  const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  const checkWinner = (board: Player[]): Player => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const isDraw = (board: Player[]): boolean => {
    return board.every(cell => cell !== null);
  };

  const handleClick = (index: number) => {
    if (board[index] || gameOverMessage) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner) {
      setGameOverMessage(`Game over! Player ${winner} Wins!`);
      setScores(prev => ({ ...prev, [winner]: prev[winner] + 1 }));
      return;
    } else if (isDraw(newBoard)) {
      setGameOverMessage("Game over! It's a Draw!");
      setScores(prev => ({ ...prev, Draw: prev.Draw + 1 }));
      return;
    }

    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  const minimax = (newBoard: Player[], player: Player): number => {
    const availSpots = newBoard.reduce((acc, val, idx) => (val === null ? [...acc, idx] : acc), [] as number[]);

    const winner = checkWinner(newBoard);
    if (winner === 'O') return 10;
    if (winner === 'X') return -10;
    if (availSpots.length === 0) return 0;

    let bestScore = player === 'O' ? -Infinity : Infinity;
    for (const spot of availSpots) {
      newBoard[spot] = player;
      const score = minimax(newBoard, player === 'O' ? 'X' : 'O');
      newBoard[spot] = null;
      bestScore = player === 'O' ? Math.max(score, bestScore) : Math.min(score, bestScore);
    }
    return bestScore;
  };

  const findBestMove = (newBoard: Player[]): number => {
    let bestScore = -Infinity;
    let bestMove = -1;
    const availSpots = newBoard.reduce((acc, val, idx) => (val === null ? [...acc, idx] : acc), [] as number[]);

    for (const spot of availSpots) {
      newBoard[spot] = 'O';
      const score = minimax(newBoard, 'X');
      newBoard[spot] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = spot;
      }
    }
    return bestMove;
  };

  useEffect(() => {
    if (gameMode === 'single' && currentPlayer === 'O' && !gameOverMessage) {
      const newBoard = [...board];
      const bestMove = findBestMove(newBoard);
      if (bestMove !== -1) {
        handleClick(bestMove);
      }
    }
  }, [currentPlayer, board, gameOverMessage, gameMode]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setGameOverMessage(null);
  };

  return (
    <div className="rounded-2xl p-4 md:p-6 mb-8 shadow-3xl flex flex-col items-center justify-center min-h-max bg-gradient-to-b from-purple-900 to-purple-800 text-white">
    {showModeSelector && (
    <h2 className="text-2xl md:text-3xl font-caveat text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 drop-shadow-lg mb-6 text-center animate-glow">
      Until then play the game!
    </h2>
    )}
    {!showModeSelector && (
    <h2 className="text-5xl md:text-3xl font-caveat text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 drop-shadow-lg mb-6 text-center animate-glow">
      Tic Tac Toe
    </h2>
    )}
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');

      .font-caveat {
        font-family: "Caveat", cursive;
        font-optical-sizing: auto;
        font-weight: 700;
        font-style: normal;
      }

      @keyframes glow {
        0%, 100% { text-shadow: 0 0 4px rgba(255, 215, 0, 0.3); }
        50% { text-shadow: 0 0 8px rgba(255, 215, 0, 0.6); }
      }

      .animate-glow {
        animation: glow 2s infinite ease-in-out;
      }
    `}</style>

      {/* Mode Selection */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => { setGameMode('single'); resetGame(); }}
          className={`px-4 py-2 rounded font-bold ${gameMode === 'single' ? 'bg-indigo-600' : 'bg-gray-500'}`}
        >
          Single
        </button>
        <button
          onClick={() => { setGameMode('double'); resetGame(); }}
          className={`px-4 py-2 rounded font-bold ${gameMode === 'double' ? 'bg-indigo-600' : 'bg-gray-500'}`}
        >
          Double
        </button>
      </div>

      {/* Scores */}
      <div className="flex space-x-2 mb-4">
        <div className="bg-cyan-400 text-purple-900 px-4 py-2 rounded font-bold text-sm md:text-base">
          Player X: {scores.X}
        </div>
        <div className="bg-gray-300 text-purple-900 px-4 py-2 rounded font-bold text-sm md:text-base">
          Draw: {scores.Draw}
        </div>
        <div className="bg-yellow-400 text-purple-900 px-4 py-2 rounded font-bold text-sm md:text-base">
          Player O: {scores.O}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className={`w-20 h-20 md:w-24 md:h-24 flex items-center justify-center text-4xl font-bold rounded ${
              cell === 'X' ? 'text-cyan-400' : cell === 'O' ? 'text-yellow-400' : ''
            } bg-purple-700 hover:bg-purple-600 transition disabled:cursor-not-allowed`}
            disabled={!!cell || !!gameOverMessage}
          >
            {cell === 'X' ? 'X' : cell === 'O' ? 'O' : ''}
          </button>
        ))}
      </div>

      {/* Game Over Banner */}
      {gameOverMessage && (
        <div className="mt-6 bg-green-500 text-white px-6 py-2 rounded font-bold animate-bounce">
          {gameOverMessage}
          <button onClick={resetGame} className="ml-4 underline">Play Again</button>
        </div>
      )}
    </div>
  );
};