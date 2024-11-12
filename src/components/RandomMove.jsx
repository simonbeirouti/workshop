import { useState, useEffect } from "react";
import { Button } from "./Button";

export const RandomMove = ({ onMove, isSubmitting, onCancel }) => {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [selectedMove, setSelectedMove] = useState(null);
  const moves = ["🪨", "🧻", "✂️"];

  // Animation effect for moves while submitting
  useEffect(() => {
    let interval;
    if (isSubmitting && !selectedMove) {
      // Select a random move when submitting starts
      const randomMove = Math.floor(Math.random() * 3);
      setSelectedMove(randomMove);
    }

    if (!isSubmitting) {
      // Cycle through moves when not submitting
      interval = setInterval(() => {
        setCurrentMoveIndex((prev) => (prev + 1) % moves.length);
      }, 150);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSubmitting, selectedMove]);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-6xl py-32">
        {isSubmitting 
          ? moves[selectedMove]
          : moves[currentMoveIndex]
        }
      </div>
      {isSubmitting ? (
        <div className="my-8 animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-indigo-600 rounded-full" />
      ) : (
        <Button onClick={onMove}>
          Random Move
        </Button>
      )}
      <Button onClick={onCancel}>Cancel</Button>
    </div>
  );
};
