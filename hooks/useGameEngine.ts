import { useReducer, useEffect, useCallback, useRef } from 'react';
import { GameState, Guest, Item, GuestState, Difficulty, DifficultySettings, FallingSnack } from '../types';
import { 
    GAME_TICK_MS,
    MAX_GUESTS,
    ITEM_PREP_TIMES,
    POINTS,
    CONCESSION_ITEMS,
    GUEST_NAMES,
    MOVIES,
    MAX_SUPPLY,
    SODA_SYRUP_COST,
    MILKSHAKE_ICE_CREAM_COST,
    REFILL_TIME_MS,
    ICE_COST,
    DIFFICULTY_SETTINGS,
    GUEST_HAIR_COLORS,
    GUEST_PANTS_COLORS,
    GUEST_SHIRT_COLORS,
    GUEST_SKIN_TONES,
    WAITING_SPOTS,
    HOLDING_SPOTS,
    BARTENDER_IDLE_POSITION,
    STATION_POSITIONS,
    BARTENDER_MAX_ENERGY,
    BARTENDER_ENERGY_GUEST_THRESHOLD,
    BARTENDER_ENERGY_DRAIN_PER_GUEST,
    BARTENDER_ENERGY_REGEN_RATE,
    LOW_ENERGY_THRESHOLD,
    LOW_ENERGY_PREP_TIME_PENALTY_MULTIPLIER,
    SNACK_SPAWN_RATE_MS,
    BARTENDER_ENERGY_BOOST_AMOUNT,
    RUSH_HOUR_CHANCE,
    RUSH_HOUR_DURATION_MS,
    RUSH_HOUR_PATIENCE_MULTIPLIER
} from '../constants';

type Action =
  | { type: 'TICK' }
  | { type: 'START_GAME' }
  | { type: 'ADVANCE_AND_START_SHIFT' }
  | { type: 'RESET' }
  | { type: 'ADD_GUEST' }
  | { type: 'PREPARE_ITEM'; payload: Item }
  | { type: 'ITEM_READY'; payload: Item }
  | { type: 'INTERACT_WITH_GUEST'; payload: number }
  | { type: 'SELL_TICKET'; payload: { guestId: number; movie: string } }
  | { type: 'ID_CHECK_DECISION'; payload: { guestId: number; decision: 'serve' | 'deny' } }
  | { type: 'SWAP_SEATS', payload: { guestId: number, selectedSeatCount: number } }
  | { type: 'REFILL_SUPPLY', payload: Item }
  | { type: 'SUPPLY_REFILLED', payload: Item }
  | { type: 'ADD_SNACK' }
  | { type: 'COLLECT_SNACK', payload: number }
  | { type: 'SET_PLAYER_BUSY', payload: boolean }
  | { type: 'SET_POSTER', payload: string };


export const initialState: GameState = {
  guestSpawnElapsed: 0,
  score: 0,
  presaleTarget: 0,
  presaleHelped: 0,
  gameStarted: false,
  isGameOver: false,
  crashedOut: false,
  guests: [],
  preparedItems: [],
  preparing: {},
  tips: 0,
  writeUps: 0,
  presaleAngryLeaves: 0,
  firedReason: undefined,
  sodaSyrupLevel: MAX_SUPPLY,
  milkshakeIceCreamLevel: MAX_SUPPLY,
  iceLevel: MAX_SUPPLY,
  difficulty: null,
  difficultySettings: null,
  level: 1,
  shift: 1,
  endOfShiftPenalty: 0,
  bartenderPosition: BARTENDER_IDLE_POSITION,
  bartenderTargetPosition: BARTENDER_IDLE_POSITION,
  bartenderEnergy: BARTENDER_MAX_ENERGY,
  fallingSnacks: [],
  presaleGuestsToSpawn: 0,
  playerIsBusy: false,
  rushHourRemaining: 0,
};

const newShiftState = {
  guestSpawnElapsed: 0,
  presaleTarget: 0,
  presaleHelped: 0,
  gameStarted: false,
  isGameOver: false,
  crashedOut: false,
  firedReason: undefined,
  guests: [],
  preparedItems: [],
  preparing: {},
  sodaSyrupLevel: MAX_SUPPLY,
  milkshakeIceCreamLevel: MAX_SUPPLY,
  iceLevel: MAX_SUPPLY,
  endOfShiftPenalty: 0,
  bartenderPosition: BARTENDER_IDLE_POSITION,
  bartenderTargetPosition: BARTENDER_IDLE_POSITION,
  bartenderEnergy: BARTENDER_MAX_ENERGY,
  fallingSnacks: [],
  presaleGuestsToSpawn: 0,
  playerIsBusy: false,
  rushHourRemaining: 0,
};

const getDifficultyForLevel = (level: number): Difficulty => {
    if (level <= 1) return 'Easy';
    if (level === 2) return 'Standard';
    return 'Hard';
};

const findAndAssignSpot = (guests: Guest[]) => {
    const spotsInQueue = WAITING_SPOTS.main;
    for (let i = 0; i < spotsInQueue.length; i++) {
        const isOccupied = guests.some(g => g.queue === 'main' && g.spotIndex === i);
        if (!isOccupied) return { spotIndex: i, position: spotsInQueue[i] };
    }
    return null;
};

const findAndAssignHoldingSpot = (guests: Guest[]) => {
    const spotsInQueue = HOLDING_SPOTS.hold;
    for (let i = 0; i < spotsInQueue.length; i++) {
        const isOccupied = guests.some(g => g.queue === 'hold' && g.spotIndex === i);
        if (!isOccupied) return { spotIndex: i, position: spotsInQueue[i] };
    }
    return null;
};

const updateQueuePositions = (allGuests: Guest[]): Guest[] => {
    const guestsInQueue = allGuests
        .filter(g => g.queue === 'main' && g.state !== GuestState.LeavingAngry && g.state !== GuestState.LeavingHappy)
        .sort((a, b) => (a.spotIndex ?? 99) - (b.spotIndex ?? 99));

    return allGuests.map(g => {
        const queueIndex = guestsInQueue.findIndex(qg => qg.id === g.id);
        if (queueIndex !== -1) {
            const newSpotIndex = queueIndex;
            const newTargetPosition = WAITING_SPOTS.main[newSpotIndex];
            if (g.spotIndex !== newSpotIndex || JSON.stringify(g.targetPosition) !== JSON.stringify(newTargetPosition)) {
                return { ...g, spotIndex: newSpotIndex, targetPosition: newTargetPosition };
            }
        }
        return g;
    });
};

const createGuest = (isPresale: boolean, patience: number): Guest => {
    const hasTicket = isPresale || Math.random() > 0.3;
    const hasContraband = Math.random() > 0.7 && hasTicket;
    const wantsConcessions = Math.random() > 0.4;

    let initialState: GuestState;
    let dialog: string;
    let preferredMovie: string | undefined = undefined;

    if (isPresale) {
        initialState = GuestState.WaitingForTicketCheck;
        dialog = "I'm here to check in for my presale ticket.";
    } else if (!hasTicket) {
        initialState = GuestState.WaitingToBuyTicket;
        const movie = MOVIES[Math.floor(Math.random() * MOVIES.length)];
        preferredMovie = movie;
        dialog = `One ticket for "${movie}", please.`;
    } else if (hasContraband) {
        initialState = GuestState.WaitingForSecurityCheck;
        dialog = "Just here for the show...";
    } else {
        initialState = GuestState.WaitingForTicketCheck;
        dialog = "Ready for my movie!";
    }

    const name = `${GUEST_NAMES.FIRST[Math.floor(Math.random() * GUEST_NAMES.FIRST.length)]} ${GUEST_NAMES.LAST[Math.floor(Math.random() * GUEST_NAMES.LAST.length)]}`;
    const birthYear = Math.random() < 0.2 ? 2004 + Math.floor(Math.random() * 3) : 1980 + Math.floor(Math.random() * 24);
    const expiryYear = Math.random() < 0.15 ? 2023 : 2025 + Math.floor(Math.random() * 4);

    const newGuest: Guest = {
        id: Date.now() + Math.random(),
        hasTicket,
        isPresale,
        hasContrabandWater: hasContraband,
        state: initialState,
        order: null,
        patience: isPresale ? Math.floor(patience * 0.9) : patience,
        position: { x: 50, y: 110 },
        targetPosition: { x: 50, y: 110 },
        dialog,
        name,
        preferredMovie,
        ticketCount: hasTicket ? Math.floor(Math.random() * 4) + 1 : undefined,
        colors: {
            hair: GUEST_HAIR_COLORS[Math.floor(Math.random() * GUEST_HAIR_COLORS.length)],
            skin: GUEST_SKIN_TONES[Math.floor(Math.random() * GUEST_SKIN_TONES.length)],
            shirt: GUEST_SHIRT_COLORS[Math.floor(Math.random() * GUEST_SHIRT_COLORS.length)],
            pants: GUEST_PANTS_COLORS[Math.floor(Math.random() * GUEST_PANTS_COLORS.length)],
        },
        dob: { month: Math.floor(Math.random() * 12) + 1, day: Math.floor(Math.random() * 28) + 1, year: birthYear },
        idExpires: { month: Math.floor(Math.random() * 12) + 1, day: Math.floor(Math.random() * 28) + 1, year: expiryYear },
    };

    if (isPresale) {
        const orderItems = [];
        const numItems = Math.random() < 0.5 ? 2 : 3;
        for (let i = 0; i < numItems; i++) orderItems.push(CONCESSION_ITEMS[Math.floor(Math.random() * CONCESSION_ITEMS.length)]);
        newGuest.order = orderItems;
    } else if (wantsConcessions) {
        const orderItems = [];
        const firstItem = CONCESSION_ITEMS[Math.floor(Math.random() * CONCESSION_ITEMS.length)];
        orderItems.push(firstItem);
        if (Math.random() > 0.6) orderItems.push(CONCESSION_ITEMS[Math.floor(Math.random() * CONCESSION_ITEMS.length)]);
        newGuest.order = orderItems;
    }

    return newGuest;
};

const findNextTaskTarget = (state: GameState): { x: number, y: number } => {
    const preparingItems = Object.keys(state.preparing) as Item[];
    if (preparingItems.length > 0) {
        const nextItem = preparingItems[0];
        if (STATION_POSITIONS[nextItem]) return STATION_POSITIONS[nextItem];
    }
    return BARTENDER_IDLE_POSITION;
};

const makeGuestHappy = (g: Guest, settings: DifficultySettings) => {
    const tipAmount = Math.max(1, Math.ceil((g.patience / 20) * settings.TIP_MULTIPLIER));
    return { 
        guest: { ...g, state: GuestState.LeavingHappy, targetPosition: {x: g.position.x, y: -10 }, dialog: g.dialog, queue: undefined, spotIndex: undefined },
        tip: tipAmount,
    };
};

const makeGuestAngry = (g: Guest, dialog: string) => ({
  ...g,
  state: GuestState.LeavingAngry,
  dialog,
  targetPosition: { x: 50, y: 120 },
  queue: undefined,
  spotIndex: undefined,
});

const moveGuestToHolding = (guestToMove: Guest, allGuests: Guest[], newDialog?: string, newState?: GuestState): Guest => {
    const holdingSpot = findAndAssignHoldingSpot(allGuests);
    if (holdingSpot) {
        return {
            ...guestToMove,
            state: newState || guestToMove.state,
            dialog: newDialog || guestToMove.dialog,
            queue: 'hold',
            spotIndex: holdingSpot.spotIndex,
            targetPosition: holdingSpot.position,
        };
    }
    return { ...guestToMove, patience: Math.max(0, guestToMove.patience - 10), dialog: "Crowded! I'll hang here." }; 
};

export const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'START_GAME': {
      const difficulty = getDifficultyForLevel(state.level);
      const settings = DIFFICULTY_SETTINGS[difficulty];
      return gameReducer({
        ...initialState,
        level: state.level,
        shift: state.shift,
        gameStarted: true,
        isGameOver: false,
        difficulty: difficulty,
        difficultySettings: settings,
        presaleTarget: settings.PRESALE_TARGET,
        presaleGuestsToSpawn: settings.PRESALE_TARGET,
        guests: [],
      }, { type: 'ADD_GUEST' });
    }
    
    case 'ADVANCE_AND_START_SHIFT': {
      const isNewLevel = state.shift >= 3;
      const nextShift = isNewLevel ? 1 : state.shift + 1;
      const nextLevel = isNewLevel ? state.level + 1 : state.level;
      const difficulty = getDifficultyForLevel(nextLevel);
      const settings = DIFFICULTY_SETTINGS[difficulty];
      return gameReducer({
        ...state,
        ...newShiftState,
        level: nextLevel,
        shift: nextShift,
        score: isNewLevel ? 0 : state.score,
        tips: isNewLevel ? 0 : state.tips,
        writeUps: isNewLevel ? 0 : state.writeUps,
        gameStarted: true,
        difficulty,
        difficultySettings: settings,
        presaleTarget: settings.PRESALE_TARGET,
        presaleGuestsToSpawn: settings.PRESALE_TARGET,
        guests: [],
      }, { type: 'ADD_GUEST' });
    }

    case 'RESET': return initialState;
    case 'SET_POSTER': return { ...state, posterUrl: action.payload };

    case 'TICK':
      if (!state.gameStarted || state.isGameOver || !state.difficultySettings) return state;

      let newRushHourRemaining = Math.max(0, state.rushHourRemaining - GAME_TICK_MS);
      let triggeringRushHour = false;
      if (newRushHourRemaining === 0 && Math.random() < RUSH_HOUR_CHANCE) {
          newRushHourRemaining = RUSH_HOUR_DURATION_MS;
          triggeringRushHour = true;
      }

      const patienceDecay = triggeringRushHour || newRushHourRemaining > 0 ? state.difficultySettings.PATIENCE_DECAY_RATE * RUSH_HOUR_PATIENCE_MULTIPLIER : state.difficultySettings.PATIENCE_DECAY_RATE;

      let newWriteUps = state.writeUps;
      let newScore = state.score;
      let endOfShiftPenalty = state.endOfShiftPenalty;
      let newPresaleAngryLeaves = state.presaleAngryLeaves;
      let newFiredReason = state.firedReason;
      let isFiredByPresale = false;
      
      let bartenderEnergy = state.bartenderEnergy;
      const activeGuestsCount = state.guests.filter(g => g.state !== GuestState.LeavingAngry && g.state !== GuestState.LeavingHappy).length;
      if (activeGuestsCount > BARTENDER_ENERGY_GUEST_THRESHOLD) bartenderEnergy -= (activeGuestsCount - BARTENDER_ENERGY_GUEST_THRESHOLD) * BARTENDER_ENERGY_DRAIN_PER_GUEST;
      else bartenderEnergy += BARTENDER_ENERGY_REGEN_RATE;
      bartenderEnergy = Math.max(0, Math.min(BARTENDER_MAX_ENERGY, bartenderEnergy));

      if (bartenderEnergy <= 0) return { ...state, bartenderEnergy: 0, isGameOver: true, crashedOut: true, gameStarted: true };

      const guestsWithDecayingPatience = state.guests.map(g => ({
        ...g,
        patience: g.state === GuestState.LeavingHappy || g.state === GuestState.LeavingAngry ? g.patience : Math.max(0, g.patience - patienceDecay)
      }));

      const newlyAngryGuests = guestsWithDecayingPatience.filter(g => g.patience === 0 && !state.guests.find(og => og.id === g.id && og.patience === 0));
      if (newlyAngryGuests.length > 0) {
        newScore += newlyAngryGuests.length * POINTS.ANGRY_GUEST;
        for (const angryGuest of newlyAngryGuests) {
            if (angryGuest.isPresale) {
                newPresaleAngryLeaves++;
                if (newPresaleAngryLeaves >= 3) { isFiredByPresale = true; newFiredReason = `Fired for failing to serve ${newPresaleAngryLeaves} presale guests.`; }
                else newWriteUps += 1;
            } else newWriteUps += 1;
        }
      }
      
      let updatedGuests = guestsWithDecayingPatience.map(g => (g.patience === 0 && g.state !== GuestState.LeavingAngry) ? makeGuestAngry(g, "I've waited long enough!") : g);
      const guestsAfterLeaving = updatedGuests.filter(g => (g.state === GuestState.LeavingHappy ? g.position.y > -5 : g.state === GuestState.LeavingAngry ? g.position.y < 115 : true));

      const isShiftComplete = state.presaleHelped >= state.presaleTarget;
      const isFiredByWriteUps = newWriteUps >= state.difficultySettings.MAX_WRITE_UPS;
      if (isFiredByWriteUps && !newFiredReason) newFiredReason = `Accumulated ${newWriteUps} system errors.`;
      
      const isGameOver = isShiftComplete || isFiredByWriteUps || isFiredByPresale;
      if (isGameOver && !state.isGameOver && isShiftComplete) {
          endOfShiftPenalty = guestsAfterLeaving.filter(g => !g.isPresale && g.state !== GuestState.LeavingHappy && g.state !== GuestState.LeavingAngry).length * POINTS.UNSERVED_GUEST_PENALTY;
          newScore += endOfShiftPenalty;
      }

      const bdx = state.bartenderTargetPosition.x - state.bartenderPosition.x;
      const bdy = state.bartenderTargetPosition.y - state.bartenderPosition.y;
      const bDist = Math.sqrt(bdx * bdx + bdy * bdy);
      let bartenderPosition = state.bartenderPosition;
      if (bDist > 2) bartenderPosition = { x: state.bartenderPosition.x + (bdx / bDist) * 2.5, y: state.bartenderPosition.y + (bdy / bDist) * 2.5 };
      else bartenderPosition = state.bartenderTargetPosition;
      
      const guestsWithUpdatedPositions = guestsAfterLeaving.map(g => {
          const dx = g.targetPosition.x - g.position.x, dy = g.targetPosition.y - g.position.y, dist = Math.sqrt(dx*dx + dy*dy);
          return dist < 2 ? {...g, position: g.targetPosition} : {...g, position: { x: g.position.x + (dx/dist), y: g.position.y + (dy/dist) }};
      });
      const finalGuests = updateQueuePositions(guestsWithUpdatedPositions);

      const spawnRate = state.difficultySettings.GUEST_SPAWN_RATE_MS * (newRushHourRemaining > 0 ? .5 : 1);
      const elapsed = state.guestSpawnElapsed + GAME_TICK_MS;
      const nextState: GameState = {
        ...state,
        guestSpawnElapsed: elapsed >= spawnRate ? elapsed % spawnRate : elapsed,
        score: newScore,
        writeUps: newWriteUps,
        endOfShiftPenalty,
        isGameOver,
        firedReason: newFiredReason,
        presaleAngryLeaves: newPresaleAngryLeaves,
        bartenderPosition,
        bartenderEnergy,
        rushHourRemaining: newRushHourRemaining,
        guests: finalGuests.map(g => {
            if (g.queue && g.spotIndex === undefined) {
                const spot = findAndAssignSpot(finalGuests);
                if (spot) return { ...g, spotIndex: spot.spotIndex, targetPosition: spot.position };
            }
            return g;
        }),
      };
    
      return elapsed >= spawnRate && !nextState.isGameOver ? gameReducer(nextState, {type: 'ADD_GUEST'}) : nextState;

    case 'ADD_GUEST': {
      if (!state.gameStarted || state.isGameOver || state.guests.length >= MAX_GUESTS || !state.difficultySettings) return state;
      const spawnPresale = state.presaleGuestsToSpawn > 0 && (state.guests.length === 0 || Math.random() < 0.4);
      const newGuest = createGuest(spawnPresale, state.difficultySettings.PATIENCE_TOTAL);
      const spot = findAndAssignSpot([...state.guests, newGuest]);
      if (!spot) return state;
      newGuest.queue = 'main'; newGuest.spotIndex = spot.spotIndex; newGuest.targetPosition = spot.position;
      return { ...state, guests: [...state.guests, newGuest], presaleGuestsToSpawn: spawnPresale ? state.presaleGuestsToSpawn - 1 : state.presaleGuestsToSpawn };
    }

    case 'ADD_SNACK': {
        const newSnack: FallingSnack = { id: Date.now(), type: Math.random() < 0.5 ? 'pretzel' : 'energy_drink', position: { x: Math.random() * 80 + 10, y: -5 } };
        return { ...state, fallingSnacks: [...state.fallingSnacks, newSnack] };
    }
    
    case 'COLLECT_SNACK': {
        return { ...state, bartenderEnergy: Math.min(BARTENDER_MAX_ENERGY, state.bartenderEnergy + BARTENDER_ENERGY_BOOST_AMOUNT), fallingSnacks: state.fallingSnacks.filter(s => s.id !== action.payload) };
    }

    case 'PREPARE_ITEM': {
      const item = action.payload;
      if (state.preparing[item]) return state;
      const iceCost = ICE_COST[item] || 0;
      if (state.iceLevel < iceCost) return state;
      let { sodaSyrupLevel, milkshakeIceCreamLevel } = state;
      if (item === Item.Soda) { if (sodaSyrupLevel < SODA_SYRUP_COST) return state; sodaSyrupLevel -= SODA_SYRUP_COST; }
      if (item === Item.Milkshake) { if (milkshakeIceCreamLevel < MILKSHAKE_ICE_CREAM_COST) return state; milkshakeIceCreamLevel -= MILKSHAKE_ICE_CREAM_COST; }
      const newTarget = Object.keys(state.preparing).length === 0 && STATION_POSITIONS[item] ? STATION_POSITIONS[item] : state.bartenderTargetPosition;
      return { ...state, sodaSyrupLevel, milkshakeIceCreamLevel, iceLevel: state.iceLevel - iceCost, preparing: { ...state.preparing, [item]: 'prepare' }, bartenderTargetPosition: newTarget };
    }
      
    case 'ITEM_READY': {
      const newPreparing = { ...state.preparing }; delete newPreparing[action.payload];
      const tempState = { ...state, preparing: newPreparing, preparedItems: [...state.preparedItems, action.payload] };
      return { ...tempState, bartenderTargetPosition: findNextTaskTarget(tempState) };
    }
      
    case 'REFILL_SUPPLY': {
        const isBartenderIdle = Object.keys(state.preparing).length === 0;
        const newTarget = isBartenderIdle && STATION_POSITIONS[action.payload] ? STATION_POSITIONS[action.payload] : state.bartenderTargetPosition;
        return { ...state, preparing: { ...state.preparing, [action.payload]: 'refill' }, bartenderTargetPosition: newTarget };
    }

    case 'SUPPLY_REFILLED': {
        const newPreparing = { ...state.preparing }; delete newPreparing[action.payload];
        let tempState = { ...state, preparing: newPreparing };
        if (action.payload === Item.Soda) tempState.sodaSyrupLevel = MAX_SUPPLY;
        if (action.payload === Item.Milkshake) tempState.milkshakeIceCreamLevel = MAX_SUPPLY;
        if (action.payload === Item.Ice) tempState.iceLevel = MAX_SUPPLY;
        return { ...tempState, bartenderTargetPosition: findNextTaskTarget(tempState) };
    }

    case 'INTERACT_WITH_GUEST': {
      const guest = state.guests.find(g => g.id === action.payload);
      if (!guest || !state.difficultySettings) return state;
      let { score, tips, presaleHelped } = state;
      let guests = [...state.guests];
      switch(guest.state) {
        case GuestState.WaitingForTicketCheck:
          score += POINTS.CHECK_TICKET;
          guests = guests.map(g => {
              if (g.id !== action.payload) return g;
              if (g.ticketCount && (g.isPresale ? Math.random() < 0.6 : Math.random() < 0.2)) return moveGuestToHolding(g, state.guests, `Thanks. Could we swap our ${g.ticketCount} seat${g.ticketCount > 1 ? 's' : ''}?`, GuestState.WaitingForSeatSwap);
              if (g.order) return moveGuestToHolding(g, state.guests, "Thanks! Now, I'm a bit thirsty...", GuestState.WaitingToOrder);
              if (g.isPresale) presaleHelped++;
              const { guest: happyGuest, tip: newTip } = makeGuestHappy(g, state.difficultySettings);
              tips += newTip; return happyGuest;
          });
          break;
        case GuestState.WaitingForSecurityCheck:
            score += POINTS.CAUGHT_CONTRABAND;
            guests = guests.map(g => {
                if (g.id !== action.payload) return g;
                const updatedGuest = {...g, hasContrabandWater: false};
                if (g.order) return moveGuestToHolding(updatedGuest, state.guests, "Fine! Now I need a drink.", GuestState.WaitingToOrder);
                if (g.isPresale) presaleHelped++;
                const { guest: happyGuest, tip: newTip } = makeGuestHappy(updatedGuest, state.difficultySettings);
                tips += newTip; return happyGuest;
            });
            break;
        case GuestState.WaitingToOrder:
            if (!guest.order) { if (guest.isPresale) presaleHelped++; const { guest: happyGuest, tip: newTip } = makeGuestHappy(guest, state.difficultySettings); tips += newTip; guests = guests.map(g => g.id === action.payload ? happyGuest : g); }
            else guests = guests.map(g => g.id === action.payload ? { ...g, state: GuestState.WaitingForConcessions, dialog: `I'll have: ${g.order!.join(' and ')}.` } : g);
            return {...state, guests, tips, presaleHelped};
        case GuestState.WaitingForConcessions:
            if(guest.order && guest.order.every(item => state.preparedItems.includes(item))){
                score += POINTS.SERVE_GUEST; if (guest.isPresale) presaleHelped++;
                let remainingPrepared = [...state.preparedItems]; guest.order.forEach(item => { const idx = remainingPrepared.indexOf(item); if (idx > -1) remainingPrepared.splice(idx, 1); });
                const { guest: happyGuest, tip: newTip } = makeGuestHappy({...guest, dialog: 'Delicious! Thanks!'}, state.difficultySettings);
                tips += newTip; guests = guests.map(g => g.id === action.payload ? happyGuest : g);
                return {...state, guests: updateQueuePositions(guests), score, tips, presaleHelped, preparedItems: remainingPrepared};
            }
          break;
      }
      return {...state, guests: updateQueuePositions(guests), score, tips, presaleHelped};
    }
      
    case 'SELL_TICKET': {
        const guest = state.guests.find(g => g.id === action.payload.guestId);
        if (!guest || !state.difficultySettings) return state;
        let { score, tips, presaleHelped } = state; let guests = [...state.guests];
        if (guest.preferredMovie === action.payload.movie) {
            score += POINTS.SELL_TICKET;
            guests = guests.map(g => {
                if (g.id !== action.payload.guestId) return g;
                const updatedGuest = { ...g, hasTicket: true, dialog: "Thank you!" };
                if (updatedGuest.order) return moveGuestToHolding(updatedGuest, state.guests, "Thank you! Can I also get something to drink?", GuestState.WaitingToOrder);
                if (g.isPresale) presaleHelped++; const { guest: happyGuest, tip: newTip } = makeGuestHappy(updatedGuest, state.difficultySettings); tips += newTip; return happyGuest;
            });
        } else guests = guests.map(g => g.id === action.payload.guestId ? { ...g, patience: Math.max(0, g.patience - 25), dialog: `No, that's not right. I wanted "${guest.preferredMovie}".` } : g);
        return { ...state, score, guests: updateQueuePositions(guests), tips, presaleHelped };
    }

    case 'ID_CHECK_DECISION': {
        const guest = state.guests.find(g => g.id === action.payload.guestId);
        if (!guest || !guest.order || !state.difficultySettings) return state;
        const isIdValid = guest.dob.year < 2004 && guest.idExpires.year >= 2024;
        let { score, tips, writeUps, presaleHelped } = state; let guests = [...state.guests], preparedItems = [...state.preparedItems];
        if (action.payload.decision === 'serve') {
            if (isIdValid) { score += POINTS.SERVE_GUEST; tips += makeGuestHappy(guest, state.difficultySettings).tip; }
            else { writeUps += 1; score += POINTS.ANGRY_GUEST; }
            if (guest.isPresale) presaleHelped++; guests = guests.map(g => g.id === action.payload.guestId ? makeGuestHappy(g, state.difficultySettings).guest : g);
            guest.order.forEach(item => { const idx = preparedItems.indexOf(item); if (idx > -1) preparedItems.splice(idx, 1); });
        } else {
            guests = guests.map(g => {
                if (g.id !== action.payload.guestId) return g;
                if (!isIdValid) score += POINTS.CORRECT_DENIAL; else { writeUps += 1; score += POINTS.ANGRY_GUEST; }
                if (g.isPresale) presaleHelped++;
                return { ...g, state: GuestState.LeavingHappy, dialog: !isIdValid ? 'Fine, I\'ll just go in.' : 'Whatever! I\'m going in.', targetPosition: { x: g.position.x, y: -10 }, queue: undefined, spotIndex: undefined };
            });
        }
        return { ...state, score, tips, writeUps, guests: updateQueuePositions(guests), preparedItems, presaleHelped };
    }
    
    case 'SWAP_SEATS': {
        const guest = state.guests.find(g => g.id === action.payload.guestId);
        if (!guest || !guest.ticketCount || !state.difficultySettings) return state;
        let { score, tips, presaleHelped } = state; let guests = [...state.guests];
        if (action.payload.selectedSeatCount === guest.ticketCount) {
            score += POINTS.SEAT_SWAP_SUCCESS;
            guests = guests.map(g => {
              if (g.id !== action.payload.guestId) return g;
              if (g.order) return moveGuestToHolding(g, state.guests, "Perfect, thanks! Also, a drink...", GuestState.WaitingToOrder);
              if (g.isPresale) presaleHelped++; const { guest: happyGuest, tip: newTip } = makeGuestHappy(g, state.difficultySettings); tips += newTip + 1; return happyGuest;
            });
        } else guests = guests.map(g => g.id === action.payload.guestId ? { ...g, patience: Math.max(0, g.patience - 40), dialog: `Wrong seat count! Try again.` } : g);
        return { ...state, score, guests: updateQueuePositions(guests), tips, presaleHelped };
    }

    case 'SET_PLAYER_BUSY': return { ...state, playerIsBusy: action.payload };
    default: return state;
  }
};

export const useGameEngine = () => {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]).current;

  const generateShiftPoster = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return; // Optional artwork never blocks local gameplay.
    const movie = MOVIES[Math.floor(Math.random() * MOVIES.length)];
    try {
        const {GoogleGenAI} = await import('@google/genai');
        const ai = new GoogleGenAI({apiKey});
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: `A futuristic, high-detail holographic movie poster for a film titled "${movie}". Cyberpunk neon aesthetic, 80s retro-future style, cinematic lighting.` }] },
            config: { imageConfig: { aspectRatio: "9:16" } }
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                dispatch({ type: 'SET_POSTER', payload: `data:image/png;base64,${part.inlineData.data}` });
                break;
            }
        }
    } catch (e) { console.error("Poster gen failed", e); }
  };

  const startGame = useCallback(() => {
    generateShiftPoster();
    dispatch({ type: 'START_GAME' });
  }, []);

  const advanceShift = useCallback(() => {
      generateShiftPoster();
      dispatch({ type: 'ADVANCE_AND_START_SHIFT' });
  }, []);

  useEffect(() => {
    if (!gameState.gameStarted || gameState.isGameOver || !gameState.difficultySettings) {
      timers.forEach(t => { clearInterval(t); clearTimeout(t); });
      timers.length = 0; return;
    }

    const tickTimer = setInterval(() => dispatch({ type: 'TICK' }), GAME_TICK_MS);
    
    // Customer cadence advances inside TICK; countdown changes cannot reset it.
    const snackTimer = setInterval(() => dispatch({ type: 'ADD_SNACK' }), SNACK_SPAWN_RATE_MS);
    
    timers.push(tickTimer, snackTimer);

    return () => { timers.forEach(t => { clearInterval(t); clearTimeout(t); }); timers.length = 0; };
  }, [gameState.gameStarted, gameState.isGameOver, gameState.difficultySettings, timers]);

  const internalDispatch = useCallback((action: Action) => {
    if (action.type === 'PREPARE_ITEM') {
        let prepTime = ITEM_PREP_TIMES[action.payload];
        if (gameState.bartenderEnergy < LOW_ENERGY_THRESHOLD) prepTime *= LOW_ENERGY_PREP_TIME_PENALTY_MULTIPLIER;
        const timer = setTimeout(() => dispatch({ type: 'ITEM_READY', payload: action.payload }), prepTime);
        timers.push(timer);
    } else if (action.type === 'REFILL_SUPPLY') {
        let refillTime = REFILL_TIME_MS;
        if (gameState.bartenderEnergy < LOW_ENERGY_THRESHOLD) refillTime *= LOW_ENERGY_PREP_TIME_PENALTY_MULTIPLIER;
        const timer = setTimeout(() => dispatch({ type: 'SUPPLY_REFILLED', payload: action.payload }), refillTime);
        timers.push(timer);
    }
    dispatch(action);
  }, [timers, gameState.bartenderEnergy]);

  return { gameState, dispatch: internalDispatch, startGame, advanceShift };
};