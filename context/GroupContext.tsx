import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import groupService, { Group, GroupMember } from '../services/group.service';
import { useAuth } from './AuthContext';

interface GroupContextType {
  group: Group | null;
  members: GroupMember[];
  isLoading: boolean;
  hasGroup: boolean;
  isOwner: boolean;
  createGroup: (name: string) => Promise<void>;
  addMember: (email: string) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  refreshGroup: () => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

interface GroupProviderProps {
  children: ReactNode;
}

export function GroupProvider({ children }: GroupProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load group data khi user đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      loadGroupData();
    } else {
      setGroup(null);
      setMembers([]);
    }
  }, [isAuthenticated]);

  const loadGroupData = async () => {
    try {
      setIsLoading(true);
      const response = await groupService.getMyGroupMembers();

      if (response && response.members && response.members.length > 0) {
        setMembers(response.members);
        setGroup(response.group);
      }
    } catch (error: any) {
      // User chưa có group
      if (error.response?.data?.message === 'USER_NOT_IN_GROUP') {
        setGroup(null);
        setMembers([]);
      } else {
        console.error('Error loading group:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createGroup = async (name: string) => {
    try {
      const newGroup = await groupService.createGroup(name);
      setGroup(newGroup);
      await loadGroupData(); // Reload to get members
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể tạo nhóm');
    }
  };

  const addMember = async (email: string) => {
    try {
      await groupService.addMember(email);
      await loadGroupData(); // Reload members
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể thêm thành viên');
    }
  };

  const removeMember = async (userId: string) => {
    try {
      await groupService.removeMember(userId);
      await loadGroupData(); // Reload members
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể xóa thành viên');
    }
  };

  const refreshGroup = async () => {
    await loadGroupData();
  };

  const isOwner = user ? members.some(m => m.userId === user._id && m.role === 'owner') : false;

  const value: GroupContextType = {
    group,
    members,
    isLoading,
    hasGroup: !!group,
    isOwner,
    createGroup,
    addMember,
    removeMember,
    refreshGroup,
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
}

export function useGroup(): GroupContextType {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
}
