import { signOut } from "@junobuild/core";
import { useState, useContext } from "react";
import { Button } from "./Button";
import { GameHistory } from "./RockPaperScissors/GameHistory";
import { listDocs } from "@junobuild/core";
import { AuthContext } from "./Auth";

export const Header = () => {
  const [showHistory, setShowHistory] = useState(false);
  const [games, setGames] = useState([]);
  const { user } = useContext(AuthContext);

  const fetchGames = async () => {
    try {
      const { items } = await listDocs({
        collection: "game_collection",
        filter: {
          order: {
            desc: true,
            field: "createdAt",
          },
        },
      });
      setGames(items.filter((game) => game.data.status === "FINISHED"));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleHistory = () => {
    if (!showHistory) {
      fetchGames();
    }
    setShowHistory(!showHistory);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 p-4 flex justify-evenly items-center text-md">
        <div className="ml-4 flex items-center space-x-4">
          <Button onClick={toggleHistory}>
            {showHistory ? "Hide History" : "View History"}
          </Button>
        </div>
        <div>
          {user?.owner && (
            <span className="text-sm text-white">
              {user.owner.slice(0, 12)}...{user.owner.slice(-6)}
            </span>
          )}
        </div>
        <div className="mr-6">
          <Button onClick={signOut}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="16"
              viewBox="0 -960 960 960"
              width="16"
              fill="currentColor"
            >
              <path d="M120-120v-720h360v80H200v560h280v80H120Zm520-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
            </svg>
            <span>Logout</span>
          </Button>
        </div>
      </header>

      {showHistory && (
        <GameHistory
          games={games}
          showHistory={showHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
};
