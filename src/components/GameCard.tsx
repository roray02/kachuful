
import { Card as CardType } from "@/types/game";
import { getSuitSymbol, getCardLabel, getSuitColor } from "@/utils/cardUtils";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GameCardProps {
  card: CardType;
  onClick?: () => void;
  playable?: boolean;
  isSelected?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const GameCard: React.FC<GameCardProps> = ({
  card,
  onClick,
  playable = true,
  isSelected = false,
  className,
  style
}) => {
  const suitSymbol = getSuitSymbol(card.suit);
  const cardLabel = getCardLabel(card.value);
  const suitColor = getSuitColor(card.suit);
  
  return (
    <motion.div
      className={cn(
        "relative w-20 h-32 rounded-xl shadow-md overflow-hidden transition-all duration-150",
        playable ? "cursor-pointer hover:-translate-y-2" : "opacity-75",
        isSelected ? "-translate-y-4" : "",
        "bg-white border-2",
        isSelected ? "border-yellow-400" : "border-gray-300",
        className
      )}
      whileHover={playable ? { y: -8 } : {}}
      whileTap={playable ? { scale: 0.97 } : {}}
      onClick={playable ? onClick : undefined}
      style={style}
      layout
    >
      <div className={cn("flex justify-between p-1", suitColor)}>
        <div className="text-lg font-bold">{cardLabel}</div>
        <div className="text-lg">{suitSymbol}</div>
      </div>

      <div className={cn("flex justify-center items-center h-12 text-4xl mt-2", suitColor)}>
        {suitSymbol}
      </div>

      <div className={cn("flex justify-between p-1 absolute bottom-0 left-0 right-0 rotate-180", suitColor)}>
        <div className="text-lg font-bold">{cardLabel}</div>
        <div className="text-lg">{suitSymbol}</div>
      </div>
    </motion.div>
  );
};

export default GameCard;
