import api from './api';

export const userService = {
  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        message: error.response?.data?.message || 
                 (error.code === 'ERR_NETWORK' ? 'Network error: Server may be offline' : 'Failed to update profile')
      };
    }
  },

  // Upload profile image
  uploadProfileImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await api.post('/users/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Extract data correctly from the response
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        message: error.response?.data?.message || 
                 (error.code === 'ERR_NETWORK' ? 'Network error: Server may be offline' : 'Failed to upload image')
      };
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/users/change-password', passwordData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        message: error.response?.data?.message || 
                 (error.code === 'ERR_NETWORK' ? 'Network error: Server may be offline' : 'Failed to change password')
      };
    }
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/users/preferences', preferences);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating preferences:', error);
      return {
        success: false,
        message: error.response?.data?.message || 
                 (error.code === 'ERR_NETWORK' ? 'Network error: Server may be offline' : 'Failed to update preferences')
      };
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        success: false,
        message: error.response?.data?.message || 
                 (error.code === 'ERR_NETWORK' ? 'Network error: Server may be offline' : 'Failed to get profile')
      };
    }
  },

  // Get all users (Admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error('Error getting users:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get users',
      };
    }
  },

  // Update user role (Admin only)
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.put(`/users/${userId}/role`, { role });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error('Error updating user role:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user role',
      };
    }
  },

  // Delete user (Admin only)
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete user',
      };
    }
  }
};
