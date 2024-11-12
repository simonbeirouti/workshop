import { Backdrop } from "../Backdrop";

export const GameHistory = ({ games, showHistory, onClose }) => {
  return (
    <>
      <div className="fixed inset-0 z-50 p-16 md:px-24 md:py-44 animate-fade h-full" role="dialog">
        <div className="relative w-full max-w-xl bg-white dark:bg-black p-6 border-black dark:border-lavender-blue-500 border-[3px] rounded shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_#7888FF]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-black dark:text-white hover:text-lavender-blue-600"
            aria-label="Close dialog"
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold mb-4 text-white">Game History</h2>
          <div className="max-h-[60vh] overflow-y-auto">
            {games.map((game) => (
              <div key={game.key} className="mb-4 p-4 border-2 rounded text-black dark:text-white">
                <p>Game ID: {game.data.text}</p>
                <p>Played: {new Date(game.data.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Backdrop onClick={onClose} />
    </>
  );
}; 