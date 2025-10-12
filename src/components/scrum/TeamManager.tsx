'use client';

import { useState } from 'react';
import type { TeamMember, Team } from '@/lib/types/scrum';
import TeamMemberCard from './TeamMemberCard';
import CapacityPlanner from './CapacityPlanner';

interface TeamManagerProps {
  team: Team | null;
  members: TeamMember[];
  onCreateTeam: (data: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'averageVelocity'>) => void;
  onUpdateTeam: (data: Partial<Team>) => void;
  onAddMember: (data: Omit<TeamMember, 'id' | 'joinedAt'>) => void;
  onUpdateMember: (id: string, data: Partial<TeamMember>) => void;
  onRemoveMember: (id: string) => void;
}

export default function TeamManager({
  team,
  members,
  onCreateTeam,
  onUpdateTeam,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
}: TeamManagerProps) {
  const [view, setView] = useState<'members' | 'capacity'>('members');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setShowMemberModal(true);
  };

  const handleCloseMemberModal = () => {
    setShowMemberModal(false);
    setEditingMember(null);
  };

  return (
    <div className="space-y-6">
      {/* Team Header */}
      {members.length > 0 ? (
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">{team?.name || 'Your Team'}</h2>
              {team?.description && (
                <p className="text-blue-100">{team.description}</p>
              )}
            </div>
            {team && (
              <button
                onClick={() => setShowTeamModal(true)}
                className="px-4 py-2 bg-white/10 backdrop-blur text-white border border-white/20 rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                Edit Team
              </button>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-blue-100 text-sm mb-1">Team Members</div>
              <div className="text-2xl font-bold">{members.length}</div>
            </div>
            <div>
              <div className="text-blue-100 text-sm mb-1">Total Capacity</div>
              <div className="text-2xl font-bold">
                {Math.round(members.reduce((sum, m) => sum + (m.capacity * m.availability) / 100, 0))} pts
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">👥</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Add Team Members
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start by adding team members to collaborate on your sprints
          </p>
          <button
            onClick={() => setShowMemberModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Add First Member
          </button>
        </div>
      )}

      {members.length > 0 && (
        <>
          {/* View Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1">
              <button
                onClick={() => setView('members')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'members'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                👥 Members
              </button>
              <button
                onClick={() => setView('capacity')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'capacity'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                📊 Capacity
              </button>
            </div>

            <button
              onClick={() => setShowMemberModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Member
            </button>
          </div>

          {/* Content */}
          {view === 'members' ? (
            <div>
              {members.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.map((member) => (
                    <TeamMemberCard
                      key={member.id}
                      member={member}
                      onEdit={handleEditMember}
                      onRemove={onRemoveMember}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">👥</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Team Members Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Add your first team member to get started
                  </p>
                  <button
                    onClick={() => setShowMemberModal(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Add First Member
                  </button>
                </div>
              )}
            </div>
          ) : (
            <CapacityPlanner members={members} />
          )}
        </>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <MemberModal
          member={editingMember}
          onSave={(data) => {
            if (editingMember) {
              onUpdateMember(editingMember.id, data);
            } else {
              onAddMember(data);
            }
            handleCloseMemberModal();
          }}
          onClose={handleCloseMemberModal}
        />
      )}

      {/* Team Modal */}
      {showTeamModal && (
        <TeamModal
          team={team}
          onSave={(data) => {
            if (team) {
              onUpdateTeam(data);
            } else {
              onCreateTeam({ ...data, members: [] });
            }
            setShowTeamModal(false);
          }}
          onClose={() => setShowTeamModal(false)}
        />
      )}
    </div>
  );
}

// ============================================================================
// Member Modal Component
// ============================================================================

interface MemberModalProps {
  member: TeamMember | null;
  onSave: (data: Omit<TeamMember, 'id' | 'joinedAt'>) => void;
  onClose: () => void;
}

function MemberModal({ member, onSave, onClose }: MemberModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: TeamMember['role'];
    capacity: number;
    availability: number;
    skills: string;
    avatar: string;
  }>({
    name: member?.name || '',
    email: member?.email || '',
    role: member?.role || 'developer',
    capacity: member?.capacity || 10,
    availability: member?.availability || 100,
    skills: member?.skills?.join(', ') || '',
    avatar: member?.avatar || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      capacity: formData.capacity,
      availability: formData.availability,
      skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      avatar: formData.avatar || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {member ? 'Edit Team Member' : 'Add Team Member'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as TeamMember['role'] })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="developer">👔 Developer</option>
                  <option value="tester">🧪 Tester</option>
                  <option value="scrum-master">🎯 Scrum Master</option>
                  <option value="product-owner">💻 Product Owner</option>
                </select>
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Capacity (story points) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Availability (%) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={formData.availability}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      availability: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Avatar URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skills (comma separated)
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="React, TypeScript, Node.js"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {member ? 'Update Member' : 'Add Member'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Team Modal Component
// ============================================================================

interface TeamModalProps {
  team: Team | null;
  onSave: (data: { name: string; description: string }) => void;
  onClose: () => void;
}

function TeamModal({ team, onSave, onClose }: TeamModalProps) {
  const [formData, setFormData] = useState({
    name: team?.name || '',
    description: team?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-lg w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {team ? 'Edit Team' : 'Create Team'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Team Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Development Team Alpha"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Describe your team's purpose and goals..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {team ? 'Update Team' : 'Create Team'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
