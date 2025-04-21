
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/types/game';
import GameCard from './GameCard';

const CARD_COUNT = 30;
const RADIUS = 120; // Reduced radius to keep cards within the table

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
    <div className="relative h-[400px] w-full max-w-3xl mx-auto"> 
      {/* Poker Table */}
      <div className="absolute inset-0 mx-auto">
        {/* Table legs */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full flex justify-between px-20">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="w-8 h-24 bg-gradient-to-b from-stone-600 to-stone-800"
              style={{ 
                transform: 'perspective(100px) rotateX(-5deg)',
                borderRadius: '4px'
              }}
            />
          ))}
        </div>
        
        {/* Table surface */}
        <div className="absolute inset-0 rounded-[100px] overflow-hidden">
          {/* Wooden border */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, #8B4513, #654321)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}>
            {/* Felt surface with sections */}
            <div className="absolute inset-[12px] rounded-[90px]" style={{
              background: '#246c3c',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
            }}>
              {/* Table sections */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full relative">
                  {/* Table markings */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[95%] h-[90%] border-2 border-yellow-500/20 rounded-[80px]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-[85%] h-[80%] border-2 border-yellow-500/20 rounded-[70px]" />
                    </div>
                  </div>
                  
                  {/* Cards */}
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
                              rotate: isSpread ? angle * (180 / Math.PI) + 90 : index * (2 / CARD_COUNT),
                              scale: 0.45,
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedCardStack;
