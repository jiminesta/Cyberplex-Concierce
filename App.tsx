import React, { useState, useEffect }from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { GuestComponent } from './components/GuestComponent';
import { StationComponent } from './components/StationComponent';
import { Item, Guest, GuestState } from './types';
import { ICONS, MOVIES, SODA_SYRUP_COST, MILKSHAKE_ICE_CREAM_COST, ICE_COST, MAX_SUPPLY, LOW_ENERGY_THRESHOLD } from './constants';
import { Icon } from './components/Icon';
import { IdCheckModal } from './components/IdCheckModal';
import { MovieSelectionModal } from './components/MovieSelectionModal';
import { SeatSwapModal } from './components/SeatSwapModal';
import { BartenderComponent } from './components/BartenderComponent';
import { FallingSnackComponent } from './components/FallingSnackComponent';


const MemoizedGuest = React.memo(GuestComponent);
const MemoizedSnack = React.memo(FallingSnackComponent);

type StationStatus = 'Idle' | 'Preparing' | 'Ready' | 'Empty' | 'Refilling' | 'Blocked';

export default function App() {
  const { gameState, dispatch, startGame, advanceShift } = useGameEngine();
  const { level, shift, score, guests, preparedItems, isGameOver, gameStarted, tips, writeUps, difficultySettings, endOfShiftPenalty, bartenderPosition, bartenderEnergy, fallingSnacks, presaleTarget, presaleHelped, crashedOut, firedReason, rushHourRemaining, posterUrl } = gameState;
  const [idCheckGuest, setIdCheckGuest] = useState<Guest | null>(null);
  const [movieSelectionGuest, setMovieSelectionGuest] = useState<Guest | null>(null);
  const [seatSwapGuest, setSeatSwapGuest] = useState<Guest | null>(null);
  const [showCrashScreen, setShowCrashScreen] = useState(false);

  useEffect(() => {
      if (crashedOut) {
          const timer = setTimeout(() => setShowCrashScreen(true), 1000);
          return () => clearTimeout(timer);
      } else setShowCrashScreen(false);
  }, [crashedOut]);

  const handleReturnToMenu = () => dispatch({ type: 'RESET' });
  
  const getStationStatus = (item: Item): StationStatus => {
    const iceCost = ICE_COST[item];
    if (iceCost && gameState.iceLevel < iceCost) return 'Blocked';
    if (gameState.preparing[item] === 'prepare') return 'Preparing';
    if (gameState.preparing[item] === 'refill') return 'Refilling';
    if (preparedItems.includes(item)) return 'Ready';
    if ((item === Item.Soda && gameState.sodaSyrupLevel < SODA_SYRUP_COST) || (item === Item.Milkshake && gameState.milkshakeIceCreamLevel < MILKSHAKE_ICE_CREAM_COST)) return 'Empty';
    return 'Idle';
  };

  const getIceMachineStatus = (): StationStatus => {
      if (gameState.preparing[Item.Ice] === 'refill') return 'Refilling';
      if (gameState.iceLevel < MAX_SUPPLY) return 'Empty';
      return 'Idle';
  };
  
  const handleItemClick = (item: Item) => {
    if (item === Item.Ice) {
      if (getIceMachineStatus() === 'Empty') dispatch({ type: 'REFILL_SUPPLY', payload: Item.Ice });
      return;
    }
    const status = getStationStatus(item);
    if (status === 'Empty') dispatch({ type: 'REFILL_SUPPLY', payload: item });
    else if (status === 'Idle') dispatch({ type: 'PREPARE_ITEM', payload: item });
  };

  const handleGuestClick = (guest: Guest) => {
     if (guest.state === GuestState.WaitingToBuyTicket) { dispatch({ type: 'SET_PLAYER_BUSY', payload: true }); setMovieSelectionGuest(guest); return; }
     if (guest.state === GuestState.WaitingForSeatSwap) { dispatch({ type: 'SET_PLAYER_BUSY', payload: true }); setSeatSwapGuest(guest); return; }
     if (guest.state === GuestState.WaitingForConcessions && guest.order) {
        const isOrderReady = guest.order.every(item => preparedItems.includes(item));
        const needsIdCheck = guest.order.some(item => [Item.Beer, Item.MixedDrink].includes(item));
        if (isOrderReady && needsIdCheck && !idCheckGuest) { dispatch({ type: 'SET_PLAYER_BUSY', payload: true }); setIdCheckGuest(guest); return; }
    }
    dispatch({ type: 'INTERACT_WITH_GUEST', payload: guest.id });
  };
  
  const handleSnackClick = (id: number) => dispatch({ type: 'COLLECT_SNACK', payload: id });
  const handleIdCheckDecision = (decision: 'serve' | 'deny') => {
    if (idCheckGuest) dispatch({ type: 'ID_CHECK_DECISION', payload: { guestId: idCheckGuest.id, decision }});
    setIdCheckGuest(null); dispatch({ type: 'SET_PLAYER_BUSY', payload: false });
  };
  const handleMovieSelection = (movie: string) => {
    if (movieSelectionGuest) dispatch({ type: 'SELL_TICKET', payload: { guestId: movieSelectionGuest.id, movie } });
    setMovieSelectionGuest(null); dispatch({ type: 'SET_PLAYER_BUSY', payload: false });
  };
  const handleSeatSwap = (guestId: number, selectedSeatCount: number) => {
    dispatch({ type: 'SWAP_SEATS', payload: { guestId, selectedSeatCount } });
    setSeatSwapGuest(null); dispatch({ type: 'SET_PLAYER_BUSY', payload: false });
  };

  if (!gameStarted && !isGameOver) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center p-4 text-center overflow-auto">
        <h1 className="text-3xl md:text-5xl font-brand mb-2">
            <span className="block neon-text-pink">CYBER-PLEX</span>
            <span className="block neon-text-cyan">CONCIERGE</span>
        </h1>
        <h2 className="text-xl md:text-3xl font-brand neon-text-yellow mb-6">Level {level} // Shift {shift}</h2>
        
        <div className="flex flex-col md:flex-row gap-6 items-center">
            {posterUrl && (
                <div className="y2k-panel neon-border-yellow p-1 rotate-[-2deg] shadow-2xl">
                    <img src={posterUrl} alt="Movie Poster" className="w-32 md:w-48 rounded-md" />
                    <p className="text-[8px] font-brand mt-1 neon-text-yellow animate-pulse">NOW PLAYING</p>
                </div>
            )}
            <div className="y2k-panel neon-border-cyan text-left w-full max-w-md space-y-4 p-4 md:p-6 mb-6 text-sm md:text-base">
                <ul className="space-y-3 list-disc list-inside">
                    <li><strong className="text-yellow-300">GOAL:</strong> Serve {presaleTarget} presale guests.</li>
                    <li><strong className="text-red-400">ALERT:</strong> Watch out for <span className="neon-text-red">RUSH HOUR</span> surges!</li>
                    <li><strong className="text-cyan-300">ENERGY:</strong> Keep your vitals high to work faster.</li>
                </ul>
            </div>
        </div>
        <button onClick={startGame} className="y2k-button green text-lg sm:text-xl md:text-2xl mt-8">Start Shift</button>
      </div>
    );
  }

  return (
    <main className={`w-screen h-screen flex flex-col select-none relative transition-colors duration-500 ${crashedOut && !showCrashScreen ? 'crash-flash' : ''} ${rushHourRemaining > 0 ? 'bg-red-900/10' : ''}`}>
      <div className="flex-1 flex flex-col gap-2 p-2 sm:p-4 overflow-hidden relative">
        {rushHourRemaining > 0 && (
            <div className="absolute inset-0 z-[100] pointer-events-none border-8 border-red-500 animate-pulse flex items-center justify-center">
                <div className="text-4xl md:text-8xl font-brand neon-text-red bg-black/80 p-8 rounded-xl border-4 border-red-500 scale-150 transform rotate-[-5deg]">RUSH HOUR!</div>
            </div>
        )}

        <div className="y2k-panel neon-border-purple p-2 space-y-2 relative z-10">
             <div className="flex flex-wrap justify-between items-center gap-x-2 sm:gap-x-4 gap-y-1 text-xs sm:text-base px-2">
                  <h1 className="hidden sm:block text-lg sm:text-xl md:text-2xl font-brand neon-text-yellow">CYBER-PLEX</h1>
                  <div className="flex flex-wrap justify-center sm:justify-end items-center gap-x-2 sm:gap-x-3 gap-y-1">
                      <div>Lvl: <span className="font-bold text-cyan-400">{level}</span></div>
                      <div>Shift: <span className="font-bold text-cyan-400">{shift}/3</span></div>
                      <div>Score: <span className="font-bold text-green-400">{score}</span></div>
                      <div>Tips: <span className="font-bold text-yellow-400">${tips}</span></div>
                      <div className="flex items-center gap-1">
                        NRG: <div className="w-16 bg-black/50 rounded-full h-3 border border-gray-600"><div className={`h-full rounded-full transition-all duration-300 ${bartenderEnergy > 60 ? 'bg-green-500' : bartenderEnergy > LOW_ENERGY_THRESHOLD ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${bartenderEnergy}%` }}></div></div>
                      </div>
                      <div>Errors: <span className="font-bold text-red-500">{writeUps}/{difficultySettings?.MAX_WRITE_UPS}</span></div>
                      <div>Goal: <span className="font-bold text-cyan-400">{presaleHelped}/{presaleTarget}</span></div>
                  </div>
            </div>
             <div className="flex flex-wrap justify-center items-start gap-1 sm:gap-2 border-t border-purple-500/30 pt-1">
                <StationComponent name="Soda" item={Item.Soda} status={getStationStatus(Item.Soda)} onClick={() => handleItemClick(Item.Soda)} supplyLevel={gameState.sodaSyrupLevel}/>
                <StationComponent name="Water" item={Item.Water} status={getStationStatus(Item.Water)} onClick={() => handleItemClick(Item.Water)}/>
                <StationComponent name="Icee" item={Item.Icee} status={getStationStatus(Item.Icee)} onClick={() => handleItemClick(Item.Icee)}/>
                <StationComponent name="Shake" item={Item.Milkshake} status={getStationStatus(Item.Milkshake)} onClick={() => handleItemClick(Item.Milkshake)} supplyLevel={gameState.milkshakeIceCreamLevel}/>
                <StationComponent name="Beer" item={Item.Beer} status={getStationStatus(Item.Beer)} onClick={() => handleItemClick(Item.Beer)}/>
                <StationComponent name="Mix" item={Item.MixedDrink} status={getStationStatus(Item.MixedDrink)} onClick={() => handleItemClick(Item.MixedDrink)}/>
                <StationComponent name="Ice" item={Item.Ice} status={getIceMachineStatus()} onClick={() => handleItemClick(Item.Ice)} supplyLevel={gameState.iceLevel}/>
             </div>
        </div>
        
        <div className="flex-1 y2k-panel neon-border-cyan p-2 relative overflow-hidden">
            <div className={`absolute inset-0 floor-grid z-[-1] transition-all duration-300 ${rushHourRemaining > 0 ? 'opacity-30' : 'opacity-10'}`}></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%] h-full carpet-runner z-0 opacity-80"></div>
            <div className="absolute top-[28%] left-1/2 -translate-x-1/2 w-[95%] h-6 y2k-panel neon-border-pink rounded-md z-[5] bg-[#ff00de]/10"></div>

            <BartenderComponent position={bartenderPosition} />
            {fallingSnacks.map(snack => <MemoizedSnack key={snack.id} snack={snack} onSnackClick={handleSnackClick} />)}

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-8 y2k-panel neon-border-pink rounded-t-lg flex items-center justify-center z-10 bg-black">
                <div className="text-pink-400 font-brand text-[10px] md:text-sm tracking-widest neon-text-pink">ENTRANCE</div>
            </div>

            {guests.map(guest => <MemoizedGuest key={guest.id} guest={guest} onGuestClick={handleGuestClick} preparedItems={preparedItems}/>)}
        </div>
      </div>
       
       {idCheckGuest && <IdCheckModal guest={idCheckGuest} onDecision={handleIdCheckDecision} onClose={() => { setIdCheckGuest(null); dispatch({ type: 'SET_PLAYER_BUSY', payload: false }); }} />}
       {movieSelectionGuest && <MovieSelectionModal guest={movieSelectionGuest} movies={MOVIES} onSelect={handleMovieSelection} onClose={() => { setMovieSelectionGuest(null); dispatch({ type: 'SET_PLAYER_BUSY', payload: false }); }} />}
       {seatSwapGuest && <SeatSwapModal guest={seatSwapGuest} onSwap={handleSeatSwap} onClose={() => { setSeatSwapGuest(null); dispatch({ type: 'SET_PLAYER_BUSY', payload: false }); }} />}
      
      {showCrashScreen && (
        <div className="absolute inset-0 bg-black z-[200] flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-6xl md:text-8xl font-brand neon-text-red animate-pulse">CRASH OUT!!!</h1>
            <h2 className="text-2xl md:text-4xl font-brand neon-text-yellow mt-4">NEURAL LINK SEVERED</h2>
            <button onClick={handleReturnToMenu} className="y2k-button yellow text-xl mt-12">Return to Menu</button>
        </div>
      )}

       {isGameOver && !crashedOut && difficultySettings && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-[150] text-center p-4">
          {(() => {
            const isFired = !!firedReason, isLastShift = shift >= 3;
            return (
              <div className={`y2k-panel p-8 md:p-12 ${isFired ? 'neon-border-red' : 'neon-border-green'} max-w-2xl`}>
                <h2 className={`text-4xl md:text-6xl font-brand mb-4 ${isFired ? 'neon-text-red' : 'neon-text-green'}`}>{isFired ? "TERMINATED" : "SHIFT SUCCESS"}</h2>
                {isFired && <p className="text-xl text-yellow-300 mb-2">Reason: {firedReason}</p>}
                {!isFired && posterUrl && <div className="mb-4"><img src={posterUrl} className="w-24 mx-auto rounded border border-cyan-500 shadow-cyan-500/50" /></div>}
                <div className="space-y-2 mb-8">
                    <p className="text-3xl text-white">Score: <span className="font-bold text-green-400">{score}</span></p>
                    <p className="text-3xl text-white">Tips: <span className="font-bold text-yellow-400">${tips}</span></p>
                    {endOfShiftPenalty < 0 && <p className="text-lg text-red-400">Unserved Penalty: {endOfShiftPenalty}</p>}
                </div>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  {!isFired ? <button onClick={advanceShift} className="y2k-button green text-lg">{isLastShift ? 'Next Level' : 'Next Shift'}</button> : <button onClick={startGame} className="y2k-button yellow text-lg">Retry</button>}
                  <button onClick={handleReturnToMenu} className="y2k-button text-base">Main Menu</button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </main>
  );
}