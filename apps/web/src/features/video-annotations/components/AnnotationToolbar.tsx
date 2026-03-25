/**
 * Annotation Toolbar Component
 * Provides drawing tools for video annotations
 */

import React from 'react';
import {
  Pencil,
  Square,
  Circle,
  ArrowRight,
  Type,
  Eraser,
  Trash2,
  Undo,
  Redo,
  Save
} from 'lucide-react';

export type AnnotationTool =
  | 'pen'
  | 'rectangle'
  | 'circle'
  | 'arrow'
  | 'text'
  | 'eraser';

export interface AnnotationToolbarProps {
  activeTool: AnnotationTool;
  onToolChange: (tool: AnnotationTool) => void;
  color: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
  isSaving?: boolean;
  className?: string;
}

const TOOLS = [
  { id: 'pen' as AnnotationTool, icon: Pencil, label: 'Draw' },
  { id: 'rectangle' as AnnotationTool, icon: Square, label: 'Rectangle' },
  { id: 'circle' as AnnotationTool, icon: Circle, label: 'Circle' },
  { id: 'arrow' as AnnotationTool, icon: ArrowRight, label: 'Arrow' },
  { id: 'text' as AnnotationTool, icon: Type, label: 'Text' },
  { id: 'eraser' as AnnotationTool, icon: Eraser, label: 'Eraser' },
];

const COLORS = [
  { value: '#FF0000', label: 'Red' },
  { value: '#00FF00', label: 'Green' },
  { value: '#0000FF', label: 'Blue' },
  { value: '#FFFF00', label: 'Yellow' },
  { value: '#FF00FF', label: 'Magenta' },
  { value: '#00FFFF', label: 'Cyan' },
  { value: '#FFFFFF', label: 'White' },
  { value: '#000000', label: 'Black' },
];

const STROKE_WIDTHS = [1, 2, 3, 4, 6, 8, 12];

const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({
  activeTool,
  onToolChange,
  color,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onSave,
  isSaving = false,
  className = '',
}) => {
  return (
    <div className={`bg-white border border-tier-border-default rounded-lg p-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-4">
        {/* Drawing tools */}
        <div className="flex items-center gap-1 pr-4 border-r border-tier-border-default">
          <span className="text-xs font-medium text-tier-text-secondary mr-2">Tools:</span>
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              title={tool.label}
              className={`p-2 rounded transition-colors ${
                activeTool === tool.id
                  ? 'bg-tier-info text-white'
                  : 'hover:bg-tier-surface-secondary text-tier-navy'
              }`}
            >
              <tool.icon size={18} />
            </button>
          ))}
        </div>

        {/* Color picker */}
        <div className="flex items-center gap-2 pr-4 border-r border-tier-border-default">
          <span className="text-xs font-medium text-tier-text-secondary">Color:</span>
          <div className="flex items-center gap-1">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => onColorChange(c.value)}
                title={c.label}
                className={`w-6 h-6 rounded border-2 transition-all ${
                  color === c.value
                    ? 'border-tier-navy scale-110'
                    : 'border-tier-border-default hover:scale-105'
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>

        {/* Stroke width */}
        <div className="flex items-center gap-2 pr-4 border-r border-tier-border-default">
          <span className="text-xs font-medium text-tier-text-secondary">Thickness:</span>
          <div className="flex items-center gap-1">
            {STROKE_WIDTHS.map((width) => (
              <button
                key={width}
                onClick={() => onStrokeWidthChange(width)}
                title={`${width}px`}
                className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                  strokeWidth === width
                    ? 'bg-tier-info text-white'
                    : 'hover:bg-tier-surface-secondary text-tier-navy'
                }`}
              >
                <div
                  className="rounded-full bg-current"
                  style={{ width: `${width * 1.5}px`, height: `${width * 1.5}px` }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
            className={`p-2 rounded transition-colors ${
              canUndo
                ? 'hover:bg-tier-surface-secondary text-tier-navy'
                : 'text-tier-text-tertiary cursor-not-allowed'
            }`}
          >
            <Undo size={18} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
            className={`p-2 rounded transition-colors ${
              canRedo
                ? 'hover:bg-tier-surface-secondary text-tier-navy'
                : 'text-tier-text-tertiary cursor-not-allowed'
            }`}
          >
            <Redo size={18} />
          </button>
          <button
            onClick={onClear}
            title="Clear all"
            className="p-2 rounded hover:bg-tier-error-light text-tier-error transition-colors"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            title="Save annotation"
            className="ml-2 px-4 py-2 bg-tier-success text-white rounded hover:bg-tier-success-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnotationToolbar;
