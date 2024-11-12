import { useEffect, useState, useContext } from "react";
import { Button } from "./Button";
import { Backdrop } from "./Backdrop";
import { AuthContext } from "./Auth";
import { RandomMove } from "./RandomMove";
import { listActiveGames, joinAndMove } from "../lib/functions";

export const Lobby = () => {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const activeGames = await listActiveGames();
        setGames(activeGames);
      } catch (err) {
        console.error('Error fetching games:', err);
      }
    };

    fetchGames();

    window.addEventListener("reload", fetchGames);
    return () => window.removeEventListener("reload", fetchGames);
  }, []);

  const handleJoinAndMove = async () => {
    if (!user?.owner) {
      console.error('No user address found');
      return;
    }

    setIsSubmitting(true);
    const randomMove = Math.floor(Math.random() * 3) + 1;

    try {
      const result = await joinAndMove(selectedGame.key, user.owner, randomMove);
      if (result.success) {
        window.dispatchEvent(new Event("reload"));
        setShowModal(false);
      }
    } catch (err) {
      console.error('Error:', err);
      alert(err.message || 'Failed to join game');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showModal && selectedGame && (
        <>
          <div className="fixed inset-0 z-50 p-16 md:px-24 md:py-44 animate-fade" role="dialog">
            <div className="relative w-full max-w-xl text-white bg-white dark:bg-black p-6 border-black dark:border-lavender-blue-500 border-[3px] rounded shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_#7888FF]">
              <h3 className="text-lg font-bold mb-4 text-black dark:text-white">
                Make Your Move
              </h3>
              <RandomMove 
                onMove={handleJoinAndMove}
                isSubmitting={isSubmitting}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
          <Backdrop onClick={() => setShowModal(false)} />
        </>
      )}
      <div className="w-full max-h-[90vh] overflow-y-auto p-4 mt-8">
        <div className="grid grid-cols-2 gap-4">
          {games.map((game) => {
            const isPlayerInGame = game.data.player1Address === user?.owner || 
                                 game.data.player2Address === user?.owner;
            
            return (
              <div
                key={game.key}
                onClick={() => {
                  if (isPlayerInGame) {
                    alert('You are already in this game');
                    return;
                  }
                  setSelectedGame(game);
                  setShowModal(true);
                }}
                className="bg-white border-[3px] border-black dark:border-lavender-blue-500 rounded-sm p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[4px_8px_0px_#7888FF] cursor-pointer hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-black">
                    #{game.key.slice(0, 8)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>Bet Amount: {game.data.betAmount} ETH</p>
                  <p>Status: {game.data.status}</p>
                  <p>Players: {!game.data.player1Address ? '0' : !game.data.player2Address ? '1' : '2'}/2</p>
                  {game.data.player1Address && (
                    <p>Player 1: {game.data.player1Address.slice(0, 8)}...</p>
                  )}
                  {game.data.player2Address && (
                    <p>Player 2: {game.data.player2Address.slice(0, 8)}...</p>
                  )}
                  <p>Created: {new Date(game.data.createdAt).toLocaleString()}</p>
                  <p className="mt-2 text-green-500">
                    {isPlayerInGame 
                      ? 'You are in this game' 
                      : 'Click to join and make your move!'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
