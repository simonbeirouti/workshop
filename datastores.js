export const datastores = {
  // Public game state
  game_collection: {
    permissions: {
      read: "public",
      write: "managed"
    },
    schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        status: {
          type: "string",
          enum: ["WAITING_FOR_PLAYERS", "WAITING_FOR_REVEALS", "FINISHED"]
        },
        betAmount: { type: "number" },
        createdAt: { type: "string" },
        revealDeadline: { type: ["string", "null"] },
        winner: { type: ["string", "null"] },
        player1Address: { type: ["string", "null"] },
        player2Address: { type: ["string", "null"] }
      }
    }
  },

  // Private moves (only visible to the player who made them)
  move_secrets: {
    permissions: {
      read: "private",
      write: "private"
    },
    schema: {
      type: "object",
      properties: {
        gameId: { type: "string" },
        playerAddress: { type: "string" },
        moveChoice: { type: "number" },
        hashedMove: { type: "string" },
        timestamp: { type: "string" }
      },
      required: ["gameId", "playerAddress", "moveChoice", "hashedMove"]
    }
  },

  // Public moves (after reveal)
  revealed_move: {
    permissions: {
      read: "public",
      write: "managed"
    },
    schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        gameId: { type: "string" },
        playerAddress: { type: "string" },
        moveChoice: { type: "number" },
        hashedMove: { type: "string" }, // To verify against original
        revealedAt: { type: "string" }
      }
    }
  },

  // Public leaderboard
  leaderboard: {
    permissions: {
      read: "public",
      write: "controllers"
    },
    schema: {
      type: "object",
      properties: {
        playerAddress: { type: "string" },
        stats: {
          type: "object",
          properties: {
            wins: { type: "number" },
            losses: { type: "number" },
            draws: { type: "number" },
            totalGames: { type: "number" },
            winStreak: { type: "number" },
            currentWinStreak: { type: "number" },
            totalWinnings: { type: "number" },
            lastGameAt: { type: "string" }
          }
        },
        rank: { type: "number" },
        updatedAt: { type: "string" }
      }
    }
  }
}