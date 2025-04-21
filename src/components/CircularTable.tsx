import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player, Trick, Card as CardType } from "@/types/game";
import GameCard from "./GameCard";
import { cn } from "@/lib/utils";

interface CircularTableProps {
  players: Player[];
  currentPlayerId: string;
  currentTrick: Trick;
  trickWinnerId?: string;
  onTrickComplete?: () => void;
}

const CircularTable: React.FC<CircularTableProps> = ({
  players,
  currentPlayerId,
  currentTrick,
  trickWinnerId,
  onTrickComplete
}) => {
  const [animationComplete, setAnimationComplete] = useState(false);

  // Reset animation state when trick changes
  useEffect(() => {
    if (currentTrick.cards.length === 0) {
      setAnimationComplete(false);
    }
  }, [currentTrick]);

  // Trigger the trick completion callback
  useEffect(() => {
    if (trickWinnerId && animationComplete) {
      const timer = setTimeout(() => {
        onTrickComplete?.();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [trickWinnerId, animationComplete, onTrickComplete]);

  // Find the position of each player relative to the current player
  const getPlayerPositions = () => {
    const currentPlayerIndex = players.findIndex(p => p.id === currentPlayerId);
    if (currentPlayerIndex === -1) return [];
    
    const positions = [];
    const totalPlayers = players.length;
    
    for (let i = 0; i < totalPlayers; i++) {
      // Calculate relative position (0 = current player, 1 = next player, etc.)
      const relativePosition = (i - currentPlayerIndex + totalPlayers) % totalPlayers;
      positions.push({
        player: players[i],
        position: relativePosition,
      });
    }
    
    return positions;
  };

  const playerPositions = getPlayerPositions();

  // Calculate position on the circle for each player
  const getPositionStyle = (position: number, totalPlayers: number) => {
    // Current player is at the bottom (position 0)
    // Other players are distributed around the top of the circle
    if (position === 0) {
      return {
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
      };
    }
    
    // Calculate angle (excluding the bottom segment which is for the current player)
    const angleRange = 210; // degrees, leaving space at the bottom
    const startAngle = -180 + (180 - angleRange) / 2; // center the arc at the top
    
    const angle = startAngle + (position / (totalPlayers - 1)) * angleRange;
    const radians = (angle * Math.PI) / 180;
    
    // Position on circle
    const x = 50 + 45 * Math.cos(radians); // 50% is center, 45% is radius
    const y = 50 + 45 * Math.sin(radians);
    
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
    };
  };

  // Find the card played by a specific player in the current trick
  const getPlayerCard = (playerId: string) => {
    return currentTrick.cards.find(c => c.playerId === playerId)?.card;
  };

  // Handle animation completion
  const handleCardAnimationComplete = () => {
    if (trickWinnerId && currentTrick.cards.length === players.length) {
      setAnimationComplete(true);
    }
  };

  return (
    <div className="relative w-full h-[500px] rounded-full overflow-hidden">
      {/* Table background */}
      <div className="absolute inset-0 bg-green-700 border-8 border-amber-900 rounded-full shadow-inner" />
      
      {/* Players around the table */}
      {playerPositions.map(({ player, position }) => {
        const style = getPositionStyle(position, players.length);
        const playedCard = getPlayerCard(player.id);
        
        return (
          <div 
            key={player.id} 
            className="absolute"
            style={style as any}
          >
            {/* Player avatar */}
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2",
              player.isCurrentTurn ? "border-yellow-400 animate-pulse" : "border-white",
              player.isDealer ? "bg-purple-600" : "bg-blue-600"
            )}>
              <div className="flex flex-col items-center">
                <span>{player.name.substring(0, 2)}</span>
                {player.isDealer && <span className="text-xs">D</span>}
              </div>
            </div>
            
            {/* Player info */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-center text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded-full whitespace-nowrap">
              <div>{player.name}</div>
              <div>
                {player.bid !== undefined ? `Bid: ${player.bid}` : ''}
                {player.bid !== undefined && player.tricks > 0 ? ' | ' : ''}
                {player.tricks > 0 ? `Tricks: ${player.tricks}` : ''}
              </div>
              <div>Score: {player.score}</div>
            </div>
          </div>
        );
      })}
      
      {/* Cards in the center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <AnimatePresence>
          {currentTrick.cards.map(({ playerId, card }) => {
            const playerIndex = players.findIndex(p => p.id === playerId);
            const playerPosition = playerPositions.find(p => p.player.id === playerId)?.position || 0;
            
            // Calculate position to animate from (player's position)
            const startPosition = getPositionStyle(playerPosition, players.length);
            
            // Whether this card is the winner
            const isWinner = trickWinnerId === playerId && animationComplete;
            
            // Find winner position for animation
            const winnerPosition = playerPositions.find(p => p.player.id === trickWinnerId)?.position || 0;
            const winnerStyle = getPositionStyle(winnerPosition, players.length);
            
            return (
              <motion.div
                key={card.id}
                initial={{
                  x: startPosition.left ? parseFloat(startPosition.left as string) - 50 : 0,
                  y: startPosition.top ? parseFloat(startPosition.top as string) - 50 : 0,
                  opacity: 0,
                  scale: 0.5,
                  rotate: (Math.random() * 20 - 10),
                }}
                animate={isWinner ? {
                  x: winnerStyle.left ? parseFloat(winnerStyle.left as string) - 50 : 0,
                  y: winnerStyle.top ? parseFloat(winnerStyle.top as string) - 50 : 0,
                  opacity: 1,
                  scale: 0.8,
                  rotate: 0,
                  transition: { 
                    duration: 0.5,
                    type: "spring" 
                  }
                } : {
                  x: (playerIndex - players.length / 2) * 20,
                  y: 0,
                  opacity: 1,
                  scale: 0.8,
                  rotate: (playerIndex - players.length / 2) * 5,
                  transition: { duration: 0.5 }
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                onAnimationComplete={handleCardAnimationComplete}
                style={{ position: 'absolute' }}
              >
                <GameCard card={card} playable={false} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CircularTable;
