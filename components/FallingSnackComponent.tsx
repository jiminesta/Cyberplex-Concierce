

import React from 'react';
import { FallingSnack } from '../types';
import { ICONS } from '../constants';
import { Icon } from './Icon';

interface FallingSnackProps {
  snack: FallingSnack;
  onSnackClick: (id: number) => void;
}

export const FallingSnackComponent: React.FC<FallingSnackProps> = ({ snack, onSnackClick }) => {
  const iconKey = snack.type === 'pretzel' ? 'snack_pretzel' : 'snack_energy_drink';
  const glowClass = snack.type === 'pretzel' ? 'shadow-yellow-400/70' : 'shadow-green-400/70';

  return (
    <div
      className="absolute transition-all duration-500 ease-linear transform -translate-x-1/2 -translate-y-1/2 z-[9] cursor-pointer"
      style={{ left: `${snack.position.x}%`, top: `${snack.position.y}%` }}
      onClick={() => onSnackClick(snack.id)}
    >
      <div 
        className={`w-8 h-8 flex items-center justify-center animate-pulse shadow-lg ${glowClass} rounded-full`}
      >
        <Icon svg={ICONS[iconKey]} className={`w-8 h-8`} />
      </div>
    </div>
  );
};