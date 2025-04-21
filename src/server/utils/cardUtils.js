
// Node.js compatible card utilities for the server

// Card deck generation
const createDeck = () => {
  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  
  const deck = [];
  
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
const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

// Deal cards to players
const dealCards = (deck, numPlayers, cardsPerPlayer) => {
  const hands = Array(numPlayers).fill(null).map(() => []);
  
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (let j = 0; j < numPlayers; j++) {
      if (deck.length > 0) {
        hands[j].push(deck.pop());
      }
    }
  }
  
  return hands;
};

// Determine winner of a trick
const determineTrickWinner = (
  cards,
  leadSuit,
  trumpSuit
) => {
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
const calculateScore = (bid, tricks) => {
  // 10 points + bid amount if exact bid is met
  if (bid === tricks) {
    return 10 + bid;
  }
  // 0 points if bid is not met
  return 0;
};

module.exports = {
  createDeck,
  shuffleDeck,
  dealCards,
  determineTrickWinner,
  calculateScore
};
