'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OwnerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  // Fetch profile data when page loads
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/owner/profile');
      const result = await response.json();
      
      console.log('API Response:', result); // Debug: See what we get
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch profile');
      }
      
      // The profile data is inside result.data
      setProfile(result.data);
      
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);
      
      // If unauthorized (401), redirect to login
      if (err.message.includes('authenticated') || err.message.includes('login')) {
        setTimeout(() => router.push('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #0f0a06;
            gap: 1rem;
          }
          .spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(210, 140, 60, 0.2);
            border-top-color: #d28c3c;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          p {
            color: rgba(245, 239, 230, 0.6);
            font-family: 'Mulish', sans-serif;
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={fetchProfile} className="retry-btn">
            Try Again
          </button>
        </div>
        <style jsx>{`
          .error-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #0f0a06;
          }
          .error-card {
            text-align: center;
            background: rgba(220, 80, 60, 0.1);
            border: 1px solid rgba(220, 80, 60, 0.3);
            border-radius: 16px;
            padding: 2rem;
            max-width: 400px;
          }
          .error-icon {
            font-size: 3rem;
          }
          h2 {
            color: #f5efe6;
            margin: 1rem 0 0.5rem;
            font-family: 'Syne', sans-serif;
          }
          p {
            color: rgba(245, 239, 230, 0.6);
            margin-bottom: 1.5rem;
          }
          .retry-btn {
            background: #d28c3c;
            color: #0f0a06;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
          }
        `}</style>
      </div>
    );
  }

  // Success - Show Profile
  return (
    <div className="dashboard">
      {/* Simple Header */}
      <header className="header">
        <div className="logo">
          <h1>MAIDAN</h1>
          <span>Owner Portal</span>
        </div>
        <button onClick={() => router.push('/')} className="back-btn">
          ← Back to Site
        </button>
      </header>

      {/* Main Content - Profile Section */}
      <main className="main">
        <div className="profile-section">
          <h2 className="section-title">Owner Profile</h2>
          <ProfileCard profile={profile} onRefresh={fetchProfile} />
        </div>
      </main>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: #0f0a06;
        }

        /* Header */
        .header {
          background: rgba(8, 5, 3, 0.95);
          border-bottom: 1px solid rgba(210, 140, 60, 0.2);
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .logo h1 {
          font-family: 'Syne', sans-serif;
          color: #d28c3c;
          font-size: 1.5rem;
          margin: 0;
        }

        .logo span {
          font-family: 'Mulish', sans-serif;
          font-size: 0.7rem;
          color: rgba(245, 239, 230, 0.5);
        }

        .back-btn {
          padding: 0.5rem 1rem;
          background: rgba(245, 239, 230, 0.05);
          border: 1px solid rgba(245, 239, 230, 0.1);
          border-radius: 6px;
          color: rgba(245, 239, 230, 0.7);
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: rgba(210, 140, 60, 0.1);
          border-color: rgba(210, 140, 60, 0.3);
          color: #d28c3c;
        }

        /* Main Content */
        .main {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
        }

        .section-title {
          font-family: 'Syne', sans-serif;
          color: #f5efe6;
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .header {
            padding: 1rem;
          }
          .main {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================
// PROFILE CARD COMPONENT
// ============================================
function ProfileCard({ profile, onRefresh }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    FullName: '',
    PhoneNumber: '',
    Email: ''
  });
  const [updateStatus, setUpdateStatus] = useState(null);

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        FullName: profile.FullName || '',
        PhoneNumber: profile.PhoneNumber || '',
        Email: profile.Email || ''
      });
    }
  }, [profile]);

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'OW';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Handle update profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateStatus('saving');
    
    try {
      const response = await fetch('/api/owner/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Update failed');
      }
      
      setUpdateStatus('success');
      setIsEditing(false);
      onRefresh(); // Refresh the profile data
      
      setTimeout(() => setUpdateStatus(null), 3000);
    } catch (error) {
      console.error('Update error:', error);
      setUpdateStatus('error');
      setTimeout(() => setUpdateStatus(null), 3000);
    }
  };

  if (!profile) return null;

  return (
    <div className="profile-card">
      {/* Avatar Section */}
      <div className="profile-avatar-section">
        <div className="avatar-large">
          {profile.ProfileImage ? (
            <img src={profile.ProfileImage} alt={profile.FullName} />
          ) : (
            <span>{getInitials(profile.FullName)}</span>
          )}
        </div>
        <div className="avatar-info">
          <h3>{profile.FullName}</h3>
          <p className="role-badge">Venue Owner</p>
          <p className="member-since">Member since {formatDate(profile.RegistrationDate)}</p>
        </div>
        {!isEditing && (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {/* Profile Details */}
      {isEditing ? (
        <form onSubmit={handleUpdate} className="profile-form">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={formData.FullName}
              onChange={(e) => setFormData({ ...formData, FullName: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              value={formData.Email}
              onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={formData.PhoneNumber || ''}
              onChange={(e) => setFormData({ ...formData, PhoneNumber: e.target.value })}
              placeholder="Enter your phone number"
            />
          </div>
          
          <div className="form-group">
            <label>CNIC (National ID)</label>
            <input
              type="text"
              value={profile.CNIC || ''}
              disabled
              className="disabled-field"
            />
            <small>CNIC cannot be changed</small>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={updateStatus === 'saving'}>
              {updateStatus === 'saving' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          
          {updateStatus === 'success' && (
            <div className="success-message">✅ Profile updated successfully!</div>
          )}
          {updateStatus === 'error' && (
            <div className="error-message">❌ Failed to update profile. Please try again.</div>
          )}
        </form>
      ) : (
        <div className="profile-details">
          <div className="details-grid">
            <div className="detail-item">
              <label>Full Name</label>
              <p>{profile.FullName}</p>
            </div>
            <div className="detail-item">
              <label>Email Address</label>
              <p>{profile.Email}</p>
            </div>
            <div className="detail-item">
              <label>Phone Number</label>
              <p>{profile.PhoneNumber || <span className="na">Not provided</span>}</p>
            </div>
            <div className="detail-item">
              <label>CNIC (National ID)</label>
              <p>{profile.CNIC || <span className="na">Not provided</span>}</p>
            </div>
            <div className="detail-item">
              <label>Account Type</label>
              <p><span className="role-tag">Owner</span></p>
            </div>
            <div className="detail-item">
              <label>Registered Since</label>
              <p>{formatDate(profile.RegistrationDate)}</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .profile-card {
          background: rgba(245, 239, 230, 0.02);
          border: 1px solid rgba(245, 239, 230, 0.08);
          border-radius: 16px;
          overflow: hidden;
        }

        /* Avatar Section */
        .profile-avatar-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          background: rgba(210, 140, 60, 0.05);
          border-bottom: 1px solid rgba(245, 239, 230, 0.08);
          flex-wrap: wrap;
        }

        .avatar-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #d28c3c, #b8732a);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          color: #0f0a06;
        }

        .avatar-large img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-info h3 {
          color: #f5efe6;
          font-family: 'Syne', sans-serif;
          margin: 0 0 0.5rem;
          font-size: 1.25rem;
        }

        .role-badge {
          display: inline-block;
          background: rgba(210, 140, 60, 0.15);
          color: #d28c3c;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-size: 0.7rem;
          margin-bottom: 0.5rem;
        }

        .member-since {
          color: rgba(245, 239, 230, 0.4);
          font-size: 0.7rem;
          margin: 0;
        }

        .edit-btn {
          margin-left: auto;
          padding: 0.6rem 1.2rem;
          background: rgba(210, 140, 60, 0.1);
          border: 1px solid rgba(210, 140, 60, 0.3);
          border-radius: 8px;
          color: #d28c3c;
          cursor: pointer;
          transition: all 0.2s;
        }

        .edit-btn:hover {
          background: rgba(210, 140, 60, 0.2);
          border-color: #d28c3c;
        }

        /* Profile Details */
        .profile-details {
          padding: 2rem;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .detail-item label {
          display: block;
          color: rgba(245, 239, 230, 0.5);
          font-size: 0.7rem;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .detail-item p {
          color: #f5efe6;
          margin: 0;
          font-size: 0.95rem;
        }

        .na {
          color: rgba(245, 239, 230, 0.3);
          font-style: italic;
        }

        .role-tag {
          display: inline-block;
          background: rgba(210, 140, 60, 0.15);
          color: #d28c3c;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-size: 0.7rem;
        }

        /* Edit Form */
        .profile-form {
          padding: 2rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          color: rgba(245, 239, 230, 0.7);
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(245, 239, 230, 0.03);
          border: 1px solid rgba(245, 239, 230, 0.1);
          border-radius: 8px;
          color: #f5efe6;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #d28c3c;
          background: rgba(210, 140, 60, 0.05);
        }

        .form-group input.disabled-field {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-group small {
          display: block;
          color: rgba(245, 239, 230, 0.3);
          font-size: 0.7rem;
          margin-top: 0.25rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .cancel-btn {
          padding: 0.6rem 1.2rem;
          background: rgba(245, 239, 230, 0.05);
          border: 1px solid rgba(245, 239, 230, 0.1);
          border-radius: 8px;
          color: rgba(245, 239, 230, 0.7);
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-btn:hover {
          background: rgba(245, 239, 230, 0.1);
        }

        .save-btn {
          padding: 0.6rem 1.2rem;
          background: #d28c3c;
          border: none;
          border-radius: 8px;
          color: #0f0a06;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .save-btn:hover:not(:disabled) {
          background: #e8a055;
          transform: translateY(-1px);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .success-message {
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(76, 175, 80, 0.1);
          border: 1px solid rgba(76, 175, 80, 0.3);
          border-radius: 8px;
          color: #4caf50;
          text-align: center;
        }

        .error-message {
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(244, 67, 54, 0.1);
          border: 1px solid rgba(244, 67, 54, 0.3);
          border-radius: 8px;
          color: #f44336;
          text-align: center;
        }

        @media (max-width: 640px) {
          .profile-avatar-section {
            flex-direction: column;
            text-align: center;
          }
          .edit-btn {
            margin-left: 0;
            width: 100%;
          }
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}