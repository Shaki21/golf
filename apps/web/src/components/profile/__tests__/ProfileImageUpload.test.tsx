import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileImageUpload from '../ProfileImageUpload';

// Mock useToast
const mockToast = jest.fn();
jest.mock('../../shadcn/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('ProfileImageUpload', () => {
  const defaultProps = {
    userName: 'Test User',
    onImageUpload: jest.fn(),
    size: 'lg' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders avatar with initials when no image provided', () => {
      render(<ProfileImageUpload {...defaultProps} />);

      // Should show initials "TU" for "Test User"
      expect(screen.getByText('TU')).toBeInTheDocument();
    });

    it('renders avatar with image when currentImageUrl provided', () => {
      render(
        <ProfileImageUpload
          {...defaultProps}
          currentImageUrl="https://example.com/avatar.jpg"
        />
      );

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('applies correct size class', () => {
      const { container } = render(
        <ProfileImageUpload {...defaultProps} size="xl" />
      );

      const avatar = container.querySelector('.w-40');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('File Selection and Validation', () => {
    it('shows toast error when invalid file type selected', async () => {
      render(<ProfileImageUpload {...defaultProps} />);

      const input = screen.getByLabelText('Velg profilbilde') as HTMLInputElement;
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Ugyldig filtype',
          description: 'Vennligst velg en bildefil',
          variant: 'destructive',
        });
      });
      expect(defaultProps.onImageUpload).not.toHaveBeenCalled();
    });

    it('shows toast error when file too large', async () => {
      render(<ProfileImageUpload {...defaultProps} />);

      const input = screen.getByLabelText('Velg profilbilde') as HTMLInputElement;
      // Create file larger than 5MB
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg'
      });

      Object.defineProperty(input, 'files', {
        value: [largeFile],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Filen er for stor',
          description: 'Bildet må være mindre enn 5MB',
          variant: 'destructive',
        });
      });
      expect(defaultProps.onImageUpload).not.toHaveBeenCalled();
    });

    it('accepts valid image file', async () => {
      const mockOnUpload = jest.fn().mockResolvedValue(undefined);
      render(<ProfileImageUpload {...defaultProps} onImageUpload={mockOnUpload} />);

      const input = screen.getByLabelText('Velg profilbilde');
      const file = new File(['image content'], 'avatar.jpg', { type: 'image/jpeg' });

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith(file);
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Profilbilde oppdatert',
          description: 'Ditt profilbilde har blitt lastet opp',
        });
      });
    });
  });

  describe('Image Upload', () => {
    it('shows success toast after successful upload', async () => {
      const mockOnUpload = jest.fn().mockResolvedValue(undefined);
      render(<ProfileImageUpload {...defaultProps} onImageUpload={mockOnUpload} />);

      const input = screen.getByLabelText('Velg profilbilde');
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Profilbilde oppdatert',
          description: 'Ditt profilbilde har blitt lastet opp',
        });
      });
    });

    it('shows error toast when upload fails', async () => {
      const mockOnUpload = jest.fn().mockRejectedValue(new Error('Upload failed'));
      render(<ProfileImageUpload {...defaultProps} onImageUpload={mockOnUpload} />);

      const input = screen.getByLabelText('Velg profilbilde');
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Opplasting feilet',
          description: 'Kunne ikke laste opp bildet. Vennligst prøv igjen.',
          variant: 'destructive',
        });
      });
    });
  });

  describe('Image Removal', () => {
    it('calls onImageRemove and shows success toast', async () => {
      const mockOnRemove = jest.fn().mockResolvedValue(undefined);
      render(
        <ProfileImageUpload
          {...defaultProps}
          currentImageUrl="https://example.com/avatar.jpg"
          onImageRemove={mockOnRemove}
        />
      );

      const removeButton = screen.getByRole('button', { name: /fjern/i });
      await userEvent.click(removeButton);

      await waitFor(() => {
        expect(mockOnRemove).toHaveBeenCalled();
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Profilbilde fjernet',
          description: 'Ditt profilbilde har blitt fjernet',
        });
      });
    });

    it('shows error toast when removal fails', async () => {
      const mockOnRemove = jest.fn().mockRejectedValue(new Error('Remove failed'));
      render(
        <ProfileImageUpload
          {...defaultProps}
          currentImageUrl="https://example.com/avatar.jpg"
          onImageRemove={mockOnRemove}
        />
      );

      const removeButton = screen.getByRole('button', { name: /fjern/i });
      await userEvent.click(removeButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Fjerning feilet',
          description: 'Kunne ikke fjerne profilbildet. Vennligst prøv igjen.',
          variant: 'destructive',
        });
      });
    });

    it('shows remove button when image exists', () => {
      render(
        <ProfileImageUpload
          {...defaultProps}
          currentImageUrl="https://example.com/avatar.jpg"
        />
      );

      const removeButton = screen.queryByRole('button', { name: /fjern/i });
      expect(removeButton).toBeInTheDocument();
    });

    it('clears preview when remove clicked without onImageRemove handler', async () => {
      render(
        <ProfileImageUpload
          {...defaultProps}
          currentImageUrl="https://example.com/avatar.jpg"
        />
      );

      const removeButton = screen.getByRole('button', { name: /fjern/i });
      await userEvent.click(removeButton);

      // Should not call toast since no handler is provided
      expect(mockToast).not.toHaveBeenCalled();
    });
  });

  describe('Initials Generation', () => {
    it('generates initials from first and last name', () => {
      render(<ProfileImageUpload {...defaultProps} userName="John Doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('handles single name', () => {
      render(<ProfileImageUpload {...defaultProps} userName="Madonna" />);
      expect(screen.getByText('MA')).toBeInTheDocument();
    });

    it('handles empty name', () => {
      render(<ProfileImageUpload {...defaultProps} userName="" />);
      const initials = screen.queryByText(/[A-Z]{2}/);
      expect(initials).not.toBeInTheDocument();
    });
  });
});
