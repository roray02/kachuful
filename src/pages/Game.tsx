
import { useEffect, useState, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { GameState, Player, Trick, Card as CardType } from "@/types/game";
import CircularTable from "@/components/CircularTable";
import PlayerHand from "@/components/PlayerHand";
import BiddingControls from "@/components/BiddingControls";
import RoundSummary from "@/components/RoundSummary";
import { Button } from "@/components/ui/button";
import useGameSocket from "@/hooks/useGameSocket";
import { toast } from "@/components/ui/sonner";

const Game = () => {
  const location = useLocation();
  const { lobbyCode } = useParams();
  const navigate = useNavigate();
  
  const [showRoundSummary, setShowRoundSummary] = useState(false);
  const [gameStateLocal, setGameStateLocal] = useState<GameState | null>(null);
  
  // Set up socket connection with game state updates
  const {
    connected,
    gameState,
    playerId,
    makeBid,
    playCard,
    startGame,
    startNextRound
  } = useGameSocket({
    onGameStateUpdate: (updatedGameState) => {
      setGameStateLocal(updatedGameState);
      
      // Show round summary when round ends
      if (updatedGameState.phase === "roundEnd") {
        setShowRoundSummary(true);
      }
    }
  });
  
  // When connecting to an existing game
  useEffect(() => {
    // If we don't have a gameState from the connection but we have initial state from navigation
    if (!gameState && location.state?.gameState) {
      setGameStateLocal(location.state.gameState);
    }
  }, [gameState, location.state]);
  
  // If we don't have a game state or player data, redirect to join page
  useEffect(() => {
    if (!gameStateLocal && !location.state) {
      navigate("/join");
    }
  }, [gameStateLocal, location.state, navigate]);
  
  // Get the current player
  const currentPlayer = gameStateLocal?.players.find(player => player.id === playerId);
  
  // Calculate total bids made so far
  const totalBidsMade = gameStateLocal?.players.reduce(
    (total, player) => total + (player.bid ?? 0),
    0
  ) ?? 0;
  
  // Handle bidding
  const handleBid = (bid: number) => {
    if (!currentPlayer) return;
    
    makeBid(bid);
    toast.success(`You bid ${bid}`);
  };
  
  // Handle playing a card
  const handlePlayCard = (card: CardType) => {
    if (!currentPlayer) return;
    
    playCard(card.id);
  };
  
  // Handle trick completion
  const handleTrickComplete = useCallback(() => {
    // This is now handled automatically by the server
  }, []);
  
  // Handle starting the next round
  const handleNextRound = () => {
    setShowRoundSummary(false);
    startNextRound();
  };
  
  // Handle starting the game (host only)
  const handleStartGame = () => {
    if (!currentPlayer?.isHost) return;
    
    startGame();
  };
  
  // Get the next dealer's name
  const getNextDealerName = () => {
    if (!gameStateLocal) return "";
    
    const nextDealerIndex = (gameStateLocal.dealerIndex + 1) % gameStateLocal.players.length;
    return gameStateLocal.players[nextDealerIndex].name;
  };
  
  // Get game status message
  const getGameStatus = () => {
    if (!gameStateLocal) return "Connecting to game...";
    
    switch (gameStateLocal.phase) {
      case "waiting":
        return "Waiting for players to join...";
      case "bidding":
        return `Round ${gameStateLocal.round}: Bidding phase`;
      case "playing":
        return `Round ${gameStateLocal.round}: Playing phase`;
      case "roundEnd":
        return `Round ${gameStateLocal.round} complete`;
      case "gameOver":
        return `Game Over! ${gameStateLocal.winner?.name} wins!`;
      default:
        return "";
    }
  };
  
  // If we don't have game state yet, show loading
  if (!gameStateLocal) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl">Connecting to game...</h2>
          <p className="mt-2 text-indigo-300">Please wait</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 text-white p-4">
      <div className="container mx-auto">
        {/* Game header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">Kachufool</h1>
            <p className="text-yellow-200">Lobby: {lobbyCode}</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{getGameStatus()}</div>
            {gameStateLocal.trump && (
              <div className="text-sm">Trump: {gameStateLocal.trump}</div>
            )}
          </div>
          <div>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="border-red-500 text-red-500 hover:bg-red-900"
            >
              Leave Game
            </Button>
          </div>
        </div>
        
        {/* Players list in waiting phase */}
        {gameStateLocal.phase === "waiting" && (
          <div className="bg-indigo-800 rounded-lg p-4 mb-6">
            <h2 className="text-xl text-center mb-4 text-yellow-300">Players</h2>
            <ul className="space-y-2">
              {gameStateLocal.players.map(player => (
                <li 
                  key={player.id} 
                  className="flex justify-between items-center bg-indigo-700 p-3 rounded"
                >
                  <span>{player.name} {player.isHost ? "(Host)" : ""}</span>
                  <span className={player.isConnected ? "text-green-400" : "text-red-400"}>
                    {player.isConnected ? "Connected" : "Disconnected"}
                  </span>
                </li>
              ))}
            </ul>
            
            {/* Start game button for host */}
            {currentPlayer?.isHost && (
              <div className="mt-4 text-center">
                <Button
                  onClick={handleStartGame}
                  disabled={gameStateLocal.players.length < 3}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Start Game
                </Button>
                {gameStateLocal.players.length < 3 && (
                  <p className="text-sm text-yellow-300 mt-2">
                    Need at least 3 players to start
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Game table */}
        {gameStateLocal.phase !== "waiting" && (
          <div className="mb-6">
            <CircularTable
              players={gameStateLocal.players}
              currentPlayerId={playerId ?? ""}
              currentTrick={gameStateLocal.currentTrick}
              trickWinnerId={gameStateLocal.currentTrick.winnerId}
              onTrickComplete={handleTrickComplete}
            />
          </div>
        )}
        
        {/* Bidding controls */}
        {gameStateLocal.phase === "bidding" && currentPlayer?.isCurrentTurn && (
          <div className="mb-6">
            <BiddingControls
              maxBid={gameStateLocal.cardsPerRound}
              totalBidsMade={totalBidsMade}
              totalTricks={gameStateLocal.cardsPerRound}
              isDealer={currentPlayer.isDealer}
              onBid={handleBid}
            />
          </div>
        )}
        
        {/* Player hand */}
        {currentPlayer && gameStateLocal.phase !== "waiting" && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2 text-center text-yellow-300">Your Hand</h2>
            <PlayerHand
              cards={currentPlayer.cards}
              onPlayCard={handlePlayCard}
              isCurrentTurn={gameStateLocal.phase === "playing" && currentPlayer.isCurrentTurn}
              leadSuit={gameStateLocal.currentTrick.leadSuit}
            />
          </div>
        )}
        
        {/* Round summary */}
        {gameStateLocal.roundSummary && (
          <RoundSummary
            open={showRoundSummary}
            onClose={handleNextRound}
            round={gameStateLocal.round}
            playerResults={gameStateLocal.roundSummary.playerResults}
            nextDealerName={getNextDealerName()}
          />
        )}
      </div>
    </div>
  );
};

export default Game;
