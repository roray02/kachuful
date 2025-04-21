
import { useEffect, useState, useReducer, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Card, GameState, GameAction, Player, Trick, Card as CardType } from "@/types/game";
import CircularTable from "@/components/CircularTable";
import PlayerHand from "@/components/PlayerHand";
import BiddingControls from "@/components/BiddingControls";
import RoundSummary from "@/components/RoundSummary";
import { Button } from "@/components/ui/button";
import { createDeck, shuffleDeck, dealCards, determineTrickWinner, calculateScore } from "@/utils/cardUtils";
import { toast } from "@/components/ui/sonner";

// Mock data for development - in real app this would come from the server
const initialGameState: GameState = {
  gameId: "",
  phase: "waiting",
  players: [],
  round: 1,
  maxRounds: 10,
  cardsPerRound: 5,
  dealerIndex: 0,
  currentPlayerIndex: 1, // First bidder is player after dealer
  currentTrick: { cards: [] },
  pastTricks: [],
};

// Reducer to handle game state updates
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "INITIALIZE_GAME": {
      const { gameId, players, cardsPerRound } = action.payload;
      return {
        ...state,
        gameId,
        players,
        cardsPerRound,
        phase: players.length >= 3 ? "bidding" : "waiting",
      };
    }
    
    case "ADD_PLAYER": {
      const newPlayer = action.payload;
      const players = [...state.players, newPlayer];
      return {
        ...state,
        players,
        phase: players.length >= 3 ? "bidding" : "waiting",
      };
    }
    
    case "START_ROUND": {
      const { players } = action.payload;
      return {
        ...state,
        players,
        phase: "bidding",
        currentPlayerIndex: (state.dealerIndex + 1) % players.length,
        currentTrick: { cards: [] },
        pastTricks: [],
      };
    }
    
    case "MAKE_BID": {
      const { playerId, bid } = action.payload;
      const players = state.players.map(player => 
        player.id === playerId 
          ? { ...player, bid, isCurrentTurn: false } 
          : player
      );
      
      // Find the next player to bid
      let nextPlayerIndex = (state.currentPlayerIndex + 1) % players.length;
      
      // Check if all players have bid
      const allPlayersBid = players.every(player => player.bid !== undefined);
      
      if (allPlayersBid) {
        // All players have bid, move to playing phase
        // Set the first player (after dealer) to start playing
        nextPlayerIndex = (state.dealerIndex + 1) % players.length;
        
        // Update all players' current turn status
        players.forEach((player, index) => {
          player.isCurrentTurn = index === nextPlayerIndex;
        });
        
        return {
          ...state,
          players,
          phase: "playing",
          currentPlayerIndex: nextPlayerIndex,
        };
      } else {
        // Update next player's turn
        players.forEach((player, index) => {
          player.isCurrentTurn = index === nextPlayerIndex;
        });
        
        return {
          ...state,
          players,
          currentPlayerIndex: nextPlayerIndex,
        };
      }
    }
    
    case "PLAY_CARD": {
      const { playerId, card } = action.payload;
      
      // Remove the card from the player's hand
      const players = state.players.map(player => 
        player.id === playerId 
          ? { 
              ...player, 
              cards: player.cards.filter(c => c.id !== card.id),
              isCurrentTurn: false
            } 
          : player
      );
      
      // Add the card to the current trick
      const currentTrick: Trick = {
        ...state.currentTrick,
        cards: [...state.currentTrick.cards, { playerId, card }],
        leadSuit: state.currentTrick.leadSuit || card.suit
      };
      
      // Check if the trick is complete
      if (currentTrick.cards.length === players.length) {
        // Determine winner
        const winnerId = determineTrickWinner(
          currentTrick.cards, 
          currentTrick.leadSuit!, 
          state.trump
        );
        
        currentTrick.winnerId = winnerId;
        
        // Increment the winner's trick count
        players.forEach(player => {
          if (player.id === winnerId) {
            player.tricks += 1;
          }
        });
        
        return {
          ...state,
          players,
          currentTrick,
          currentPlayerIndex: players.findIndex(p => p.id === winnerId),
        };
      } else {
        // Move to the next player
        const nextPlayerIndex = (state.currentPlayerIndex + 1) % players.length;
        
        // Update next player's turn
        players.forEach((player, index) => {
          player.isCurrentTurn = index === nextPlayerIndex;
        });
        
        return {
          ...state,
          players,
          currentTrick,
          currentPlayerIndex: nextPlayerIndex,
        };
      }
    }
    
    case "COMPLETE_TRICK": {
      // Move the current trick to past tricks
      const pastTricks = [...state.pastTricks, state.currentTrick];
      
      // Check if the round is over (all cards played)
      const allCardsPlayed = state.players.every(player => player.cards.length === 0);
      
      if (allCardsPlayed) {
        // Calculate scores for the round
        const players = state.players.map(player => {
          const roundScore = calculateScore(player.bid!, player.tricks);
          return {
            ...player,
            score: player.score + roundScore,
            isCurrentTurn: false,
          };
        });
        
        // Prepare round summary
        const roundSummary = {
          playerResults: players.map(player => ({
            playerId: player.id,
            name: player.name,
            bid: player.bid!,
            tricks: player.tricks,
            roundScore: calculateScore(player.bid!, player.tricks),
            totalScore: player.score,
          })),
        };
        
        return {
          ...state,
          players,
          currentTrick: { cards: [] },
          pastTricks,
          phase: "roundEnd",
          roundSummary,
        };
      } else {
        // Start a new trick
        // The winner of the previous trick leads
        const winnerId = state.currentTrick.winnerId!;
        const winnerIndex = state.players.findIndex(p => p.id === winnerId);
        
        // Update players' turn
        const players = state.players.map((player, index) => ({
          ...player,
          isCurrentTurn: index === winnerIndex,
        }));
        
        return {
          ...state,
          players,
          currentTrick: { cards: [] },
          pastTricks,
          currentPlayerIndex: winnerIndex,
        };
      }
    }
    
    case "START_NEXT_ROUND": {
      // Rotate dealer
      const newDealerIndex = (state.dealerIndex + 1) % state.players.length;
      
      // Reset player bids and tricks
      const players = state.players.map((player, index) => ({
        ...player,
        bid: undefined,
        tricks: 0,
        isDealer: index === newDealerIndex,
        isCurrentTurn: index === (newDealerIndex + 1) % state.players.length,
        // In a real app, we would deal new cards here
        cards: [],
      }));
      
      // Deal cards
      const deck = shuffleDeck(createDeck());
      const hands = dealCards(deck, players.length, state.cardsPerRound);
      
      players.forEach((player, index) => {
        player.cards = hands[index];
      });
      
      return {
        ...state,
        players,
        round: state.round + 1,
        dealerIndex: newDealerIndex,
        currentPlayerIndex: (newDealerIndex + 1) % players.length,
        phase: "bidding",
        currentTrick: { cards: [] },
        pastTricks: [],
        roundSummary: undefined,
      };
    }
    
    default:
      return state;
  }
};

const Game = () => {
  const location = useLocation();
  const { lobbyCode } = useParams();
  const navigate = useNavigate();
  
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [playerId, setPlayerId] = useState<string>("");
  const [showRoundSummary, setShowRoundSummary] = useState(false);
  
  // Initialize game on component mount
  useEffect(() => {
    // In a real app, this would fetch the game state from the server
    // For now, we'll create a mock game with the current player
    
    const playerData = location.state;
    
    if (!playerData || !playerData.playerName) {
      // Redirect to join page if no player data
      navigate("/join");
      return;
    }
    
    // Create a unique ID for the player
    const newPlayerId = `player_${Date.now()}`;
    setPlayerId(newPlayerId);
    
    // Create the initial player
    const newPlayer: Player = {
      id: newPlayerId,
      name: playerData.playerName,
      isHost: playerData.isHost || false,
      isConnected: true,
      cards: [],
      tricks: 0,
      score: 0,
      isDealer: true, // First player is dealer in this demo
      isCurrentTurn: false,
    };
    
    // In a real app, we would fetch existing players
    // For now, we'll add some fake players for testing
    const fakePlayers: Player[] = [
      newPlayer,
      {
        id: "player_2",
        name: "Alice",
        isHost: false,
        isConnected: true,
        cards: [],
        tricks: 0,
        score: 0,
        isDealer: false,
        isCurrentTurn: true,
      },
      {
        id: "player_3",
        name: "Bob",
        isHost: false,
        isConnected: true,
        cards: [],
        tricks: 0,
        score: 0,
        isDealer: false,
        isCurrentTurn: false,
      },
      {
        id: "player_4",
        name: "Charlie",
        isHost: false,
        isConnected: true,
        cards: [],
        tricks: 0,
        score: 0,
        isDealer: false,
        isCurrentTurn: false,
      },
    ];
    
    // Deal cards
    const deck = shuffleDeck(createDeck());
    const cardsPerRound = 5;
    const hands = dealCards(deck, fakePlayers.length, cardsPerRound);
    
    fakePlayers.forEach((player, index) => {
      player.cards = hands[index];
    });
    
    // Initialize the game
    dispatch({
      type: "INITIALIZE_GAME",
      payload: {
        gameId: lobbyCode,
        players: fakePlayers,
        cardsPerRound,
      },
    });
  }, [location.state, lobbyCode, navigate]);
  
  // Get the current player
  const currentPlayer = gameState.players.find(player => player.id === playerId);
  
  // Calculate total bids made so far
  const totalBidsMade = gameState.players.reduce(
    (total, player) => total + (player.bid ?? 0),
    0
  );
  
  // Handle bidding
  const handleBid = (bid: number) => {
    if (!currentPlayer) return;
    
    dispatch({
      type: "MAKE_BID",
      payload: {
        playerId: currentPlayer.id,
        bid,
      },
    });
    
    toast.success(`You bid ${bid}`);
  };
  
  // Handle playing a card
  const handlePlayCard = (card: CardType) => {
    if (!currentPlayer) return;
    
    dispatch({
      type: "PLAY_CARD",
      payload: {
        playerId: currentPlayer.id,
        card,
      },
    });
  };
  
  // Handle trick completion
  const handleTrickComplete = useCallback(() => {
    dispatch({
      type: "COMPLETE_TRICK",
    });
  }, []);
  
  // Show round summary when round ends
  useEffect(() => {
    if (gameState.phase === "roundEnd") {
      setShowRoundSummary(true);
    }
  }, [gameState.phase]);
  
  // Handle starting the next round
  const handleNextRound = () => {
    setShowRoundSummary(false);
    
    // Start the next round
    dispatch({
      type: "START_NEXT_ROUND",
    });
  };
  
  // Get the next dealer's name
  const getNextDealerName = () => {
    const nextDealerIndex = (gameState.dealerIndex + 1) % gameState.players.length;
    return gameState.players[nextDealerIndex].name;
  };
  
  // Get game status message
  const getGameStatus = () => {
    switch (gameState.phase) {
      case "waiting":
        return "Waiting for players to join...";
      case "bidding":
        return `Round ${gameState.round}: Bidding phase`;
      case "playing":
        return `Round ${gameState.round}: Playing phase`;
      case "roundEnd":
        return `Round ${gameState.round} complete`;
      default:
        return "";
    }
  };
  
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
            {gameState.trump && (
              <div className="text-sm">Trump: {gameState.trump}</div>
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
        
        {/* Game table */}
        <div className="mb-6">
          <CircularTable
            players={gameState.players}
            currentPlayerId={playerId}
            currentTrick={gameState.currentTrick}
            trickWinnerId={gameState.currentTrick.winnerId}
            onTrickComplete={handleTrickComplete}
          />
        </div>
        
        {/* Bidding controls */}
        {gameState.phase === "bidding" && currentPlayer?.isCurrentTurn && (
          <div className="mb-6">
            <BiddingControls
              maxBid={gameState.cardsPerRound}
              totalBidsMade={totalBidsMade}
              totalTricks={gameState.cardsPerRound}
              isDealer={currentPlayer.isDealer}
              onBid={handleBid}
            />
          </div>
        )}
        
        {/* Player hand */}
        {currentPlayer && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2 text-center text-yellow-300">Your Hand</h2>
            <PlayerHand
              cards={currentPlayer.cards}
              onPlayCard={handlePlayCard}
              isCurrentTurn={gameState.phase === "playing" && currentPlayer.isCurrentTurn}
              leadSuit={gameState.currentTrick.leadSuit}
            />
          </div>
        )}
        
        {/* Round summary */}
        {gameState.roundSummary && (
          <RoundSummary
            open={showRoundSummary}
            onClose={handleNextRound}
            round={gameState.round}
            playerResults={gameState.roundSummary.playerResults}
            nextDealerName={getNextDealerName()}
          />
        )}
      </div>
    </div>
  );
};

export default Game;
