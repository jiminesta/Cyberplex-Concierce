
import { Item, Difficulty, DifficultySettings } from './types';

export const GAME_TICK_MS = 100;
export const MAX_GUESTS = 10;
export const MOVIES = ["Chronicles of Glarth: The Awakening", "Midnight Donut Run", "Robot Love Protocol", "Fastest Car Ever 7: Highway to Hades"];

export const RUSH_HOUR_CHANCE = 0.005; // Per tick
export const RUSH_HOUR_DURATION_MS = 15000;
export const RUSH_HOUR_PATIENCE_MULTIPLIER = 1.8;
export const RUSH_HOUR_SPAWN_MULTIPLIER = 0.5; // Halves the spawn interval

export const DIFFICULTY_SETTINGS: { [key in Difficulty]: DifficultySettings } = {
  Easy: {
    PRESALE_TARGET: 5,
    GUEST_SPAWN_RATE_MS: 8000,
    PATIENCE_TOTAL: 120,
    PATIENCE_DECAY_RATE: 0.12,
    MAX_WRITE_UPS: 7,
    TIP_MULTIPLIER: 1.5,
  },
  Standard: {
    PRESALE_TARGET: 8,
    GUEST_SPAWN_RATE_MS: 6000,
    PATIENCE_TOTAL: 100,
    PATIENCE_DECAY_RATE: 0.15,
    MAX_WRITE_UPS: 5,
    TIP_MULTIPLIER: 1.0,
  },
  Hard: {
    PRESALE_TARGET: 12,
    GUEST_SPAWN_RATE_MS: 4500,
    PATIENCE_TOTAL: 80,
    PATIENCE_DECAY_RATE: 0.22,
    MAX_WRITE_UPS: 3,
    TIP_MULTIPLIER: 0.75,
  }
};

export const MAX_SUPPLY = 100;
export const SODA_SYRUP_COST = 20;
export const MILKSHAKE_ICE_CREAM_COST = 25;
export const REFILL_TIME_MS = 5000;

export const ICE_COST: { [key in Item]?: number } = {
    [Item.Soda]: 10,
    [Item.Water]: 5,
    [Item.MixedDrink]: 15,
};

export const ITEM_PREP_TIMES: { [key in Item]: number } = {
  [Item.Soda]: 2000,
  [Item.Water]: 1000,
  [Item.Ticket]: 500,
  [Item.Beer]: 1500,
  [Item.Icee]: 2500,
  [Item.MixedDrink]: 4000,
  [Item.Milkshake]: 5000,
  [Item.Ice]: 0,
};

export const BARTENDER_MAX_ENERGY = 100;
export const BARTENDER_ENERGY_GUEST_THRESHOLD = 2;
export const BARTENDER_ENERGY_DRAIN_PER_GUEST = 0.015;
export const BARTENDER_ENERGY_REGEN_RATE = 0.04;
export const LOW_ENERGY_THRESHOLD = 30;
export const LOW_ENERGY_PREP_TIME_PENALTY_MULTIPLIER = 1.5;

export const SNACK_SPAWN_RATE_MS = 12000;
export const BARTENDER_ENERGY_BOOST_AMOUNT = 25;

export const CONCESSION_ITEMS = [Item.Soda, Item.Water, Item.Beer, Item.Icee, Item.MixedDrink, Item.Milkshake];

export const POINTS = {
  SERVE_GUEST: 50,
  CHECK_TICKET: 20,
  SELL_TICKET: 30,
  CAUGHT_CONTRABAND: 40,
  CORRECT_DENIAL: 40,
  SEAT_SWAP_SUCCESS: 35,
  ANGRY_GUEST: -25,
  UNSERVED_GUEST_PENALTY: -15,
};

export const WAITING_SPOTS = {
  main: [
    { x: 50, y: 35 },
    { x: 50, y: 47 },
    { x: 50, y: 59 },
    { x: 50, y: 71 },
    { x: 50, y: 83 },
    { x: 50, y: 95 },
  ]
};

export const HOLDING_SPOTS = {
  hold: [
    { x: 25, y: 40 }, 
    { x: 15, y: 45 }, 
    { x: 25, y: 50 }
  ]
};

export const BARTENDER_IDLE_POSITION = { x: 50, y: 20 };

export const STATION_POSITIONS: { [key in Item]: { x: number, y: number } } = {
  [Item.Soda]:      { x: 35, y: 20 },
  [Item.Water]:     { x: 42, y: 20 },
  [Item.Icee]:      { x: 49, y: 20 },
  [Item.Milkshake]: { x: 56, y: 20 },
  [Item.Beer]:      { x: 70, y: 20 },
  [Item.MixedDrink]:{ x: 77, y: 20 },
  [Item.Ice]:       { x: 88, y: 20 },
  [Item.Ticket]:    BARTENDER_IDLE_POSITION,
};

export const GUEST_NAMES = {
    FIRST: ["Alex", "Ben", "Charlie", "Dana", "Evan", "Finn", "Grace", "Harper", "Izzy", "Jordan", "Kai", "Leo", "Max", "Nico", "Owen", "Piper", "Quinn", "Riley"],
    LAST: ["Smith", "Jones", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin"],
};

export const GUEST_HAIR_COLORS = ['#2c1b18', '#4a312b', '#7e533f', '#e6a861', '#d14c38', '#6d6d6d'];
export const GUEST_SKIN_TONES = ['#8d5524', '#c68642', '#e0ac69', '#f1c27d', '#ffdbac'];
export const GUEST_SHIRT_COLORS = ['#d32f2f', '#1976d2', '#388e3c', '#fbc02d', '#8e24aa', '#e64a19', '#00796b'];
export const GUEST_PANTS_COLORS = ['#1976d2', '#37474f', '#6d4c41'];

export const ITEM_COLORS: { [key in Item]?: { bg: string; text: string; border: string; contrastText: string; } } = {
    [Item.Soda]:      { bg: 'bg-red-500',      text: 'neon-text-red',    border: 'neon-border-red',    contrastText: 'text-white' },
    [Item.Water]:     { bg: 'bg-cyan-500',     text: 'neon-text-cyan',   border: 'neon-border-cyan',   contrastText: 'text-white' },
    [Item.Beer]:      { bg: 'bg-orange-400',   text: 'neon-text-orange', border: 'neon-border-orange', contrastText: 'text-black' },
    [Item.Icee]:      { bg: 'bg-purple-500',   text: 'neon-text-purple', border: 'neon-border-purple', contrastText: 'text-white' },
    [Item.MixedDrink]:{ bg: 'bg-pink-500',     text: 'neon-text-pink',   border: 'neon-border-pink',   contrastText: 'text-white' },
    [Item.Milkshake]: { bg: 'bg-indigo-400',   text: 'neon-text-indigo', border: 'neon-border-indigo', contrastText: 'text-white' },
    [Item.Ice]:       { bg: 'bg-blue-300',     text: 'text-blue-300',    border: 'neon-border-cyan',   contrastText: 'text-black' },
};

export const ICONS: { [key: string]: string } = {
  ticket: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>`,
  soda: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 6l1 13h8l1-13H7z" stroke="#ff3333" stroke-width="1.5"/><path d="M10 6V4h4v2" stroke="#ff3333" stroke-width="1.5"/><circle cx="12" cy="12" r="2" fill="#ff3333" opacity="0.5"/></svg>`,
  water: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21a6 6 0 006-6c0-4-6-11-6-11s-6 7-6 11a6 6 0 006 6z" stroke="#26c4ff" stroke-width="1.5"/></svg>`,
  beer: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 19V8H7v11c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2z" stroke="#f97316" stroke-width="1.5"/><path d="M17 10h3v4h-3M7 8c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2" stroke="#f97316" stroke-width="1.5"/></svg>`,
  icee: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 19l1 3h10l1-3M6 19l2-13h8l2 13H6z" stroke="#9f50ff" stroke-width="1.5"/><path d="M12 6c1.5-2 3-2 4 0s.5 4-1 6" stroke="#9f50ff" stroke-width="1.5"/></svg>`,
  mixedDrink: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 4l7 9 7-9H5z" stroke="#ff00de" stroke-width="1.5"/><path d="M12 13v7m-3 0h6" stroke="#ff00de" stroke-width="1.5"/><circle cx="15" cy="7" r="1.5" stroke="#ff00de"/></svg>`,
  milkshake: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 21h8l1-15H7l1 15z" stroke="#6366f1" stroke-width="1.5"/><path d="M12 6c2 0 4-2 4-4H8c0 2 2 4 4 4z" stroke="#6366f1" stroke-width="1.5"/><path d="M14 6v-3" stroke="#6366f1" stroke-width="1.5"/></svg>`,
  ice: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="5" height="5" rx="1" stroke="#26c4ff" stroke-width="1.5"/><rect x="13" y="13" width="5" height="5" rx="1" stroke="#26c4ff" stroke-width="1.5"/><rect x="6" y="13" width="5" height="5" rx="1" stroke="#26c4ff" stroke-width="1.5"/></svg>`,
  id_card: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z" /></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>`,
  pixel_guest: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; shape-rendering: crispEdges;"><!-- Hair --><rect x="8" y="4" width="8" height="2" fill="--HAIR_COLOR--" /><rect x="9" y="6" width="6" height="1" fill="--HAIR_COLOR--" /><!-- Skin --><rect x="8" y="7" width="8" height="4" fill="--SKIN_COLOR--" /><!-- Cyber Eye --><rect x="10" y="8" width="1" height="1" fill="#FFFFFF" /><rect x="13" y="8" width="1" height="1" fill="#39ff14" /><!-- Shirt --><rect x="7" y="11" width="10" height="6" fill="--SHIRT_COLOR--" /><!-- Hands --><rect x="6" y="11" width="1" height="3" fill="--SKIN_COLOR--" /><rect x="17" y="11" width="1" height="3" fill="--SKIN_COLOR--" /><!-- Pants --><rect x="8" y="17" width="8" height="3" fill="--PANTS_COLOR--" /><!-- Shoes --><rect x="8" y="20" width="3" height="1" fill="#424242" /><rect x="13" y="20" width="3" height="1" fill="#424242" /></svg>`,
  pixel_bartender: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated; shape-rendering: crispEdges;"><!-- Hair --><rect x="8" y="4" width="8" height="2" fill="#2c1b18" /><rect x="9" y="6" width="6" height="1" fill="#2c1b18" /><!-- Skin --><rect x="8" y="7" width="8" height="4" fill="#e0ac69" /><!-- Visor --><rect x="9" y="8" width="6" height="1" fill="#26c4ff" opacity="0.8" /><!-- Shirt --><rect x="7" y="11" width="10" height="6" fill="#ecf0f1" /><!-- Vest --><rect x="7" y="11" width="2" height="6" fill="#2c3e50"/><rect x="15" y="11" width="2" height="6" fill="#2c3e50"/><rect x="9" y="16" width="6" height="1" fill="#2c3e50"/><!-- Hands --><rect x="6" y="11" width="1" height="3" fill="#e0ac69" /><rect x="17" y="11" width="1" height="3" fill="#e0ac69" /><!-- Pants --><rect x="8" y="17" width="8" height="3" fill="#34495e" /><!-- Shoes --><rect x="8" y="20" width="3" height="1" fill="#2c3e50" /><rect x="13" y="20" width="3" height="1" fill="#2c3e50" /></svg>`,
  chair: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6.75a3 3 0 00-3-3h-3.75a3 3 0 00-3 3v3.75a3 3 0 003 3h3.75a3 3 0 003-3V6.75z" /><path stroke-linecap="round" stroke-linejoin="round" d="M9 19.5v-2.25a3.75 3.75 0 013.75-3.75h1.5A3.75 3.75 0 0118 17.25V19.5m-9 0h9" /></svg>`,
  refill: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l4.992-4.993m-4.993 0l-3.181 3.183a8.25 8.25 0 000 11.664l3.181 3.183" /></svg>`,
  snack_pretzel: `<svg viewBox="0 0 24 24" style="image-rendering: pixelated;" xmlns="http://www.w3.org/2000/svg" fill="#d48a4d"><path d="M9 4H15V5H9z M8 5H9V7H8z M15 5H16V7H15z M7 7H8V9H7z M16 7H17V9H16z M6 9H7V11H6z M17 9H18V11H17z M7 11H9V12H7z M15 11H17V12H15z M9 12H10V14H9z M14 12H15V14H14z M10 14H14V15H10z M9 15H10V17H9z M14 15H15V17H14z M8 17H9V19H8z M15 17H16V19H15z M9 19H15V20H9z"/></svg>`,
  snack_energy_drink: `<svg viewBox="0 0 24 24" style="image-rendering: pixelated;" xmlns="http://www.w3.org/2000/svg"><path fill="#AAA" d="M8 4h8v1H8z M7 5h10v14H7z M8 19h8v1H8z"/><path fill="#39ff14" d="M11 9h2v2h2v2h-2v2h-2v-2H9v-2h2z"/></svg>`,
  phone: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>`,
  theatre: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" /></svg>`,
  person: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>`,
  system_error: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>`,
  keyboard: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M3 12h18M3 7.5V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25V7.5m-18 0h18m-18 4.5h18m-18 4.5h18" /></svg>`,
};
