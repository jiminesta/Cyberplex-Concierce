
export enum TaskType {
  DeliverToTheatre,
  AnswerPhone,
}

export enum PhoneCallType {
  BuyTickets,
  RequestRefund,
  SeatSwap,
}

export interface PhoneCall {
  id: number;
  type: PhoneCallType;
  dialog: string;
  details: {
    ticketCount?: number;
    movie?: string;
  };
}

export interface Task {
  id: number;
  type: TaskType;
  description: string;
  patience: number;
  isNew?: boolean;
  items?: Item[];
  theatre?: number;
}

export enum Item {
  Ticket = 'Ticket',
  Soda = 'Soda',
  Water = 'Water',
  Beer = 'Beer',
  MixedDrink = 'MixedDrink',
  Icee = 'Icee',
  Milkshake = 'Milkshake',
  Ice = 'Ice',
}

export enum GuestState {
  Entering,
  WaitingForTicketCheck,
  WaitingToBuyTicket,
  WaitingForSecurityCheck,
  WaitingToOrder,
  WaitingForConcessions,
  WaitingForSeatSwap,
  LeavingHappy,
  LeavingAngry,
}

export interface Guest {
  id: number;
  state: GuestState;
  hasTicket: boolean;
  hasContrabandWater: boolean;
  order: Item[] | null;
  patience: number;
  position: { x: number; y: number };
  targetPosition: { x: number; y: number };
  dialog: string;
  name: string;
  dob: { month: number; day: number; year: number };
  idExpires: { month: number; day: number; year: number };
  preferredMovie?: string;
  ticketCount?: number;
  colors: {
    hair: string;
    skin: string;
    shirt: string;
    pants: string;
  };
  queue?: 'lobby' | 'ticket' | 'concessions' | 'bar' | 'swap' | 'main' | 'hold';
  spotIndex?: number;
  isPresale?: boolean;
}

export type Difficulty = 'Easy' | 'Standard' | 'Hard';

export interface DifficultySettings {
  PRESALE_TARGET: number;
  GUEST_SPAWN_RATE_MS: number;
  PATIENCE_TOTAL: number;
  PATIENCE_DECAY_RATE: number;
  MAX_WRITE_UPS: number;
  TIP_MULTIPLIER: number;
}

export interface FallingSnack {
  id: number;
  type: 'pretzel' | 'energy_drink';
  position: { x: number; y: number };
}

export interface GameState {
  score: number;
  presaleTarget: number;
  presaleHelped: number;
  gameStarted: boolean;
  isGameOver: boolean;
  crashedOut?: boolean;
  guests: Guest[];
  preparedItems: Item[];
  preparing: { [key in Item]?: 'prepare' | 'refill' };
  tips: number;
  writeUps: number;
  presaleAngryLeaves: number;
  firedReason?: string;
  sodaSyrupLevel: number;
  milkshakeIceCreamLevel: number;
  iceLevel: number;
  difficulty: Difficulty | null;
  difficultySettings: DifficultySettings | null;
  level: number;
  shift: number;
  endOfShiftPenalty: number;
  bartenderPosition: { x: number; y: number };
  bartenderTargetPosition: { x: number; y: number };
  bartenderEnergy: number;
  fallingSnacks: FallingSnack[];
  presaleGuestsToSpawn: number;
  playerIsBusy: boolean;
  rushHourRemaining: number; // in milliseconds
  posterUrl?: string;
}
