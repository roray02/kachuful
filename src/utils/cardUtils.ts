
import { Card, CardValue, Suit } from "@/types/game";

// Card deck generation
export const createDeck = (): Card[] => {
  const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
  const values: CardValue[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  
  const deck: Card[] = [];
  
  for (const suit of suits) {
    for (const value of values) {
      deck.push({
        suit,
        value,
        id: `${suit}_${value}`
      });
    }
  }
  
  return deck;
};

// Fisher-Yates shuffle
export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

// Deal cards to players
export const dealCards = (deck: Card[], numPlayers: number, cardsPerPlayer: number): Card[][] => {
  const hands: Card[][] = Array(numPlayers).fill(null).map(() => []);
  
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (let j = 0; j < numPlayers; j++) {
      if (deck.length > 0) {
        hands[j].push(deck.pop()!);
      }
    }
  }
  
  return hands;
};

// Get card display label (A, K, Q, J or number)
export const getCardLabel = (value: CardValue): string => {
  switch (value) {
    case 14: return 'A';
    case 13: return 'K';
    case 12: return 'Q';
    case 11: return 'J';
    default: return String(value);
  }
};

// Get suit symbol
export const getSuitSymbol = (suit: Suit): string => {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
  }
};

// Get suit color
export const getSuitColor = (suit: Suit): string => {
  return (suit === 'hearts' || suit === 'diamonds') ? 'text-red-600' : 'text-black';
};

// Check if card can be played
export const canPlayCard = (
  card: Card,
  hand: Card[],
  leadSuit: Suit | undefined
): boolean => {
  // If no lead suit, any card can be played
  if (!leadSuit) return true;
  
  // If card matches lead suit, it can be played
  if (card.suit === leadSuit) return true;
  
  // If player has no cards of lead suit, any card can be played
  const hasLeadSuit = hand.some(c => c.suit === leadSuit);
  return !hasLeadSuit;
};

// Determine winner of a trick
export const determineTrickWinner = (
  cards: { playerId: string; card: Card }[],
  leadSuit: Suit,
  trumpSuit?: Suit
): string => {
  if (cards.length === 0) {
    return '';
  }
  
  let winningCard = cards[0];
  
  for (let i = 1; i < cards.length; i++) {
    const card = cards[i];
    
    // Trump card beats any non-trump card
    if (trumpSuit && card.card.suit === trumpSuit && winningCard.card.suit !== trumpSuit) {
      winningCard = card;
    }
    // Higher trump card beats lower trump card
    else if (
      trumpSuit && 
      card.card.suit === trumpSuit && 
      winningCard.card.suit === trumpSuit && 
      card.card.value > winningCard.card.value
    ) {
      winningCard = card;
    }
    // Card of lead suit beats card not of lead suit (unless trumped)
    else if (
      card.card.suit === leadSuit && 
      winningCard.card.suit !== leadSuit && 
      (trumpSuit ? winningCard.card.suit !== trumpSuit : true)
    ) {
      winningCard = card;
    }
    // Higher card of lead suit beats lower card of lead suit
    else if (
      card.card.suit === leadSuit && 
      winningCard.card.suit === leadSuit && 
      card.card.value > winningCard.card.value
    ) {
      winningCard = card;
    }
  }
  
  return winningCard.playerId;
};

// Calculate score for a player based on bid and tricks
export const calculateScore = (bid: number, tricks: number): number => {
  // 10 points + bid amount if exact bid is met
  if (bid === tricks) {
    return 10 + bid;
  }
  // 0 points if bid is not met
  return 0;
};
