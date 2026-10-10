import React from 'react';
import { Item } from '../types';
import { Icon } from './Icon';
import { ICONS, ITEM_PREP_TIMES, REFILL_TIME_MS, MAX_SUPPLY, ITEM_COLORS } from '../constants';


type StationStatus = 'Idle' | 'Preparing' | 'Ready' | 'Empty' | 'Refilling' | 'Blocked';

interface StationProps {
  name: string;
  item: Item;
  status: StationStatus;
  onClick: () => void;
  supplyLevel?: number;
}

// Icon mapping for cinema concession items
const ITEM_ICONS: { [key in Item]: string } = {
    [Item.Soda]: ICONS.soda,
    [Item.Water]: ICONS.water,
    [Item.Ticket]: ICONS.ticket,
    [Item.Beer]: ICONS.beer,
    [Item.MixedDrink]: ICONS.mixedDrink,
    [Item.Icee]: ICONS.icee,
    [Item.Milkshake]: ICONS.milkshake,
    [Item.Ice]: ICONS.ice,
}

export const StationComponent: React.FC<StationProps> = ({ name, item, status, onClick, supplyLevel }) => {
  const itemColorTheme = ITEM_COLORS[item];

  const getStatusClasses = () => {
    switch (status) {
      case 'Preparing':
        return 'neon-border-yellow animate-pulse cursor-not-allowed';
      case 'Refilling':
        return 'neon-border-cyan animate-pulse cursor-not-allowed';
      case 'Ready':
        return 'neon-border-green animate-pulse cursor-default';
      case 'Empty':
        return 'neon-border-red hover:border-red-400 cursor-pointer animate-pulse';
      case 'Blocked':
        return 'border-gray-600 cursor-not-allowed opacity-60';
      default: // Idle
        return `${itemColorTheme?.border || 'border-gray-700'} hover:opacity-80 cursor-pointer`;
    }
  };
  
  const prepDuration = (status === 'Refilling' ? REFILL_TIME_MS : ITEM_PREP_TIMES[item]) / 1000;
  const isProgressing = status === 'Preparing' || status === 'Refilling';
  const iconToShow = (status === 'Empty' && item !== Item.Ice) ? ICONS.refill : ITEM_ICONS[item];
  
  const iconColor = () => {
    if (status === 'Blocked') return 'text-gray-400';
    if (status === 'Empty') return 'text-red-400';
    if (status === 'Ready') return 'text-green-400';
    return itemColorTheme?.text?.replace('neon-text', 'text') || 'text-gray-200';
  }

  const canClick = () => {
    if (item === Item.Ice) {
        return status === 'Empty';
    }
    return status === 'Idle' || status === 'Empty';
  }

  const getStatusText = () => {
      if (status === 'Empty') return 'Refill';
      if (status === 'Blocked') return 'No Ice';
      if (status === 'Ready') return 'Ready!';
      return status;
  }

  return (
    <div
      onClick={canClick() ? onClick : undefined}
      className={`y2k-panel w-16 h-24 md:w-20 md:h-28 text-center p-1 md:p-2 transition-colors flex-shrink-0 flex flex-col justify-between ${getStatusClasses()}`}
    >
      <div>
        <Icon svg={iconToShow} className={`w-8 h-8 md:w-10 mx-auto transition-colors ${iconColor()}`} />
        <p className={`font-semibold mt-1 text-[10px] md:text-xs leading-tight transition-colors ${itemColorTheme?.text?.replace('neon-', '') || 'text-gray-200'}`}>{name}</p>
      </div>
      
      <div className="text-xs text-gray-300 h-6 flex flex-col items-center justify-center">
          {isProgressing ? (
             <span className="inline-block w-full h-2 bg-black/50 rounded-full overflow-hidden">
                <span className="block h-full bg-yellow-400 rounded-full animate-progress" style={{ animationDuration: `${prepDuration}s`}}></span>
             </span>
          ) : (
            <span className="font-bold">{getStatusText()}</span>
          )}
          {typeof supplyLevel !== 'undefined' && !isProgressing && (
             <div className="w-full bg-black/50 rounded-full h-2 mt-1">
                <div 
                    className={`${supplyLevel < 20 ? 'bg-red-500' : (itemColorTheme?.bg || 'bg-cyan-400')} h-2 rounded-full transition-all duration-300`} 
                    style={{ width: `${(supplyLevel / MAX_SUPPLY) * 100}%` }}>
                </div>
             </div>
          )}
      </div>

      <style>{`
        @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
        }
        .animate-progress {
            animation-name: progress;
            animation-timing-function: linear;
            animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};