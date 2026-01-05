import api from '../lib/api';

export interface Group {
  _id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GroupMember {
  _id: string;
  groupId: string;
  userId: string;
  role: 'owner' | 'member';
  joinedAt: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface GroupMembersResponse {
  group: Group;
  members: GroupMember[];
}

export interface CreateGroupRequest {
  name: string;
}

export interface AddMemberRequest {
  email: string;
}

export interface RemoveMemberRequest {
  userId: string;
}

class GroupService {
  /**
   * Tạo nhóm mới
   */
  async createGroup(name: string): Promise<Group> {
    const response = await api.post<Group>('/user/group', { name });
    return response.data;
  }

  /**
   * Helper normalize
   */
  private normalizeMember(member: any): GroupMember {
    if (!member) return member;
    return {
      ...member,
      _id: member._id ? member._id.toString() : member._id,
      userId: member.userId && typeof member.userId === 'object' && member.userId._id
        ? member.userId._id.toString() // Handle populated user object if needed, though interface says string
        : (member.userId ? member.userId.toString() : member.userId)
    };
  }

  /**
   * Lấy danh sách thành viên trong nhóm
   */
  async getMyGroupMembers(): Promise<GroupMembersResponse> {
    const response = await api.get<GroupMembersResponse>('/user/group');
    const data = response.data;
    if (data && Array.isArray(data.members)) {
      return {
        ...data,
        members: data.members.map(m => this.normalizeMember(m))
      };
    }
    return data;
  }

  /**
   * Thêm thành viên vào nhóm
   */
  async addMember(email: string): Promise<GroupMember> {
    const response = await api.post<GroupMember>('/user/group/add', { email });
    return response.data;
  }

  /**
   * Xóa thành viên khỏi nhóm
   */
  async removeMember(userId: string): Promise<void> {
    await api.delete('/user/group', { data: { userId } });
  }

  /**
   * Rời khỏi nhóm (tự xóa mình)
   */
  async leaveGroup(): Promise<void> {
    // User tự xóa chính mình khỏi nhóm
    // Backend cần implement endpoint riêng hoặc dùng DELETE với userId của chính mình
    await api.post('/user/group/leave');
  }
}

export default new GroupService();
