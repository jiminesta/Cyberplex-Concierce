
import React from 'react';
import { Guest } from '../types';
import { Icon } from './Icon';
import { ICONS } from '../constants';

interface MovieSelectionModalProps {
  guest: Guest;
  movies: string[];
  onSelect: (movie: string) => void;
  onClose: () => void;
}

export const MovieSelectionModal: React.FC<MovieSelectionModalProps> = ({ guest, movies, onSelect, onClose }) => {
  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="y2k-panel neon-border-yellow p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-brand neon-text-yellow flex items-center"><Icon svg={ICONS.ticket} className="w-8 h-8 mr-3" />Sell Ticket</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-brand leading-none">&times;</button>
        </div>
        
        <div className="y2k-panel neon-border-cyan rounded-lg p-4 mb-6 text-center">
            <p className="text-xl text-cyan-200">"{guest.dialog}"</p>
        </div>
        
        <p className="text-center text-gray-300 mb-4 text-lg">Select the movie the guest is asking for:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {movies.map(movie => (
            <button
                key={movie}
                onClick={() => onSelect(movie)}
                className="text-white font-semibold py-3 px-4 rounded-lg text-lg transition text-left y2k-panel border-purple-500 hover:neon-border-purple"
            >
                {movie}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
