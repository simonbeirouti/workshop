import { v4 as uuid } from "uuid";
import { setDoc, getDoc, listDocs, deleteDoc } from "@junobuild/core";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes } from "ethereum-cryptography/utils";
import { Buffer } from "buffer";

// Helper function to hash moves
export const hashMove = (moveChoice, secretUUID) => {
  const moveString = `${moveChoice}-${secretUUID}`;
  const bytes = utf8ToBytes(moveString);
  return Buffer.from(keccak256(bytes)).toString("hex");
};

// Create a new game
export const createGame = async (betAmount, playerAddress) => {
  try {
    const id = uuid();
    await setDoc({
      collection: "game_collection", 
      doc: {
        key: id,
        data: {
          id,
          status: "WAITING_FOR_PLAYERS",
          betAmount,
          createdAt: new Date().toISOString(),
          revealDeadline: null,
          winner: null,
          player1Address: null,
          player1Move: null,
          player1Revealed: false,
          player2Address: null,
          player2Move: null,
          player2Revealed: false,
        },
        version: 0,
      },
    });

    return id;
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
};

// Simplify storeMoveSecret function
export const storeMoveSecret = async (moveData) => {
  try {
    const simplifiedMoveSecret = {
      gameId: moveData.gameId,
      playerAddress: moveData.playerAddress,
      moveChoice: moveData.moveChoice,
      hashedMove: moveData.hashedMove,
      timestamp: new Date().toISOString()
    };

    await setDoc({
      collection: "move_secrets",
      doc: {
        key: moveData.secretUUID,
        data: simplifiedMoveSecret
      }
    });

    return true;
  } catch (err) {
    console.error('Error storing move secret:', err);
    throw err;
  }
};

// Simplify joinAndMove function
export const joinAndMove = async (gameId, playerAddress, moveChoice) => {
  try {
    const game = await getDoc({
      collection: "game_collection",
      key: gameId
    });
    
    if (!game) throw new Error("Game not found");

    const moveId = uuid();
    const hashedMove = hashMove(moveChoice, moveId);

    const moveData = {
      gameId,
      playerAddress,
      moveChoice,
      secretUUID: moveId,
      hashedMove
    };

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Move storage timeout")), 5000)
    );

    const moveSecretPromise = await storeMoveSecret(moveData);

    await Promise.race([moveSecretPromise, timeoutPromise]);

    let updatedData = { ...game.data };
    
    if (!updatedData.player1Address) {
      updatedData.player1Address = playerAddress;
      updatedData.player1Move = hashedMove;
    } else if (!updatedData.player2Address) {
      updatedData.player2Address = playerAddress;
      updatedData.player2Move = hashedMove;
      updatedData.status = "WAITING_FOR_REVEALS";
      updatedData.revealDeadline = new Date(Date.now() + 5 * 60000).toISOString();
    } else {
      throw new Error("Game is full");
    }

    await setDoc({
      collection: "game_collection",
      doc: {
        key: gameId,
        data: updatedData,
        version: game.version,
      },
    });

    return { success: true, moveId, updatedGame: updatedData };

  } catch (error) {
    console.error("Error in joinAndMove:", error);
    throw error;
  }
};

// Reveal move
export const revealMove = async (gameId, playerAddress, moveChoice, secretUUID) => {
  try {
    const game = await getGame(gameId);
    if (!game) throw new Error("Game not found");

    const hashedMove = hashMove(moveChoice, secretUUID);
    const moveSecret = await getDoc({
      collection: "move_secrets",
      key: secretUUID,
    });

    if (!moveSecret || moveSecret.data.hashedMove !== hashedMove) {
      throw new Error("Invalid move reveal");
    }

    let updatedData = { ...game.data };
    if (playerAddress === updatedData.player1Address) {
      updatedData.player1Revealed = true;
    } else if (playerAddress === updatedData.player2Address) {
      updatedData.player2Revealed = true;
    } else {
      throw new Error("Player not in this game");
    }

    if (updatedData.player1Revealed && updatedData.player2Revealed) {
      updatedData.status = "FINISHED";
    }

    await setDoc({
      collection: "game_collection",
      doc: {
        key: gameId,
        data: updatedData,
        version: game.version,
      },
    });

    const id = uuid();
    await setDoc({
      collection: "revealed_move",
      doc: {
        key: id,
        data: {
          id,
          gameId,
          playerAddress,
          moveChoice,
          hashedMove,
          revealedAt: new Date().toISOString(),
        },
        version: 0,
      },
    });

    return { success: true, updatedGame: updatedData };
  } catch (error) {
    console.error("Error revealing move:", error);
    throw error;
  }
};

// Update leaderboard stats
export const updateLeaderboard = async (playerAddress, gameResult, winnings) => {
  try {
    const existingStats = await getDoc({
      collection: "leaderboard",
      key: playerAddress,
    });

    let stats = {
      wins: 0,
      losses: 0,
      draws: 0,
      totalGames: 0,
      winStreak: 0,
      currentWinStreak: 0,
      totalWinnings: 0,
      lastGameAt: new Date().toISOString(),
    };

    if (existingStats) {
      stats = { ...existingStats.data.stats };
    }

    stats.totalGames += 1;
    if (gameResult === "win") {
      stats.wins += 1;
      stats.currentWinStreak += 1;
      stats.winStreak = Math.max(stats.winStreak, stats.currentWinStreak);
      stats.totalWinnings += winnings;
    } else if (gameResult === "loss") {
      stats.losses += 1;
      stats.currentWinStreak = 0;
    } else {
      stats.draws += 1;
    }

    await setDoc({
      collection: "leaderboard",
      doc: {
        key: playerAddress,
        data: {
          playerAddress,
          stats,
          updatedAt: new Date().toISOString(),
        },
        version: 0,
      },
    });

    return stats;
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    throw error;
  }
};

// Get game by ID
export const getGame = async (gameId) => {
  try {
    return await getDoc({
      collection: "game_collection",
      key: gameId,
    });
  } catch (error) {
    console.error("Error getting game:", error);
    throw error;
  }
};

// List active games
export const listActiveGames = async () => {
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

    return items.filter((game) => game.data.status === "WAITING_FOR_PLAYERS");
  } catch (error) {
    console.error("Error listing active games:", error);
    throw error;
  }
};

// Get player's moves for a game
export const getPlayerMoves = async (gameId, playerAddress) => {
  try {
    const { items } = await listDocs({
      collection: "move_secrets",
      filter: {
        order: {
          desc: true,
          field: "createdAt",
        },
      },
    });

    return items.filter(
      (move) =>
        move.data.gameId === gameId &&
        move.data.playerAddress === playerAddress,
    );
  } catch (error) {
    console.error("Error getting player moves:", error);
    throw error;
  }
};
