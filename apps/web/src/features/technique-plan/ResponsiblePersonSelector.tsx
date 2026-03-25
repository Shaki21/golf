/**
 * ResponsiblePersonSelector Component
 *
 * Allows users to assign coaches or players as responsible persons for a technique task.
 */

import React, { useState, useEffect } from 'react';
import { techniquePlanAPI } from '../../services/api';
import { Search, Plus, X, Loader, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ResponsiblePerson {
  id: string;
  userId: string;
  role?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface ResponsiblePersonSelectorProps {
  taskId: string;
  existingResponsible: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  onPersonAdded: () => void;
  onPersonRemoved: () => void;
}

export default function ResponsiblePersonSelector({
  taskId,
  existingResponsible,
  onPersonAdded,
  onPersonRemoved
}: ResponsiblePersonSelectorProps) {
  const { user } = useAuth();
  const [showSelector, setShowSelector] = useState(false);
  const [addingPerson, setAddingPerson] = useState<string | null>(null);
  const [removingPerson, setRemovingPerson] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'coach' | 'player' | 'self'>('self');

  const handleAddResponsible = async (roleType: 'coach' | 'player' | 'self') => {
    if (!user?.id) return;

    setAddingPerson(roleType);
    try {
      // For 'self', assign the current user
      const userId = user.id;
      const role = roleType === 'self' ? (user.role || 'player') : roleType;

      await techniquePlanAPI.assignResponsible(taskId, {
        userId,
        role,
      });

      onPersonAdded();
      setShowSelector(false);
    } catch (error) {
      console.error('Failed to assign responsible person:', error);
      alert('Could not assign responsible person. Please try again.');
    } finally {
      setAddingPerson(null);
    }
  };

  const handleRemoveResponsible = async (responsibleId: string) => {
    if (!confirm('Are you sure you want to remove this person as responsible?')) return;

    setRemovingPerson(responsibleId);
    try {
      await techniquePlanAPI.removeResponsible(taskId, responsibleId);
      onPersonRemoved();
    } catch (error) {
      console.error('Failed to remove responsible person:', error);
      alert('Could not remove responsible person. Please try again.');
    } finally {
      setRemovingPerson(null);
    }
  };

  // Check if current user is already assigned
  const isCurrentUserAssigned = existingResponsible.some(
    person => person.name.includes(user?.firstName || '') && person.name.includes(user?.lastName || '')
  );

  return (
    <div className="space-y-3">
      {/* Existing Responsible Persons */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Responsible person</h4>
        {existingResponsible.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No responsible persons assigned yet</p>
        ) : (
          <div className="space-y-2">
            {existingResponsible.map((person) => (
              <div
                key={person.id}
                className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    {person.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{person.name}</p>
                    <p className="text-xs text-gray-600 capitalize">{person.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveResponsible(person.id)}
                  disabled={removingPerson === person.id}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                  title="Remove responsible"
                >
                  {removingPerson === person.id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Responsible Button */}
      {!showSelector && (
        <button
          onClick={() => setShowSelector(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add responsible
        </button>
      )}

      {/* Responsible Person Selector */}
      {showSelector && (
        <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Assign responsible person</h4>
            <button
              onClick={() => setShowSelector(false)}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            {!isCurrentUserAssigned && (
              <button
                onClick={() => handleAddResponsible('self')}
                disabled={addingPerson === 'self'}
                className="w-full flex items-start justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">Myself</p>
                    <p className="text-xs text-gray-600">
                      I take responsibility for this task
                    </p>
                  </div>
                </div>
                {addingPerson === 'self' ? (
                  <Loader className="w-5 h-5 animate-spin text-purple-600" />
                ) : (
                  <Plus className="w-5 h-5 text-purple-600" />
                )}
              </button>
            )}

            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">
                To assign other persons (coach, teammate), contact your head coach.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
