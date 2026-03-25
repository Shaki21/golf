/**
 * ProfileImageUpload - Profile image upload component
 *
 * Allows users to upload and update their profile picture
 * Shows current image or initials as fallback
 */

import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../shadcn';
import { useToast } from '../shadcn/use-toast';
import { cn } from 'lib/utils';
import { SubSectionTitle } from '../typography/Headings';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  userName?: string;
  onImageUpload: (file: File) => Promise<void>;
  onImageRemove?: () => Promise<void>;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-40 h-40',
};

const buttonSizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-14 h-14',
};

export default function ProfileImageUpload({
  currentImageUrl,
  userName = '',
  onImageUpload,
  onImageRemove,
  className,
  size = 'lg',
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ugyldig filtype',
        description: 'Vennligst velg en bildefil',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Filen er for stor',
        description: 'Bildet må være mindre enn 5MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      await onImageUpload(file);
      toast({
        title: 'Profilbilde oppdatert',
        description: 'Ditt profilbilde har blitt lastet opp',
      });
    } catch (error) {
      console.error('Image upload failed:', error);
      toast({
        title: 'Opplasting feilet',
        description: 'Kunne ikke laste opp bildet. Vennligst prøv igjen.',
        variant: 'destructive',
      });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = async () => {
    if (onImageRemove) {
      try {
        await onImageRemove();
        setPreviewUrl(null);
        toast({
          title: 'Profilbilde fjernet',
          description: 'Ditt profilbilde har blitt fjernet',
        });
      } catch (error) {
        console.error('Failed to remove profile image:', error);
        toast({
          title: 'Fjerning feilet',
          description: 'Kunne ikke fjerne profilbildet. Vennligst prøv igjen.',
          variant: 'destructive',
        });
      }
    } else {
      setPreviewUrl(null);
    }
  };

  const displayImageUrl = previewUrl || currentImageUrl;

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Velg profilbilde"
      />

      {/* Avatar display */}
      <div className="relative">
        <Avatar className={cn(sizeClasses[size], 'border-4 border-white shadow-lg')}>
          <AvatarImage src={displayImageUrl} alt={userName} />
          <AvatarFallback className="text-2xl font-semibold bg-ak-primary text-white">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Upload button */}
      <button
        onClick={handleUploadClick}
        disabled={isUploading}
        className={cn(
          'absolute bottom-0 right-0',
          'bg-ak-primary hover:bg-ak-primary-hover',
          'text-white',
          'rounded-full',
          'border-3 border-white',
          'shadow-lg',
          'transition-all duration-200',
          'flex items-center justify-center',
          'cursor-pointer',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'hover:scale-110',
          buttonSizeClasses[size]
        )}
        aria-label="Last opp profilbilde"
        title="Last opp profilbilde"
      >
        <Camera size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} />
      </button>

      {/* Remove button (only show if image exists) */}
      {displayImageUrl && !isUploading && (
        <button
          onClick={handleRemoveImage}
          className={cn(
            'absolute top-0 right-0',
            'bg-error hover:bg-error/90',
            'text-white',
            'rounded-full',
            'border-3 border-white',
            'shadow-lg',
            'transition-all duration-200',
            'flex items-center justify-center',
            'cursor-pointer',
            'hover:scale-110',
            'w-8 h-8'
          )}
          aria-label="Fjern profilbilde"
          title="Fjern profilbilde"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/**
 * ProfileImageUploadCard - Card variant with upload area
 */
interface ProfileImageUploadCardProps {
  currentImageUrl?: string;
  userName?: string;
  onImageUpload: (file: File) => Promise<void>;
}

export function ProfileImageUploadCard({
  currentImageUrl,
  userName = '',
  onImageUpload,
}: ProfileImageUploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await onImageUpload(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onImageUpload(file);
    }
  };

  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <SubSectionTitle className="text-lg font-semibold mb-4">Profilbilde</SubSectionTitle>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Current image */}
        <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
          <AvatarImage src={currentImageUrl} alt={userName} />
          <AvatarFallback className="text-3xl font-semibold bg-ak-primary text-white">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>

        {/* Upload area */}
        <div className="flex-1 w-full">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
              isDragging
                ? 'border-ak-primary bg-ak-primary/5'
                : 'border-gray-300 hover:border-ak-primary hover:bg-gray-50'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              Klikk for å laste opp eller dra og slipp
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG eller GIF (maks 5MB)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
