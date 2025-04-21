
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/types/game';
import GameCard from './GameCard';

const CARD_COUNT = 30;
const RADIUS = 200;

const AnimatedCardStack = () => {
  const [cards] = useState<Card[]>(() =>
    Array.from({ length: CARD_COUNT }, (_, i) => ({
      suit: ['hearts', 'diamonds', 'clubs', 'spades'][Math.floor(i / 8) % 4] as Card['suit'],
      value: ((i % 13) + 2) as Card['value'],
      id: `card-${i}`,
    }))
  );

  const [isSpread, setIsSpread] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSpread(prev => !prev);
    }, 4000); // Switch every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-96 w-full overflow-hidden">
      <AnimatePresence>
        {cards.map((card, index) => {
          const angle = (index * (360 / CARD_COUNT)) * (Math.PI / 180);
          const x = Math.cos(angle) * RADIUS;
          const y = Math.sin(angle) * RADIUS;

          return (
            <motion.div
              key={card.id}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={{ x: 0, y: 0, rotate: 0, scale: 0.8 }}
              animate={{
                x: isSpread ? x : 0,
                y: isSpread ? y : 0,
                rotate: isSpread ? angle * (180 / Math.PI) + 90 : 0,
                transition: {
                  duration: 1.5,
                  ease: "easeInOut",
                  delay: isSpread ? index * 0.02 : (CARD_COUNT - index) * 0.02,
                }
              }}
            >
              <GameCard
                card={card}
                playable={false}
                className="scale-75"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedCardStack;
