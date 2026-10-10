
import React, { useState, useEffect } from 'react';
import { Guest } from '../types';
import { Icon } from './Icon';
import { ICONS } from '../constants';

interface SeatSwapModalProps {
  guest: Guest;
  onSwap: (guestId: number, selectedSeatCount: number) => void;
  onClose: () => void;
}

const TOTAL_SEATS = 30; // 5 rows, 6 cols

export const SeatSwapModal: React.FC<SeatSwapModalProps> = ({ guest, onSwap, onClose }) => {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([]);

  useEffect(() => {
    // When the modal opens, generate a random set of occupied seats.
    const generateOccupied = () => {
      const occupied = new Set<number>();
      // Randomly occupy between 20% and 50% of the seats.
      const minOccupied = Math.floor(TOTAL_SEATS * 0.2);
      const maxOccupied = Math.floor(TOTAL_SEATS * 0.5);
      const numberOfOccupied = Math.floor(Math.random() * (maxOccupied - minOccupied + 1)) + minOccupied;

      while (occupied.size < numberOfOccupied) {
        const randomIndex = Math.floor(Math.random() * TOTAL_SEATS);
        occupied.add(randomIndex);
      }
      setOccupiedSeats(Array.from(occupied));
    };

    generateOccupied();
  }, []); // Empty dependency array ensures this runs only once when the component mounts.


  const toggleSeat = (seatIndex: number) => {
    if (occupiedSeats.includes(seatIndex)) return; // Can't select an occupied seat

    setSelectedSeats(prev => 
      prev.includes(seatIndex) 
        ? prev.filter(s => s !== seatIndex)
        : [...prev, seatIndex]
    );
  };

  const handleConfirm = () => {
    onSwap(guest.id, selectedSeats.length);
  };

  const requiredSeats = guest.ticketCount || 1;

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="y2k-panel neon-border-cyan p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-brand neon-text-cyan flex items-center">
            <Icon svg={ICONS.chair} className="w-8 h-8 mr-3" /> Seat Swap Request
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-brand leading-none">&times;</button>
        </div>
        
        <div className="y2k-panel border-gray-600 rounded-lg p-4 mb-4 text-center">
            <p className="text-xl text-gray-200">
                Guest wants to swap <strong className="text-yellow-300 font-bold">{requiredSeats}</strong> seat{requiredSeats > 1 ? 's' : ''}.
            </p>
            <p className="text-lg text-gray-400" dangerouslySetInnerHTML={{ __html: `Please select <strong class="font-bold text-yellow-300">${requiredSeats}</strong> new seats from the layout below.` }}></p>
        </div>
        
        <div className="y2k-panel border-gray-700 p-4 rounded-lg">
            <div className="w-full font-brand h-4 mb-4 text-center text-xl text-gray-300 neon-text-pink tracking-[.2em]">SCREEN</div>
            <div className="grid grid-cols-6 gap-2 justify-items-center">
                {Array.from({ length: TOTAL_SEATS }).map((_, index) => {
                    const isSelected = selectedSeats.includes(index);
                    const isOccupied = occupiedSeats.includes(index);
                    
                    return (
                        <button 
                            key={index}
                            onClick={() => toggleSeat(index)}
                            disabled={isOccupied}
                            className={`w-10 h-10 rounded-md transition-colors flex items-center justify-center y2k-panel ${isSelected ? 'neon-border-cyan' : isOccupied ? 'border-red-800 bg-red-900/50 cursor-not-allowed' : 'border-gray-600 hover:border-cyan-400'}`}
                        >
                            <Icon svg={ICONS.chair} className={`w-6 h-6 ${isSelected ? 'text-cyan-300' : isOccupied ? 'text-red-500/60' : 'text-gray-500'}`} />
                        </button>
                    )
                })}
            </div>
        </div>
        
        <div className="mt-6 flex justify-between items-center">
            <p className="text-xl font-bold font-brand">
                Selected: <span className={`px-2 py-1 rounded ${selectedSeats.length === requiredSeats ? 'neon-text-green' : 'neon-text-red'}`}>{selectedSeats.length}</span> / {requiredSeats}
            </p>
            <button
                onClick={handleConfirm}
                disabled={selectedSeats.length !== requiredSeats}
                className="y2k-button green"
            >
                Confirm
            </button>
        </div>
      </div>
    </div>
  );
};
