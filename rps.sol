// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

contract RockPaperScissors {
    enum GameState {
        WAITING_FOR_PLAYERS,
        WAITING_FOR_REVEALS,
        READY_FOR_OUTCOME,
        FINISHED
    }

    event logThis(string msg);

    address public player1 = address(0);
    address public player2 = address(0);

    bytes32 public player1Move;
    bytes32 public player2Move;

    uint8 public player1Actual = 0;
    uint8 public player2Actual = 0;

    GameState public currentState = GameState.WAITING_FOR_PLAYERS;
    uint256 public revealDeadline;

    function commitMove(bytes32 _move) public payable {
        require(
            currentState == GameState.WAITING_FOR_PLAYERS,
            "Game not in commit phase"
        );
        require(msg.value == 1 ether, "Must send exact bet amount");

        if (player1 == address(0)) {
            player1 = msg.sender;
            player1Move = _move;
        } else if (player2 == address(0)) {
            require(msg.sender != player1, "Same player cannot play twice");
            player2 = msg.sender;
            player2Move = _move;
            currentState = GameState.WAITING_FOR_REVEALS;
            revealDeadline = block.timestamp + 5 minutes;
        }
    }

    // 1 rock
    // 2 paper
    // 3 scissors
    function revealMove(uint8 _actualMove, string calldata secret) public {
        require(
            currentState == GameState.WAITING_FOR_REVEALS,
            "Not in reveal phase"
        );
        require(_actualMove >= 1 && _actualMove <= 3, "Invalid move");

        bytes32 moveToBeRevealed = keccak256(
            abi.encodePacked(_actualMove, secret)
        );

        if (moveToBeRevealed == player1Move && msg.sender == player1) {
            player1Actual = _actualMove;
        } else if (moveToBeRevealed == player2Move && msg.sender == player2) {
            player2Actual = _actualMove;
        }

        if (player1Actual != 0 && player2Actual != 0) {
            currentState = GameState.READY_FOR_OUTCOME;
        }
    }

    function determineWinner() public {
        require(
            currentState == GameState.READY_FOR_OUTCOME,
            "Not ready for outcome"
        );
        require(player1Actual != 0 && player2Actual != 0, "Moves not revealed");

        if (player1Actual == player2Actual) {
            // Draw - return bets to both players
            emit logThis("It was a draw");
            payable(player1).transfer(1 ether);
            payable(player2).transfer(1 ether);
        } else if (
            (player1Actual == 1 && player2Actual == 3) || // Rock beats Scissors
            (player1Actual == 2 && player2Actual == 1) || // Paper beats Rock
            (player1Actual == 3 && player2Actual == 2) // Scissors beats Paper
        ) {
            // Player 1 wins
            emit logThis("Player 1 wins");
            payable(player1).transfer(2 ether);
        } else {
            // Player 2 wins
            emit logThis("Player 2 wins");
            payable(player2).transfer(2 ether);
        }

        resetGame();
    }

    function resetGame() private {
        player1 = address(0);
        player2 = address(0);
        player1Move = bytes32(0);
        player2Move = bytes32(0);
        player1Actual = 0;
        player2Actual = 0;
        currentState = GameState.WAITING_FOR_PLAYERS;
        revealDeadline = 0;
    }

    function timeoutGame() public {
        require(block.timestamp > revealDeadline, "Timeout period not reached");
        require(
            currentState == GameState.WAITING_FOR_REVEALS,
            "Not in reveal phase"
        );

        if (player1Actual != 0 && player2Actual == 0) {
            // Player 1 revealed, Player 2 didn't - Player 1 wins
            emit logThis("Player 1 wins by timeout");
            payable(player1).transfer(2 ether);
        } else if (player1Actual == 0 && player2Actual != 0) {
            // Player 2 revealed, Player 1 didn't - Player 2 wins
            emit logThis("Player 2 wins by timeout");
            payable(player2).transfer(2 ether);
        } else {
            // Neither revealed - return bets
            emit logThis("Both players timed out, bet returned");
            payable(player1).transfer(1 ether);
            payable(player2).transfer(1 ether);
        }

        resetGame();
    }
}
