import { Button } from "./Button";
import { useContext, useState } from "react";
import { AuthContext } from "./Auth";
import { Backdrop } from "./Backdrop";
import { createGame } from "../lib/functions";
import { MyGames } from "./MyGames";

export const Footer = () => {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [betAmount, setBetAmount] = useState(0.1);

  const handleCreateGame = async () => {
    if (!user?.owner) {
      console.error('Please connect wallet first');
      return;
    }

    try {
      const gameId = await createGame(betAmount);
      console.log('Created game with ID:', gameId);
      
      window.dispatchEvent(new Event("reload"));
      setShowModal(false);
    } catch (err) {
      console.error('Error creating game:', err);
    }
  };

  return (
    <>
      {showModal && (
        <>
          <div className="fixed inset-0 z-50 p-16 md:px-24 md:py-44 animate-fade" role="dialog">
            <div className="relative w-full max-w-xl text-white bg-white dark:bg-black p-6 border-black dark:border-lavender-blue-500 border-[3px] rounded shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_#7888FF]">
              <h3 className="text-lg font-bold mb-4">Create New Game</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Bet Amount (ETH)</label>
                <input 
                  type="number"
                  value={betAmount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setBetAmount(isNaN(value) ? 0.1 : value);
                  }}
                  className="text-black form-control block w-full px-3 py-1.5 text-md font-normal m-0 border-black border-[3px] rounded-sm bg-white shadow-[5px_5px_0px_rgba(0,0,0,1)] focus:outline-none"
                  step="0.1"
                  min="0.1"
                />
              </div>
              <div className="flex justify-between w-full space-x-4">
                <Button onClick={handleCreateGame}>Create</Button>
                <Button onClick={() => setShowModal(false)}>Cancel</Button>
              </div>
            </div>
          </div>
          <Backdrop onClick={() => setShowModal(false)} />
        </>
      )}
      <footer className="fixed bottom-0 left-0 right-0 p-4 w-full mr-4">
        <div className="flex flex-row justify-between items-center mx-6 text-md text-center w-full">
          <div className="flex space-x-4 w-full mr-10">
            <Button 
              onClick={() => {
                if (!user?.owner) {
                  console.error('Please connect wallet first');
                  return;
                }
                setShowModal(true);
              }}
            >
              Create New Game
            </Button>
            <MyGames />
          </div>
        </div>
      </footer>
    </>
  );
};
