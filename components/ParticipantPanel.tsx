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
    <div className="bg-white rounded-xl shadow-lg p-6 border-4 border-ethiopian-gold">
      <h3 className="text-2xl font-bold text-ethiopian-dark-green mb-4">
        Participants
      </h3>
      
      {/* Add participant button/form */}
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="w-full py-3 mb-4 bg-ethiopian-green text-white rounded-lg hover:bg-ethiopian-dark-green transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Your Name
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            autoFocus
            className="w-full px-4 py-3 border-2 border-ethiopian-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-ethiopian-green mb-2"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-ethiopian-green text-white rounded-lg hover:bg-ethiopian-dark-green transition-colors font-semibold"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowInput(false);
                setName('');
              }}
              className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      
      {/* Participants list */}
      {participants.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">👥</div>
          <p>No participants yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all
                ${currentParticipant === participant.id
                  ? 'border-ethiopian-green bg-ethiopian-light-gold shadow-md'
                  : 'border-gray-200 hover:border-ethiopian-yellow hover:bg-gray-50'
                }
              `}
              onClick={() => handleSelectParticipant(participant.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: participant.color }}
                  />
                  <span className="font-semibold text-gray-800">
                    {participant.name}
                  </span>
                  {currentParticipant === participant.id && (
                    <span className="text-xs bg-ethiopian-green text-white px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearAvailability(participant.id, participant.name);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Clear availability"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Click and drag on the availability grid to mark when you're free!
          </p>
        </div>
      )}
    </div>
  );
}

