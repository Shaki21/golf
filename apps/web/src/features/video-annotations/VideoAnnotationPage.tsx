/**
 * Video Annotation Page
 * Full video annotation interface with drawing tools and timeline
 */

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Pause } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVideoAnnotations } from '../../hooks/useVideoAnnotations';
import AnnotationToolbar, { AnnotationTool } from './components/AnnotationToolbar';
import AnnotationTimeline from './components/AnnotationTimeline';
import { PageHeader } from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../ui/primitives/Button';
import { SubSectionTitle } from '../../ui/primitives/typography';

const VideoAnnotationPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();

  // Video state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Annotation state
  const {
    annotations,
    loading,
    error,
    saving,
    createAnnotation,
    deleteAnnotation,
    refresh,
  } = useVideoAnnotations(videoId || '');

  // Drawing state
  const [activeTool, setActiveTool] = useState<AnnotationTool>('pen');
  const [color, setColor] = useState('#FF0000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingData, setDrawingData] = useState<any[]>([]);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  // Initialize canvas
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const resizeCanvas = () => {
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [drawingData]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    drawingData.forEach((stroke) => {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.type === 'pen') {
        ctx.beginPath();
        stroke.points.forEach((point: { x: number; y: number }, index: number) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      } else if (stroke.type === 'rectangle') {
        const { start, end } = stroke;
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
      } else if (stroke.type === 'circle') {
        const { start, end } = stroke;
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (stroke.type === 'arrow') {
        const { start, end } = stroke;
        const headLength = 15;
        const angle = Math.atan2(end.y - start.y, end.x - start.x);

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - headLength * Math.cos(angle - Math.PI / 6),
          end.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - headLength * Math.cos(angle + Math.PI / 6),
          end.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'eraser') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);

    if (activeTool === 'pen') {
      setDrawingData([...drawingData, { type: 'pen', points: [{ x, y }], color, strokeWidth }]);
    } else {
      setDrawingData([...drawingData, { type: activeTool, start: { x, y }, end: { x, y }, color, strokeWidth }]);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDrawingData((prev) => {
      const updated = [...prev];
      const current = updated[updated.length - 1];

      if (activeTool === 'pen') {
        current.points.push({ x, y });
      } else {
        current.end = { x, y };
      }

      return updated;
    });
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing) {
      setUndoStack([...undoStack, drawingData[drawingData.length - 1]]);
      setRedoStack([]);
    }
    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;

    const last = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    setRedoStack([...redoStack, last]);
    setDrawingData(drawingData.filter((d) => d !== last));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const last = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setUndoStack([...undoStack, last]);
    setDrawingData([...drawingData, last]);
  };

  const handleClear = () => {
    if (window.confirm('Clear all drawings?')) {
      setDrawingData([]);
      setUndoStack([]);
      setRedoStack([]);
    }
  };

  const handleSave = async () => {
    if (drawingData.length === 0) {
      alert('No drawings to save');
      return;
    }

    try {
      await createAnnotation({
        type: 'drawing',
        timestamp: currentTime,
        drawingData: { strokes: drawingData },
        color,
        strokeWidth,
      });

      setDrawingData([]);
      setUndoStack([]);
      setRedoStack([]);
      refresh();
      alert('Annotation saved!');
    } catch (err) {
      console.error('Failed to save annotation:', err);
      alert('Could not save annotation');
    }
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleDeleteAnnotation = async (annotationId: string) => {
    try {
      await deleteAnnotation(annotationId);
      refresh();
    } catch (err) {
      console.error('Failed to delete annotation:', err);
      alert('Could not delete annotation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tier-surface-base p-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <LoadingSpinner />
          <p className="mt-4 text-tier-text-secondary">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-tier-surface-base p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-tier-border-default p-8 text-center">
            <div className="text-tier-error text-4xl mb-4">⚠️</div>
            <SubSectionTitle style={{ marginBottom: 0 }}>Could not load video</SubSectionTitle>
            <p className="text-tier-text-secondary mb-4">{error}</p>
            <Button variant="primary" onClick={() => navigate(-1)}>
              Go back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <PageHeader title="Video annotation" subtitle="" helpText="" actions={null} className="mb-0" />
          </div>
        </div>

        {/* Annotation toolbar */}
        <AnnotationToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          color={color}
          onColorChange={setColor}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClear}
          onSave={handleSave}
          isSaving={saving}
          className="mb-6"
        />

        {/* Video player with canvas overlay */}
        <div className="bg-white rounded-xl border border-tier-border-default p-6 mb-6">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={`/api/v1/videos/${videoId}/playback`}
              className="w-full"
              controls={false}
            />
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              className="absolute top-0 left-0 w-full h-full cursor-crosshair"
              style={{ pointerEvents: activeTool ? 'auto' : 'none' }}
            />
          </div>

          {/* Video controls */}
          <div className="mt-4 flex items-center gap-4">
            <Button
              variant="primary"
              size="sm"
              onClick={handlePlayPause}
              leftIcon={isPlaying ? <Pause size={18} /> : <Play size={18} />}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <div className="flex-1 text-sm text-tier-text-secondary">
              {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} /{' '}
              {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Annotation timeline */}
        <AnnotationTimeline
          annotations={annotations}
          videoDuration={duration}
          currentTime={currentTime}
          onSeek={handleSeek}
          onDelete={handleDeleteAnnotation}
          onSelect={(annotation) => setSelectedAnnotationId(annotation.id)}
          selectedId={selectedAnnotationId ?? undefined}
        />
      </div>
    </div>
  );
};

export default VideoAnnotationPage;
