
import { useState } from "react";
import { Card as CardType } from "@/types/game";
import GameCard from "./GameCard";
import { canPlayCard } from "@/utils/cardUtils";
import { motion } from "framer-motion";

interface PlayerHandProps {
  cards: CardType[];
  onPlayCard: (card: CardType) => void;
  isCurrentTurn: boolean;
  leadSuit?: string;
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  onPlayCard,
  isCurrentTurn,
  leadSuit
}) => {
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

  const handleCardClick = (card: CardType) => {
    if (!isCurrentTurn) return;
    
    // Check if the card can be played
    const canPlay = canPlayCard(
      card, 
      cards, 
      leadSuit as any
    );
    
    if (!canPlay) {
      // TODO: Show toast or feedback
      return;
    }
    
    // Toggle selection
    if (selectedCard?.id === card.id) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  };

  const handlePlayCard = () => {
    if (selectedCard) {
      onPlayCard(selectedCard);
      setSelectedCard(null);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Cards */}
      <div className="relative flex justify-center items-end h-40 mb-4">
        <div className="flex justify-center items-end">
          {cards.map((card, index) => {
            // Calculate fan effect
            const offset = (index - (cards.length - 1) / 2) * 30;
            const rotation = (index - (cards.length - 1) / 2) * 5;
            const isCardPlayable = isCurrentTurn && canPlayCard(card, cards, leadSuit as any);
            
            return (
              <div
                key={card.id}
                style={{
                  transform: `translateX(${offset}px) rotate(${rotation}deg)`,
                  zIndex: index,
                  position: 'absolute',
                  transformOrigin: 'bottom center',
                }}
              >
                <GameCard
                  card={card}
                  playable={isCardPlayable}
                  isSelected={selectedCard?.id === card.id}
                  onClick={() => handleCardClick(card)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Play button */}
      {isCurrentTurn && selectedCard && (
        <motion.div 
          className="mt-4 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={handlePlayCard}
            className="px-6 py-2 bg-green-600 text-white rounded-full font-semibold shadow-lg hover:bg-green-700 transition-colors"
          >
            Play Card
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default PlayerHand;
