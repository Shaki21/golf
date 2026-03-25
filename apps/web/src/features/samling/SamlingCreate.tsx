/**
 * TIER Golf - Samling Create
 * Form for creating a new samling
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Save,
  Hotel,
  Car,
  Flag,
} from 'lucide-react';
import api from '../../services/api';
import { PageTitle, SectionTitle } from '../../components/typography';

interface GolfCourse {
  id: string;
  name: string;
}

interface CreateSamlingForm {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  golfCourseId: string;
  address: string;
  accommodation: string;
  meetingPoint: string;
  transportInfo: string;
  maxParticipants: string;
  notes: string;
}

const SamlingCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [golfCourses, setGolfCourses] = useState<GolfCourse[]>([]);

  const [form, setForm] = useState<CreateSamlingForm>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    venue: '',
    golfCourseId: '',
    address: '',
    accommodation: '',
    meetingPoint: '',
    transportInfo: '',
    maxParticipants: '',
    notes: '',
  });

  useEffect(() => {
    fetchGolfCourses();
  }, []);

  const fetchGolfCourses = async () => {
    try {
      const response = await api.get<{ success: boolean; data: GolfCourse[] }>('/golf-courses');
      if (response.data.success) {
        setGolfCourses(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching golf courses:', error);
    }
  };

  const handleInputChange = (field: keyof CreateSamlingForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!form.startDate) {
      setError('Start date is required');
      return;
    }
    if (!form.endDate) {
      setError('End date is required');
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        description: form.description || undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        venue: form.venue || undefined,
        golfCourseId: form.golfCourseId || undefined,
        address: form.address || undefined,
        accommodation: form.accommodation || undefined,
        meetingPoint: form.meetingPoint || undefined,
        transportInfo: form.transportInfo || undefined,
        maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : undefined,
        notes: form.notes || undefined,
      };

      const response = await api.post<{ success: boolean; data: { id: string } }>('/samling', payload);

      if (response.data.success) {
        navigate(`/coach/samlinger/${response.data.data.id}`);
      }
    } catch (error: unknown) {
      console.error('Error creating samling:', error);
      const apiError = error as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || 'Could not create training camp');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--border-secondary)',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    marginBottom: '6px',
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/coach/samlinger')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '16px',
          }}
        >
          <ArrowLeft size={18} />
          Back to training camps
        </button>

        <PageTitle style={{ marginBottom: 0 }}>
          Create new training camp
        </PageTitle>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          marginTop: '4px'
        }}>
          Fill in information about the training camp
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(var(--error-rgb), 0.1)',
          border: '1px solid var(--status-error)',
          borderRadius: '8px',
          color: 'var(--status-error)',
          fontSize: '14px',
          marginBottom: '24px',
        }}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Basic Info Section */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <SectionTitle style={{
            margin: '0 0 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Calendar size={18} />
            Basic information
          </SectionTitle>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                Training camp name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="E.g. Winter camp 2026"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what the training camp is about..."
                rows={3}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>
                  Start date *
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  End date *
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>
                Maximum participants
              </label>
              <input
                type="number"
                value={form.maxParticipants}
                onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                placeholder="Leave empty for unlimited"
                min="1"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <SectionTitle style={{
            margin: '0 0 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <MapPin size={18} />
            Location
          </SectionTitle>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                Venue
              </label>
              <input
                type="text"
                value={form.venue}
                onChange={(e) => handleInputChange('venue', e.target.value)}
                placeholder="E.g. Bjaavann Golf Club"
                style={inputStyle}
              />
            </div>

            {golfCourses.length > 0 && (
              <div>
                <label style={labelStyle}>
                  Golf course
                </label>
                <select
                  value={form.golfCourseId}
                  onChange={(e) => handleInputChange('golfCourseId', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select golf course (optional)</option>
                  {golfCourses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label style={labelStyle}>
                Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Full address"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flag size={14} />
                  Meeting point
                </span>
              </label>
              <input
                type="text"
                value={form.meetingPoint}
                onChange={(e) => handleInputChange('meetingPoint', e.target.value)}
                placeholder="Where should participants meet?"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Logistics Section */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <SectionTitle style={{
            margin: '0 0 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Hotel size={18} />
            Practical information
          </SectionTitle>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Hotel size={14} />
                  Accommodation
                </span>
              </label>
              <textarea
                value={form.accommodation}
                onChange={(e) => handleInputChange('accommodation', e.target.value)}
                placeholder="Information about accommodation..."
                rows={2}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                }}
              />
            </div>

            <div>
              <label style={labelStyle}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Car size={14} />
                  Transport
                </span>
              </label>
              <textarea
                value={form.transportInfo}
                onChange={(e) => handleInputChange('transportInfo', e.target.value)}
                placeholder="Information about transport..."
                rows={2}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                }}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Other notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any other notes about the training camp..."
                rows={3}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
        }}>
          <button
            type="button"
            onClick={() => navigate('/coach/samlinger')}
            style={{
              padding: '12px 20px',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Save size={18} />
            {loading ? 'Creating...' : 'Create training camp'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SamlingCreate;
