/**
 * TIER Golf - Coach Session Template Editor
 * Design System v3.0 - Blue Palette 01
 *
 * Drag-and-drop editor for creating and editing training session templates.
 */

import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  GripVertical,
  Trash2,
  Clock,
  Edit3,
  Copy,
  Search,
  X,
  Check,
  Dumbbell,
} from 'lucide-react';
import Button from '../../ui/primitives/Button';
import { PageTitle, SectionTitle, SubSectionTitle, CardTitle } from '../../components/typography/Headings';
// Types
interface Exercise {
  id: string;
  name: string;
  category: 'teknikk' | 'putting' | 'kort_spill' | 'langt_spill' | 'bane' | 'mental' | 'fysisk';
  duration: number;
  description?: string;
  order: number;
}

interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetGroup?: string;
  exercises: Exercise[];
}

// Exercise library for selection
const exerciseLibrary: Omit<Exercise, 'order'>[] = [
  { id: 'lib1', name: 'Warm-up', category: 'fysisk', duration: 10, description: 'Dynamic warm-up focusing on rotation' },
  { id: 'lib2', name: 'Grip and Stance', category: 'teknikk', duration: 15, description: 'Basic positioning' },
  { id: 'lib3', name: 'Iron 7 Drill', category: 'teknikk', duration: 20, description: 'Repeated drill with iron 7' },
  { id: 'lib4', name: 'Gate Drill', category: 'putting', duration: 15, description: 'Putting through gates' },
  { id: 'lib5', name: 'Distance Control', category: 'putting', duration: 20, description: 'Focus on length and tempo' },
  { id: 'lib6', name: 'Competition Putting', category: 'putting', duration: 15, description: 'Simulated competition situation' },
  { id: 'lib7', name: 'Chipping Technique', category: 'kort_spill', duration: 20, description: 'Basic chipping' },
  { id: 'lib8', name: 'Pitching Variation', category: 'kort_spill', duration: 20, description: 'Varying distances and heights' },
  { id: 'lib9', name: 'Bunker Exit', category: 'kort_spill', duration: 15, description: 'Basic bunker technique' },
  { id: 'lib10', name: '9 Hole Simulation', category: 'bane', duration: 90, description: 'Simulated round with focus areas' },
  { id: 'lib11', name: 'Course Analysis', category: 'mental', duration: 30, description: 'Strategic planning' },
  { id: 'lib12', name: 'Driver Technique', category: 'langt_spill', duration: 25, description: 'Focus on tee shots' },
  { id: 'lib13', name: 'Fairway Wood', category: 'langt_spill', duration: 20, description: 'Technique for 3-wood and 5-wood' },
  { id: 'lib14', name: 'Core Stability', category: 'fysisk', duration: 15, description: 'Core strength for golf' },
  { id: 'lib15', name: 'Visualization', category: 'mental', duration: 15, description: 'Mental preparation' },
];

// Category config
const categoryConfig: Record<string, { bg: string; text: string; label: string }> = {
  teknikk: { bg: 'rgba(var(--accent-rgb), 0.15)', text: 'var(--accent)', label: 'Technique' },
  putting: { bg: 'rgba(var(--success-rgb), 0.15)', text: 'var(--status-success)', label: 'Putting' },
  kort_spill: { bg: 'rgba(var(--achievement-rgb), 0.15)', text: 'var(--achievement)', label: 'Short Game' },
  langt_spill: { bg: 'rgba(var(--accent-light-rgb), 0.15)', text: 'var(--accent-light)', label: 'Long Game' },
  bane: { bg: 'rgba(var(--warning-rgb), 0.15)', text: 'var(--status-warning)', label: 'Course' },
  mental: { bg: 'rgba(var(--category-j), 0.15)', text: 'rgb(var(--category-j))', label: 'Mental' },
  fysisk: { bg: 'rgba(var(--error-rgb), 0.15)', text: 'var(--status-error)', label: 'Fitness' },
};

export default function CoachSessionTemplateEditor() {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const isEditing = !!templateId;

  // Template state
  const [template, setTemplate] = useState<SessionTemplate>({
    id: templateId || `template-${Date.now()}`,
    name: '',
    description: '',
    category: 'blandet',
    difficulty: 'intermediate',
    targetGroup: '',
    exercises: [],
  });

  // UI state
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Drag & Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    // Make the drag image transparent
    const elem = e.currentTarget as HTMLElement;
    elem.style.opacity = '0.5';
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const elem = e.currentTarget as HTMLElement;
    elem.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [draggedIndex]);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newExercises = [...template.exercises];
    const [draggedExercise] = newExercises.splice(draggedIndex, 1);
    newExercises.splice(dropIndex, 0, draggedExercise);

    // Update order property
    const reorderedExercises = newExercises.map((ex, idx) => ({
      ...ex,
      order: idx + 1,
    }));

    setTemplate({ ...template, exercises: reorderedExercises });
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, template]);

  // Exercise management
  const addExercise = useCallback((libraryExercise: Omit<Exercise, 'order'>) => {
    const newExercise: Exercise = {
      ...libraryExercise,
      id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      order: template.exercises.length + 1,
    };
    setTemplate({
      ...template,
      exercises: [...template.exercises, newExercise],
    });
  }, [template]);

  const removeExercise = useCallback((exerciseId: string) => {
    const newExercises = template.exercises
      .filter((ex) => ex.id !== exerciseId)
      .map((ex, idx) => ({ ...ex, order: idx + 1 }));
    setTemplate({ ...template, exercises: newExercises });
  }, [template]);

  const duplicateExercise = useCallback((exercise: Exercise) => {
    const duplicate: Exercise = {
      ...exercise,
      id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      order: template.exercises.length + 1,
    };
    setTemplate({
      ...template,
      exercises: [...template.exercises, duplicate],
    });
  }, [template]);

  const updateExercise = useCallback((exerciseId: string, updates: Partial<Exercise>) => {
    setTemplate({
      ...template,
      exercises: template.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, ...updates } : ex
      ),
    });
  }, [template]);

  // Calculate total duration
  const totalDuration = template.exercises.reduce((sum, ex) => sum + ex.duration, 0);

  // Filter exercise library
  const filteredLibrary = exerciseLibrary.filter((ex) => {
    if (!exerciseSearch) return true;
    const query = exerciseSearch.toLowerCase();
    return (
      ex.name.toLowerCase().includes(query) ||
      ex.category.toLowerCase().includes(query) ||
      categoryConfig[ex.category]?.label.toLowerCase().includes(query)
    );
  });

  // Save template
  const handleSave = async () => {
    if (!template.name.trim()) {
      alert('Please give the template a name');
      return;
    }
    if (template.exercises.length === 0) {
      alert('Add at least one exercise');
      return;
    }

    setIsSaving(true);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate('/coach/exercises/templates');
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-secondary)',
        fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-default)',
          padding: '16px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/coach/exercises/templates')}
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={20} color={'var(--text-primary)'} />
            </button>
            <div>
              <PageTitle style={{ fontSize: '24px', lineHeight: '32px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {isEditing ? 'Edit Template' : 'New Training Template'}
              </PageTitle>
              <p style={{ fontSize: '12px', lineHeight: '16px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Drag and drop to reorder exercises
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="secondary"
              onClick={() => navigate('/coach/exercises/templates')}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
              loading={isSaving}
              leftIcon={<Save size={18} />}
            >
              {isSaving ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', padding: '24px' }}>
        {/* Main content - Exercise list */}
        <div style={{ flex: 1 }}>
          {/* Template info card */}
          <div
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    marginBottom: '6px',
                  }}
                >
                  Template Name *
                </label>
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                  placeholder="F.eks. Putting Mastery"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    marginBottom: '6px',
                  }}
                >
                  Target Group
                </label>
                <input
                  type="text"
                  value={template.targetGroup}
                  onChange={(e) => setTemplate({ ...template, targetGroup: e.target.value })}
                  placeholder="e.g. WANG Elite Sports, Category A"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                Description
              </label>
              <textarea
                value={template.description}
                onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                placeholder="Short description of the template..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    marginBottom: '6px',
                  }}
                >
                  Difficulty
                </label>
                <select
                  value={template.difficulty}
                  onChange={(e) =>
                    setTemplate({ ...template, difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' })
                  }
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-primary)',
                  }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Exercise list header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <SectionTitle style={{ fontSize: '17px', lineHeight: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Exercises ({template.exercises.length})
              </SectionTitle>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  backgroundColor: 'rgba(var(--accent-rgb), 0.10)',
                  borderRadius: '9999px',
                }}
              >
                <Clock size={14} color={'var(--accent)'} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>
                  {totalDuration} min
                </span>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowExerciseLibrary(true)}
              leftIcon={<Plus size={16} />}
            >
              Add Exercise
            </Button>
          </div>

          {/* Drag and drop exercise list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {template.exercises.length === 0 ? (
              <div
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '48px 24px',
                  textAlign: 'center',
                  border: '2px dashed var(--border-default)',
                }}
              >
                <Dumbbell size={48} color={'var(--border-default)'} style={{ marginBottom: '16px' }} />
                <SubSectionTitle style={{ fontSize: '17px', lineHeight: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  No exercises added
                </SubSectionTitle>
                <p
                  style={{
                    fontSize: '15px', lineHeight: '20px',
                    color: 'var(--text-secondary)',
                    margin: '8px 0 20px',
                  }}
                >
                  Click "Add Exercise" to get started
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowExerciseLibrary(true)}
                  leftIcon={<Plus size={18} />}
                >
                  Add First Exercise
                </Button>
              </div>
            ) : (
              template.exercises.map((exercise, index) => {
                const catConfig = categoryConfig[exercise.category] || {
                  bg: 'var(--bg-tertiary)',
                  text: 'var(--text-secondary)',
                  label: exercise.category,
                };
                const isEditing = editingExercise === exercise.id;
                const isDragging = draggedIndex === index;
                const isDragOver = dragOverIndex === index;

                return (
                  <div
                    key={exercise.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: isDragging ? 'var(--shadow-elevated)' : 'var(--shadow-card)',
                      overflow: 'hidden',
                      opacity: isDragging ? 0.5 : 1,
                      transform: isDragOver ? 'scale(1.02)' : 'none',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      borderTop: isDragOver ? '3px solid var(--accent)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                      }}
                    >
                      {/* Drag handle */}
                      <div
                        style={{
                          cursor: 'grab',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <GripVertical size={20} color={'var(--border-default)'} />
                      </div>

                      {/* Order number */}
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent)',
                          color: 'var(--bg-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={exercise.name}
                              onChange={(e) =>
                                updateExercise(exercise.id, { name: e.target.value })
                              }
                              style={{
                                flex: 1,
                                padding: '6px 10px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-default)',
                                fontSize: '14px',
                              }}
                            />
                            <input
                              type="number"
                              value={exercise.duration}
                              onChange={(e) =>
                                updateExercise(exercise.id, {
                                  duration: parseInt(e.target.value) || 0,
                                })
                              }
                              style={{
                                width: 60,
                                padding: '6px 10px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-default)',
                                fontSize: '14px',
                              }}
                            />
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>min</span>
                            <button
                              onClick={() => setEditingExercise(null)}
                              style={{
                                padding: '6px',
                                backgroundColor: 'var(--status-success)',
                                color: 'var(--bg-primary)',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                              }}
                            >
                              <Check size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span
                                style={{
                                  fontSize: '15px', lineHeight: '20px',
                                  fontWeight: 500,
                                  color: 'var(--text-primary)',
                                }}
                              >
                                {exercise.name}
                              </span>
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  padding: '2px 6px',
                                  backgroundColor: catConfig.bg,
                                  color: catConfig.text,
                                  borderRadius: '4px',
                                }}
                              >
                                {catConfig.label}
                              </span>
                            </div>
                            {exercise.description && (
                              <p
                                style={{
                                  fontSize: '12px', lineHeight: '16px',
                                  color: 'var(--text-secondary)',
                                  margin: '2px 0 0',
                                }}
                              >
                                {exercise.description}
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      {/* Duration */}
                      {!isEditing && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          <Clock size={14} color={'var(--text-secondary)'} />
                          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                            {exercise.duration} min
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      {!isEditing && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => setEditingExercise(exercise.id)}
                            title="Edit"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--bg-tertiary)',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <Edit3 size={14} color={'var(--text-primary)'} />
                          </button>
                          <button
                            onClick={() => duplicateExercise(exercise)}
                            title="Duplicate"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--bg-tertiary)',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <Copy size={14} color={'var(--text-primary)'} />
                          </button>
                          <button
                            onClick={() => removeExercise(exercise.id)}
                            title="Delete"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'rgba(var(--error-rgb), 0.10)',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={14} color={'var(--status-error)'} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar - Preview */}
        <div style={{ width: 300, flexShrink: 0 }}>
          <div
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              boxShadow: 'var(--shadow-card)',
              position: 'sticky',
              top: 100,
            }}
          >
            <SubSectionTitle
              style={{
                fontSize: '17px', lineHeight: '22px', fontWeight: 600,
                color: 'var(--text-primary)',
                margin: '0 0 16px',
              }}
            >
              Preview
            </SubSectionTitle>

            <div
              style={{
                padding: '16px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <CardTitle
                style={{
                  fontSize: '15px', lineHeight: '20px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                {template.name || 'Untitled'}
              </CardTitle>
              {template.description && (
                <p
                  style={{
                    fontSize: '12px', lineHeight: '16px',
                    color: 'var(--text-secondary)',
                    margin: '4px 0 0',
                  }}
                >
                  {template.description}
                </p>
              )}

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-default)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} color={'var(--text-secondary)'} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {totalDuration} min
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Dumbbell size={14} color={'var(--text-secondary)'} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {template.exercises.length} exercises
                  </span>
                </div>
              </div>
            </div>

            {template.exercises.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <CardTitle
                  style={{
                    fontSize: '13px', lineHeight: '18px',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    margin: '0 0 8px',
                  }}
                >
                  Exercise Order
                </CardTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {template.exercises.map((ex, idx) => (
                    <div
                      key={ex.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent)',
                          color: 'var(--bg-primary)',
                          fontSize: '10px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-primary)',
                          flex: 1,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {ex.name}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {ex.duration}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exercise library modal */}
      {showExerciseLibrary && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 100,
            }}
            onClick={() => setShowExerciseLibrary(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-lg)',
              width: 600,
              maxWidth: '90vw',
              maxHeight: '80vh',
              overflow: 'hidden',
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal header */}
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <SectionTitle style={{ fontSize: '20px', lineHeight: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Select Exercise
              </SectionTitle>
              <button
                onClick={() => setShowExerciseLibrary(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} color={'var(--text-primary)'} />
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <Search size={18} color={'var(--text-secondary)'} />
                <input
                  type="text"
                  placeholder="Search for exercise..."
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Exercise list */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredLibrary.map((exercise) => {
                  const catConfig = categoryConfig[exercise.category] || {
                    bg: 'var(--bg-tertiary)',
                    text: 'var(--text-secondary)',
                    label: exercise.category,
                  };

                  return (
                    <div
                      key={exercise.id}
                      onClick={() => {
                        addExercise(exercise);
                        setShowExerciseLibrary(false);
                        setExerciseSearch('');
                      }}
                      className="hover:bg-[var(--bg-tertiary)]"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: catConfig.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Dumbbell size={20} color={catConfig.text} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '15px', lineHeight: '20px',
                              fontWeight: 500,
                              color: 'var(--text-primary)',
                            }}
                          >
                            {exercise.name}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              padding: '2px 6px',
                              backgroundColor: catConfig.bg,
                              color: catConfig.text,
                              borderRadius: '4px',
                            }}
                          >
                            {catConfig.label}
                          </span>
                        </div>
                        {exercise.description && (
                          <p
                            style={{
                              fontSize: '12px', lineHeight: '16px',
                              color: 'var(--text-secondary)',
                              margin: '2px 0 0',
                            }}
                          >
                            {exercise.description}
                          </p>
                        )}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          backgroundColor: 'var(--bg-primary)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <Clock size={12} color={'var(--text-secondary)'} />
                        <span style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
                          {exercise.duration} min
                        </span>
                      </div>
                      <Plus size={18} color={'var(--accent)'} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
