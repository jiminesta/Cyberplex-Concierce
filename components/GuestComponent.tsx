import React from 'react';
import { Guest, GuestState, Item } from '../types';
import { ICONS, ITEM_COLORS } from '../constants';
import { Icon } from './Icon';

interface GuestProps {
  guest: Guest;
  onGuestClick: (guest: Guest) => void;
  preparedItems: Item[];
}

const getPersonalizedGuestIcon = (guest: Guest): string => {
    let svg = ICONS.pixel_guest;
    svg = svg.replace(/--HAIR_COLOR--/g, guest.colors.hair);
    svg = svg.replace(/--SKIN_COLOR--/g, guest.colors.skin);
    svg = svg.replace(/--SHIRT_COLOR--/g, guest.colors.shirt);
    svg = svg.replace(/--PANTS_COLOR--/g, guest.colors.pants);
    return svg;
};

export const GuestComponent: React.FC<GuestProps> = ({ guest, onGuestClick, preparedItems }) => {
  const isOrderReady = guest.state === GuestState.WaitingForConcessions && guest.order?.every(item => preparedItems.includes(item));
  const needsIdCheck = guest.order?.some(item => [Item.Beer, Item.MixedDrink].includes(item));

  const getGuestClasses = () => {
    switch (guest.state) {
      case GuestState.LeavingHappy:
        return 'bg-green-500/50 guest-glow-green';
      case GuestState.LeavingAngry:
        return 'bg-red-700/50 guest-glow-red';
      case GuestState.WaitingToOrder:
        return 'bg-yellow-600/50 guest-glow-yellow';
      case GuestState.WaitingForConcessions:
        if (isOrderReady) {
            return needsIdCheck ? 'bg-purple-500/50 animate-pulse guest-glow-purple' : 'bg-blue-400/50 animate-pulse guest-glow-blue';
        }
        return 'bg-blue-600/50 guest-glow-blue';
      case GuestState.WaitingForTicketCheck:
        return 'bg-purple-600/50 guest-glow-purple';
      case GuestState.WaitingToBuyTicket:
        return 'bg-orange-600/50 guest-glow-orange';
      case GuestState.WaitingForSecurityCheck:
        return 'bg-cyan-500/50 guest-glow-cyan';
      case GuestState.WaitingForSeatSwap:
        return 'bg-teal-500/50 guest-glow-teal';
      default:
        return 'bg-gray-500/50';
    }
  };

  const getCursorStyle = () => {
    switch(guest.state) {
        case GuestState.LeavingHappy:
        case GuestState.LeavingAngry:
            return 'cursor-default';
        default:
            return 'cursor-pointer hover:scale-110';
    }
  }

  const mainIconSvg = guest.state === GuestState.WaitingForSecurityCheck ? ICONS.search : getPersonalizedGuestIcon(guest);
  const iconColorClass = guest.state === GuestState.WaitingForSecurityCheck ? 'text-cyan-300' : '';

  const getDialogPositioning = () => {
    if (guest.position.x < 35) {
      return {
        bubble: 'left-0',
        arrow: 'left-[1.5rem] -translate-x-1/2',
      };
    }
    if (guest.position.x > 65) {
      return {
        bubble: 'right-0',
        arrow: 'right-[1.5rem] translate-x-1/2',
      };
    }
    return {
      bubble: 'left-1/2 -translate-x-1/2',
      arrow: 'left-1/2 -translate-x-1/2',
    };
  };

  const dialogPositioning = getDialogPositioning();

  return (
    <div
      className={`absolute transition-all duration-500 ease-in-out transform -translate-x-1/2 -translate-y-1/2 ${getCursorStyle()} z-10`}
      style={{ left: `${guest.position.x}%`, top: `${guest.position.y}%` }}
      onClick={() => onGuestClick(guest)}
    >
      <div className="relative group">
        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg ${getGuestClasses()} flex items-center justify-center shadow-lg transition-all`}>
          <Icon svg={mainIconSvg} className={`w-10 h-10 md:w-12 md:h-12 ${iconColorClass}`} />
        </div>
        
        {guest.isPresale && guest.state !== GuestState.LeavingAngry && guest.state !== GuestState.LeavingHappy && (
            <div className="absolute -top-1.5 -right-1.5 animate-pulse">
                <Icon svg={ICONS.ticket} className="w-6 h-6 text-yellow-300 neon-text-yellow" />
            </div>
        )}

        <div className={`absolute bottom-full mb-2 w-max max-w-[70vw] sm:max-w-xs p-3 y2k-panel neon-border-cyan text-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 ${dialogPositioning.bubble}`}>
            <p className="font-bold text-cyan-300">{GuestState[guest.state].replace(/([A-Z])/g, ' $1').trim()}</p>
            <p className="text-white whitespace-normal" dangerouslySetInnerHTML={{ __html: `"${guest.dialog.replace(/(\d+)/g, '<strong class="font-bold text-yellow-300">$1</strong>')}"` }}></p>
            {guest.state === GuestState.WaitingForConcessions && guest.order && (
                <div className="mt-1 pt-1 border-t border-cyan-800">
                    <p className="font-semibold text-gray-200">Order:</p>
                    <ul className="flex flex-wrap gap-2 mt-1">
                        {guest.order.map((item, index) => {
                          const colorInfo = ITEM_COLORS[item];
                          const isReady = preparedItems.includes(item);
                          return (
                           <li key={index} className={`px-1.5 py-0.5 rounded text-sm font-bold transition-opacity ${colorInfo?.bg || 'bg-gray-500'} ${colorInfo?.contrastText || 'text-white'} ${!isReady ? 'opacity-50' : ''}`}>
                                {item}
                           </li>
                          )
                        })}
                    </ul>
                </div>
            )}
             <div className={`absolute bg-[#1a1c44] h-2 w-2 bottom-0 translate-y-1/2 rotate-45 border-r-2 border-b-2 border-cyan-500 ${dialogPositioning.arrow}`}></div>
        </div>
      </div>
    </div>
  );
};