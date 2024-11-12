import { useState, useContext, useEffect } from "react";
import { Button } from "./Button";
import { Backdrop } from "./Backdrop";
import { AuthContext } from "./Auth";
import { listDocs } from "@junobuild/core";

export const MyGames = () => {
  const [showModal, setShowModal] = useState(false);
  const [games, setGames] = useState([]);
  const { user } = useContext(AuthContext);
  const [moveSecrets, setMoveSecrets] = useState({});

  useEffect(() => {
    if (showModal) {
      fetchMyGames();
      const storedMoves = JSON.parse(localStorage.getItem('moveSecrets') || '{}');
      setMoveSecrets(storedMoves);
    }
  }, [showModal]);

  const fetchMyGames = async () => {
    try {
      const { items } = await listDocs({
        collection: "game_collection",
        filter: {
          order: {
            desc: true,
            field: "createdAt"
          }
        }
      });

      // Filter games where user is a player and status is WAITING_FOR_REVEALS
      const myGames = items.filter(game => 
        (game.data.player1Address === user?.owner || game.data.player2Address === user?.owner) &&
        game.data.status === "WAITING_FOR_REVEALS"
      );

      setGames(myGames);
    } catch (err) {
      console.error('Error fetching games:', err);
    }
  };

  const handleReveal = async (game) => {
    const moveSecret = moveSecrets[game.key];
    if (!moveSecret) {
      alert("Move secret not found!");
      return;
    }

    try {
      // TODO: Implement reveal logic
      console.log("Revealing move:", moveSecret);
    } catch (err) {
      console.error('Error revealing move:', err);
      alert(err.message);
    }
  };

  return (
    <>
      {showModal && (
        <>
          <div className="fixed inset-0 z-50 p-16 md:px-24 md:py-44 animate-fade" role="dialog">
            <div className="relative w-full max-w-xl text-white bg-white dark:bg-black p-6 border-black dark:border-lavender-blue-500 border-[3px] rounded shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_#7888FF]">
              <h3 className="text-lg font-bold mb-4">My Games to Reveal</h3>
              <div className="max-h-[60vh] overflow-y-auto">
                {games.length === 0 ? (
                  <p className="text-center text-gray-500">No games waiting for reveals</p>
                ) : (
                  games.map(game => (
                    <div 
                      key={game.key}
                      className="mb-4 p-4 border-2 border-gray-200 rounded-lg"
                    >
                      <p>Game #{game.key.slice(0, 8)}</p>
                      <p>Bet Amount: {game.data.betAmount} ETH</p>
                      <p>Player 1: {game.data.player1Address.slice(0, 8)}...</p>
                      <p>Player 2: {game.data.player2Address.slice(0, 8)}...</p>
                      <p>Deadline: {new Date(game.data.revealDeadline).toLocaleString()}</p>
                      <Button 
                        onClick={() => handleReveal(game)}
                        className="mt-2"
                      >
                        Reveal Move
                      </Button>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4">
                <Button onClick={() => setShowModal(false)}>Close</Button>
              </div>
            </div>
          </div>
          <Backdrop onClick={() => setShowModal(false)} />
        </>
      )}
      <Button onClick={() => setShowModal(true)}>
        My Games
      </Button>
    </>
  );
}; 