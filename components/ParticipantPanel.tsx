'use client';

import { useState } from 'react';
import { useSchedulerStore } from '@/lib/store';

export default function ParticipantPanel() {
  const { 
    participants, 
    currentParticipant, 
    addParticipant, 
    setCurrentParticipant,
    clearParticipantAvailability 
  } = useSchedulerStore();
  
  const [name, setName] = useState('');
  const [showInput, setShowInput] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addParticipant(name.trim());
      setName('');
      setShowInput(false);
    }
  };
  
  const handleSelectParticipant = (id: string) => {
    setCurrentParticipant(id);
  };
  
  const handleClearAvailability = (participantId: string, participantName: string) => {
    if (confirm(`Clear all availability for ${participantName}?`)) {
      clearParticipantAvailability(participantId);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 md:p-6 border-2 md:border-4 border-ethiopian-gold">
      <h3 className="text-lg md:text-2xl font-bold text-ethiopian-dark-green dark:text-ethiopian-green mb-3 md:mb-4">
        Participants
      </h3>
      
      {/* Add participant button/form */}
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="w-full py-2 md:py-3 mb-3 md:mb-4 bg-ethiopian-green text-white rounded-lg hover:bg-ethiopian-dark-green transition-colors font-semibold flex items-center justify-center gap-2 text-sm md:text-base touch-manipulation"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Your Name
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mb-3 md:mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            autoFocus
            className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-ethiopian-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-ethiopian-green mb-2 text-sm md:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-ethiopian-green text-white rounded-lg hover:bg-ethiopian-dark-green transition-colors font-semibold text-sm md:text-base touch-manipulation"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowInput(false);
                setName('');
              }}
              className="flex-1 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-semibold text-sm md:text-base touch-manipulation"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      
      {/* Participants list */}
      {participants.length === 0 ? (
        <div className="text-center py-6 md:py-8 text-gray-400 dark:text-gray-500">
          <div className="text-3xl md:text-4xl mb-2">👥</div>
          <p className="text-sm md:text-base">No participants yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className={`
                p-2.5 md:p-4 rounded-lg border-2 cursor-pointer transition-all touch-manipulation
                ${currentParticipant === participant.id
                  ? 'border-ethiopian-green bg-ethiopian-light-gold dark:bg-gray-700 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:border-ethiopian-yellow hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
              onClick={() => handleSelectParticipant(participant.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  <div
                    className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: participant.color }}
                  />
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm md:text-base truncate">
                    {participant.name}
                  </span>
                  {currentParticipant === participant.id && (
                    <span className="text-xs bg-ethiopian-green text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded flex-shrink-0">
                      Active
                    </span>
                  )}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearAvailability(participant.id, participant.name);
                  }}
                  className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0 ml-2 touch-manipulation"
                  title="Clear availability"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Instructions */}
      {currentParticipant && (
        <div className="mt-3 md:mt-4 p-2 md:p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 rounded">
          <p className="text-xs md:text-sm text-blue-800 dark:text-blue-300">
            <strong>Tip:</strong> Tap time slots on the availability grid to mark when you&apos;re free!
          </p>
        </div>
      )}
    </div>
  );
}

