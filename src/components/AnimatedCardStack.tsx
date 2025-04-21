
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/types/game';
import GameCard from './GameCard';

const CARD_COUNT = 30;
const RADIUS = 150; // Reduced radius further to ensure cards stay in frame

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
    <div className="relative h-[500px] w-full max-w-4xl mx-auto"> {/* Increased height and added max-width */}
      <div className="absolute inset-0 mx-4 rounded-[120px] overflow-hidden" style={{
        background: 'linear-gradient(to bottom, #1a1f2c, #222222)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}>
        <div className="absolute inset-[12px] rounded-[110px]" style={{
          background: '#246c3c', // Classic poker felt green
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
        }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence>
              {cards.map((card, index) => {
                const angle = (index * (360 / CARD_COUNT)) * (Math.PI / 180);
                const x = Math.cos(angle) * RADIUS;
                const y = Math.sin(angle) * RADIUS;

                return (
                  <motion.div
                    key={card.id}
                    className="absolute"
                    initial={{ 
                      x: 0, 
                      y: 0, 
                      rotate: 0, 
                      scale: 0.6, 
                      zIndex: CARD_COUNT - index 
                    }}
                    animate={{
                      x: isSpread ? x : 0,
                      y: isSpread ? y : 0,
                      rotate: isSpread ? angle * (180 / Math.PI) + 90 : 0,
                      scale: 0.5,
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
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedCardStack;
