
import React from 'react';
import { ICONS } from '../constants';
import { Icon } from './Icon';

interface BartenderProps {
  position: { x: number; y: number };
}

export const BartenderComponent: React.FC<BartenderProps> = ({ position }) => {
  return (
    <div
      className="absolute transition-all duration-500 ease-in-out transform -translate-x-1/2 -translate-y-1/2 z-[8]"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
        <div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center`}>
          <Icon svg={ICONS.pixel_bartender} className={`w-12 h-12 md:w-14 md:h-14`} />
        </div>
    </div>
  );
};