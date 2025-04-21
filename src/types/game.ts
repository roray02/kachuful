
export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type CardValue = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14; // 11=J, 12=Q, 13=K, 14=A

export interface Card {
  suit: Suit;
  value: CardValue;
  id: string; // unique identifier for animations
}

export type GamePhase = "waiting" | "bidding" | "playing" | "roundEnd" | "gameOver";

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isConnected: boolean;
  cards: Card[];
  bid?: number;
  tricks: number;
  score: number;
  isDealer: boolean;
  isCurrentTurn: boolean;
}

export interface Trick {
  cards: {playerId: string; card: Card}[];
  leadSuit?: Suit;
  winnerId?: string;
}

export interface GameState {
  gameId: string;
  phase: GamePhase;
  players: Player[];
  round: number;
  maxRounds: number;
  cardsPerRound: number;
  dealerIndex: number;
  currentPlayerIndex: number;
  trump?: Suit;
  currentTrick: Trick;
  pastTricks: Trick[];
  winner?: {
    id: string;
    name: string;
    score: number;
  };
  roundSummary?: {
    playerResults: {
      playerId: string;
      name: string;
      bid: number;
      tricks: number;
      roundScore: number;
      totalScore: number;
    }[];
  };
}

export interface GameAction {
  type: string;
  payload?: any;
}
