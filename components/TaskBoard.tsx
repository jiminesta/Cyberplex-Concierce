

import React from 'react';
import { Task, TaskType, Item } from '../types';
import { Icon } from './Icon';
import { ICONS, ITEM_COLORS } from '../constants';

interface TaskBoardProps {
  tasks: Task[];
  onTaskAction: (task: Task) => void;
  preparedItems: Item[];
  onTaskAcknowledge: (taskId: number) => void;
}

const TaskCard: React.FC<{ task: Task, onTaskAction: (task: Task) => void, preparedItems: Item[], onTaskAcknowledge: (taskId: number) => void }> = ({ task, onTaskAction, preparedItems, onTaskAcknowledge }) => {
  const isDeliverable = task.type === TaskType.DeliverToTheatre && task.items?.every(item => preparedItems.includes(item));
  const canAct = task.type === TaskType.AnswerPhone || isDeliverable;

  const getIcon = () => {
    switch(task.type) {
      case TaskType.AnswerPhone:
        return ICONS.phone;
      case TaskType.DeliverToTheatre:
        return ICONS.theatre;
    }
  };

  const patiencePercentage = (task.patience ?? 100) / 100 * 100;
  
  const getPatienceColor = (patience: number) => {
    if (patience < 30) return 'bg-red-500';
    if (patience < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  return (
    <div 
      className={`y2k-panel p-3 shadow-md transition-all ${canAct ? 'neon-border-green' : 'neon-border-yellow'} ${task.isNew ? 'animate-pulse' : ''}`}
      onPointerEnter={() => {
        if (task.isNew) {
          onTaskAcknowledge(task.id);
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon svg={getIcon()} className="w-8 h-8 text-cyan-400" />
          <div>
            <p className="font-semibold text-white text-lg">{task.description}</p>
            {task.theatre && <p className="text-sm text-gray-400">For Theatre {task.theatre}</p>}
          </div>
        </div>
        <button
          onClick={() => onTaskAction(task)}
          disabled={!canAct}
          className={`px-3 py-1 text-sm font-bold rounded-md transition ${canAct ? 'bg-green-500/80 hover:bg-green-400 text-white' : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'}`}
        >
          {task.type === TaskType.AnswerPhone ? 'Answer' : 'Deliver'}
        </button>
      </div>
      {task.items && (
        <div className="mt-2 pt-2 border-t border-pink-800/50">
          <p className="text-xs font-bold text-gray-300 mb-1">Required:</p>
          <ul className="flex flex-wrap gap-1">
            {task.items.map((item, index) => {
              const colorInfo = ITEM_COLORS[item];
              const isReady = preparedItems.includes(item);
              return (
                <li key={index} className={`px-2 py-0.5 text-xs font-bold rounded-full transition-opacity ${colorInfo?.bg || 'bg-gray-500'} ${colorInfo?.contrastText || 'text-white'} ${!isReady ? 'opacity-50' : ''}`}>
                  {item}
                </li>
              )
            })}
          </ul>
        </div>
      )}
      <div className="w-full bg-black/50 rounded-full h-1.5 mt-3">
        <div 
          className={`h-1.5 rounded-full ${getPatienceColor(patiencePercentage)} transition-all duration-200`}
          style={{ width: `${patiencePercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onTaskAction, preparedItems, onTaskAcknowledge }) => {
  return (
    <div className="space-y-3 overflow-y-auto flex-1 pr-1">
      {tasks.length === 0 ? (
        <p className="text-center text-gray-500 mt-8 text-lg">No urgent tasks. Phew!</p>
      ) : (
        tasks.map(task => <TaskCard key={task.id} task={task} onTaskAction={onTaskAction} preparedItems={preparedItems} onTaskAcknowledge={onTaskAcknowledge}/>)
      )}
    </div>
  );
};