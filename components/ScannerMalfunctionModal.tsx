
import React, { useState, useEffect, useRef } from 'react';
import { Guest } from '../types';
import { Icon } from './Icon';
import { ICONS } from '../constants';

interface ScannerMalfunctionModalProps {
  guest: Guest;
  onFix: (guestId: number) => void;
  onClose: () => void;
}

const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${result.slice(0,3)}-${result.slice(3,6)}`;
}

export const ScannerMalfunctionModal: React.FC<ScannerMalfunctionModalProps> = ({ guest, onFix, onClose }) => {
    const [userInput, setUserInput] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setGeneratedCode(generateCode());
        // Focus the input field when the modal opens
        inputRef.current?.focus();
    }, []);

    const handleConfirm = () => {
        if (userInput.toUpperCase() === generatedCode) {
            onFix(guest.id);
        }
    };

    const isCorrect = userInput.toUpperCase() === generatedCode;

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="y2k-panel neon-border-red animate-pulse p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-brand neon-text-red flex items-center">
                        <Icon svg={ICONS.system_error} className="w-8 h-8 mr-3" /> SYSTEM MALFUNCTION
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-brand leading-none">&times;</button>
                </div>

                <div className="bg-black/50 rounded-lg p-4 mb-4 text-left text-lg text-green-400 neon-text-green border-2 border-green-900/50">
                    <p>&gt; Ticket Scanner service unresponsive.</p>
                    <p>&gt; Error code: 503_SVC_UNAVAILABLE</p>
                    <p>&gt; Manual reboot required.</p>
                    <p className="text-yellow-400 neon-text-yellow">&gt; Please enter override code to proceed.</p>
                </div>
                
                <div className="bg-black/50 y2k-panel border-gray-700 p-4 rounded-lg flex flex-col items-center">
                    <p className="text-lg text-gray-300 mb-2 font-brand">OVERRIDE CODE:</p>
                    <p className="text-4xl font-brand tracking-widest text-white bg-gray-900 px-4 py-2 rounded-md neon-text-cyan">
                        {generatedCode}
                    </p>
                    <input 
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyUp={(e) => e.key === 'Enter' && isCorrect && handleConfirm()}
                        maxLength={7}
                        className="mt-4 w-full p-3 bg-gray-900 text-white text-2xl text-center tracking-widest rounded-md border-2 border-gray-600 focus:outline-none focus:border-cyan-400 y2k-panel"
                        placeholder="ABC-123"
                        style={{fontFamily: "'Press Start 2P', cursive"}}
                    />
                </div>

                <div className="mt-6 flex justify-end items-center">
                    <button
                        onClick={handleConfirm}
                        disabled={!isCorrect}
                        className="y2k-button green flex items-center space-x-2"
                    >
                        <Icon svg={ICONS.keyboard} className="w-6 h-6"/>
                        <span>Reboot</span>
                    </button>
                </div>
            </div>
        </div>
    );
};