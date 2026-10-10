
import React from 'react';
import { Guest } from '../types';
import { Icon } from './Icon';
import { ICONS } from '../constants';

interface IdCheckModalProps {
  guest: Guest;
  onDecision: (decision: 'serve' | 'deny') => void;
  onClose: () => void;
}

export const IdCheckModal: React.FC<IdCheckModalProps> = ({ guest, onDecision, onClose }) => {
  const { dob, idExpires, name } = guest;
  const isUnderage = dob.year >= 2004;
  const isExpired = idExpires.year < 2024;

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="y2k-panel neon-border-yellow p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-brand neon-text-yellow flex items-center"><Icon svg={ICONS.id_card} className="w-8 h-8 mr-3" />ID Check</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-brand leading-none">&times;</button>
        </div>
        
        {/* ID Card */}
        <div className="y2k-panel neon-border-cyan p-4">
            <div className="flex items-center border-b-2 border-cyan-500/50 pb-2 mb-2">
                <h3 className="text-xl font-brand neon-text-cyan">STATE DRIVER LICENSE</h3>
            </div>
            <div className="flex space-x-4">
                <div className="w-24 h-24 y2k-panel border-cyan-700 rounded-md flex items-center justify-center">
                    <Icon svg={ICONS.person} className="w-20 h-20 text-cyan-300" />
                </div>
                <div className="flex-1 space-y-1 text-lg">
                    <div>
                        <p className="text-sm text-cyan-400 font-brand">NAME</p>
                        <p className="font-bold text-white">{name.toUpperCase()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-cyan-400 font-brand">DATE OF BIRTH</p>
                        <p className={`font-bold ${isUnderage ? 'neon-text-red animate-pulse' : 'text-white'}`}>
                            {dob.month.toString().padStart(2, '0')}/{dob.day.toString().padStart(2, '0')}/{dob.year}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-cyan-400 font-brand">EXPIRES</p>
                        <p className={`font-bold ${isExpired ? 'neon-text-red animate-pulse' : 'text-white'}`}>
                            {idExpires.month.toString().padStart(2, '0')}/{idExpires.day.toString().padStart(2, '0')}/{idExpires.year}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <p className="text-center text-gray-300 my-4 text-lg">Does this guest meet the requirements to be served alcohol?</p>

        <div className="flex justify-around mt-6">
          <button
            onClick={() => onDecision('deny')}
            className="y2k-button red"
          >
            Deny
          </button>
          <button
            onClick={() => onDecision('serve')}
            className="y2k-button green"
          >
            Serve
          </button>
        </div>
      </div>
    </div>
  );
};
