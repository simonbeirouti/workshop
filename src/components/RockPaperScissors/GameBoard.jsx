import { useState } from 'react';
import { Button } from '../Button';

const MOVES = {
  ROCK: 1,
  PAPER: 2,
  SCISSORS: 3
};

const GameBoard = () => {
  const [gameState, setGameState] = useState({
    currentState: 0, // 0: Waiting, 1: Revealing, 2: Outcome
    betAmount: '0.1',
    timeLeft: 300 // 5 minutes in seconds
  });
  const [selectedMove, setSelectedMove] = useState(null);

  // Placeholder functions for future blockchain integration
  const commitMove = async (move) => {
    console.log('Move committed:', move);
    // TODO: Implement blockchain interaction
    setGameState(prev => ({...prev, currentState: 1}));
  };

  const revealMove = async () => {
    console.log('Revealing move:', selectedMove);
    // TODO: Implement blockchain interaction
    setGameState(prev => ({...prev, currentState: 2}));
  };

  const determineWinner = async () => {
    console.log('Determining winner');
    // TODO: Implement blockchain interaction
    setGameState(prev => ({...prev, currentState: 0}));
    setSelectedMove(null);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Rock Paper Scissors</h2>
        <p className="text-gray-600">
          Current State: {['Waiting for Players', 'Waiting for Reveals', 'Ready for Outcome'][gameState.currentState]}
        </p>
        <p className="text-gray-600">Bet Amount: {gameState.betAmount} ETH</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {Object.entries(MOVES).map(([moveName, moveValue]) => (
          <Button
            key={moveName}
            onClick={() => {
              setSelectedMove(moveValue);
              commitMove(moveValue);
            }}
            disabled={gameState.currentState !== 0}
            className={selectedMove === moveValue ? 'bg-blue-600' : ''}
          >
            {moveName}
          </Button>
        ))}
      </div>

      {gameState.currentState === 1 && (
        <Button onClick={revealMove} className="w-full mb-4">
          Reveal Move
        </Button>
      )}

      {gameState.currentState === 2 && (
        <Button onClick={determineWinner} className="w-full mb-4">
          Determine Winner
        </Button>
      )}
    </div>
  );
};

export default GameBoard; 