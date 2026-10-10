

import React, { useState, useEffect } from 'react';
import { PhoneCall, PhoneCallType } from '../types';
import { Icon } from './Icon';
import { ICONS } from '../constants';

interface PhoneCallModalProps {
  call: PhoneCall;
  movies: string[];
  onConfirmSale: (movie: string, ticketCount: number) => void;
  onProcessRefund: () => void;
  onProcessSeatSwap: (selectedSeatCount: number) => void;
  onClose: () => void;
}

const TOTAL_SEATS = 30; // 5 rows, 6 cols

export const PhoneCallModal: React.FC<PhoneCallModalProps> = ({ call, movies, onConfirmSale, onProcessRefund, onProcessSeatSwap, onClose }) => {
  const [selectedMovie, setSelectedMovie] = useState('');
  const [ticketCount, setTicketCount] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([]);

  useEffect(() => {
    // When the modal opens for a seat swap, generate a random set of occupied seats.
    if (call.type === PhoneCallType.SeatSwap) {
        const occupied = new Set<number>();
        const minOccupied = Math.floor(TOTAL_SEATS * 0.2);
        const maxOccupied = Math.floor(TOTAL_SEATS * 0.5);
        const numberOfOccupied = Math.floor(Math.random() * (maxOccupied - minOccupied + 1)) + minOccupied;
        while (occupied.size < numberOfOccupied) {
            const randomIndex = Math.floor(Math.random() * TOTAL_SEATS);
            occupied.add(randomIndex);
        }
        setOccupiedSeats(Array.from(occupied));
        setSelectedSeats([]); // Reset selection when call changes
    }
  }, [call]);

  const toggleSeat = (seatIndex: number) => {
    if (occupiedSeats.includes(seatIndex)) return; // Can't select an occupied seat

    setSelectedSeats(prev => 
      prev.includes(seatIndex) 
        ? prev.filter(s => s !== seatIndex)
        : [...prev, seatIndex]
    );
  };

  const handleConfirm = () => {
    switch(call.type) {
        case PhoneCallType.BuyTickets:
            onConfirmSale(selectedMovie, ticketCount);
            break;
        case PhoneCallType.RequestRefund:
            onProcessRefund();
            break;
        case PhoneCallType.SeatSwap:
            onProcessSeatSwap(selectedSeats.length);
            break;
    }
  };

  const getConfirmButtonText = () => {
    switch (call.type) {
        case PhoneCallType.BuyTickets: return 'Confirm Sale';
        case PhoneCallType.RequestRefund: return 'Process Refund';
        case PhoneCallType.SeatSwap: return 'Confirm Swap';
        default: return 'Confirm';
    }
  };

  const isReadyToConfirm = () => {
    switch (call.type) {
        case PhoneCallType.BuyTickets:
            return !!selectedMovie && ticketCount > 0;
        case PhoneCallType.RequestRefund:
            return true;
        case PhoneCallType.SeatSwap:
            return selectedSeats.length === (call.details.ticketCount || 0);
        default:
            return false;
    }
  };
  
  const requiredSeatsForSwap = call.details.ticketCount || 0;
  
  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="y2k-panel neon-border-pink p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-brand neon-text-pink flex items-center">
            <Icon svg={ICONS.phone} className="w-8 h-8 mr-3" /> Incoming Call
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-brand leading-none">&times;</button>
        </div>

        <div className="y2k-panel neon-border-cyan rounded-lg p-4 mb-6 text-center">
            <p className="text-xl text-cyan-200" dangerouslySetInnerHTML={{ __html: `"${call.dialog.replace(/(\d+)/g, '<strong class="font-bold text-yellow-300">$1</strong>')}"` }}></p>
        </div>

        {call.type === PhoneCallType.BuyTickets && (
          <div className="space-y-4">
            <div>
              <p className="block text-lg font-brand neon-text-yellow mb-2">Select Movie:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {movies.map(movie => (
                  <button
                      key={movie}
                      onClick={() => setSelectedMovie(movie)}
                      className={`text-white font-semibold py-3 px-4 rounded-lg text-base transition text-left y2k-panel ${selectedMovie === movie ? 'neon-border-purple' : 'border-purple-500 hover:neon-border-purple'}`}
                  >
                      {movie}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-lg font-brand neon-text-yellow mb-2">Number of Tickets:</label>
              <div className="flex items-center justify-center space-x-4">
                <button onClick={() => setTicketCount(c => Math.max(1, c - 1))} className="y2k-button text-2xl px-4">-</button>
                <span className="text-3xl font-bold text-white w-16 text-center">{ticketCount}</span>
                <button onClick={() => setTicketCount(c => Math.min(8, c + 1))} className="y2k-button text-2xl px-4">+</button>
              </div>
            </div>
          </div>
        )}

        {call.type === PhoneCallType.RequestRefund && (
            <p className="text-center text-gray-300 my-4 text-lg">Process the refund for the customer?</p>
        )}
        
        {call.type === PhoneCallType.SeatSwap && (
          <div className="space-y-4">
            <div className="y2k-panel border-gray-700 p-4 rounded-lg">
                <div className="w-full font-brand h-4 mb-4 text-center text-xl text-gray-300 neon-text-pink tracking-[.2em]">THEATRE LAYOUT</div>
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
            <div className="flex justify-between items-center">
                <p className="text-xl font-bold font-brand">
                    Selected: <span className={`px-2 py-1 rounded ${selectedSeats.length === requiredSeatsForSwap ? 'neon-text-green' : 'neon-text-red'}`}>{selectedSeats.length}</span> / {requiredSeatsForSwap}
                </p>
            </div>
          </div>
        )}


        <div className="mt-8 flex justify-end">
          <button
            onClick={handleConfirm}
            disabled={!isReadyToConfirm()}
            className="y2k-button green"
          >
            {getConfirmButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};