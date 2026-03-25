/**
 * Chat API Service
 * Handles chat groups and messaging
 */

import api from './api';

/**
 * Create a new chat group
 * @param {Object} data - Group data
 * @param {string} data.name - Group name
 * @param {string} [data.description] - Group description
 * @param {string} data.groupType - Type: 'direct', 'team', 'academy', 'coach_player'
 * @param {Array<{type: string, id: string}>} data.memberIds - Member IDs with types
 * @returns {Promise<Object>}
 */
export const createGroup = async (data) => {
  try {
    const response = await api.post('/chat/groups', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create chat group:', error);
    throw error;
  }
};

/**
 * Get all chat groups for current user
 * @returns {Promise<Array>}
 */
export const getGroups = async () => {
  try {
    const response = await api.get('/chat/groups');
    return response.data;
  } catch (error) {
    console.error('Failed to get chat groups:', error);
    throw error;
  }
};

/**
 * Get a specific chat group
 * @param {string} groupId - Group UUID
 * @returns {Promise<Object>}
 */
export const getGroup = async (groupId) => {
  try {
    const response = await api.get(`/chat/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get chat group:', error);
    throw error;
  }
};

/**
 * Get messages for a chat group
 * @param {string} groupId - Group UUID
 * @param {Object} [options] - Query options
 * @param {number} [options.limit] - Limit number of messages
 * @param {string} [options.before] - Message ID to fetch messages before
 * @returns {Promise<Array>}
 */
export const getMessages = async (groupId, options = {}) => {
  try {
    const response = await api.get(`/chat/groups/${groupId}/messages`, {
      params: options,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get messages:', error);
    throw error;
  }
};

/**
 * Send a message to a chat group
 * @param {string} groupId - Group UUID
 * @param {Object} data - Message data
 * @param {string} data.content - Message content
 * @param {string} [data.messageType] - Type: 'text', 'image', 'video', 'file'
 * @param {Object} [data.metadata] - Additional metadata
 * @param {string} [data.replyToId] - Message ID being replied to
 * @returns {Promise<Object>}
 */
export const sendMessage = async (groupId, data) => {
  try {
    const response = await api.post(`/chat/groups/${groupId}/messages`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
};

/**
 * Edit a message
 * @param {string} groupId - Group UUID
 * @param {string} messageId - Message UUID
 * @param {string} content - New message content
 * @returns {Promise<Object>}
 */
export const editMessage = async (groupId, messageId, content) => {
  try {
    const response = await api.patch(`/chat/groups/${groupId}/messages/${messageId}`, {
      content,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to edit message:', error);
    throw error;
  }
};

/**
 * Delete a message
 * @param {string} groupId - Group UUID
 * @param {string} messageId - Message UUID
 * @returns {Promise<Object>}
 */
export const deleteMessage = async (groupId, messageId) => {
  try {
    const response = await api.delete(`/chat/groups/${groupId}/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete message:', error);
    throw error;
  }
};

/**
 * Mark messages in a group as read
 * @param {string} groupId - Group UUID
 * @returns {Promise<Object>}
 */
export const markAsRead = async (groupId) => {
  try {
    const response = await api.post(`/chat/groups/${groupId}/read`);
    return response.data;
  } catch (error) {
    console.error('Failed to mark as read:', error);
    throw error;
  }
};

/**
 * Leave a chat group
 * @param {string} groupId - Group UUID
 * @returns {Promise<Object>}
 */
export const leaveGroup = async (groupId) => {
  try {
    const response = await api.post(`/chat/groups/${groupId}/leave`);
    return response.data;
  } catch (error) {
    console.error('Failed to leave group:', error);
    throw error;
  }
};

/**
 * Archive a chat group
 * @param {string} groupId - Group UUID
 * @returns {Promise<Object>}
 */
export const archiveGroup = async (groupId) => {
  try {
    const response = await api.post(`/chat/groups/${groupId}/archive`);
    return response.data;
  } catch (error) {
    console.error('Failed to archive group:', error);
    throw error;
  }
};

const chatAPI = {
  createGroup,
  getGroups,
  getGroup,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markAsRead,
  leaveGroup,
  archiveGroup,
};

export default chatAPI;
