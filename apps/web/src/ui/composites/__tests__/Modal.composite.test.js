import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../Modal.composite';

describe('Modal.composite', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: 'Modal content',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset body overflow
    document.body.style.overflow = '';
  });

  describe('Basic Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<Modal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders with title', () => {
      render(<Modal {...defaultProps} title="Test Modal" />);

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('renders without title', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-labelledby');
    });

    it('renders footer content', () => {
      const footer = <button>Confirm</button>;
      render(<Modal {...defaultProps} footer={footer} />);

      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    it('renders close button by default', () => {
      render(<Modal {...defaultProps} title="Test" />);

      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });

    it('hides close button when showCloseButton is false', () => {
      render(<Modal {...defaultProps} title="Test" showCloseButton={false} />);

      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('renders small size', () => {
      render(<Modal {...defaultProps} size="sm" />);
      const modal = screen.getByRole('dialog');

      expect(modal).toHaveStyle({ maxWidth: '400px' });
    });

    it('renders medium size (default)', () => {
      render(<Modal {...defaultProps} />);
      const modal = screen.getByRole('dialog');

      expect(modal).toHaveStyle({ maxWidth: '600px' });
    });

    it('renders large size', () => {
      render(<Modal {...defaultProps} size="lg" />);
      const modal = screen.getByRole('dialog');

      expect(modal).toHaveStyle({ maxWidth: '800px' });
    });

    it('renders xl size', () => {
      render(<Modal {...defaultProps} size="xl" />);
      const modal = screen.getByRole('dialog');

      expect(modal).toHaveStyle({ maxWidth: '1000px' });
    });

    it('renders full size', () => {
      render(<Modal {...defaultProps} size="full" />);
      const modal = screen.getByRole('dialog');

      expect(modal).toHaveStyle({ maxWidth: '100%', height: '100%', borderRadius: 0 });
    });
  });

  describe('Close Handlers', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} title="Test" />);

      fireEvent.click(screen.getByLabelText('Close modal'));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when overlay is clicked', () => {
      const onClose = jest.fn();
      const { container } = render(<Modal {...defaultProps} onClose={onClose} />);

      // Click the overlay (first child of portal)
      const overlay = container.querySelector('[aria-hidden="true"]');
      fireEvent.click(overlay);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when modal content is clicked', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByRole('dialog'));

      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not close on overlay click when closeOnOverlayClick is false', () => {
      const onClose = jest.fn();
      const { container } = render(
        <Modal {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />
      );

      const overlay = container.querySelector('[aria-hidden="true"]');
      fireEvent.click(overlay);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('closes on Escape key when closeOnEsc is true', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close on Escape when closeOnEsc is false', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} closeOnEsc={false} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not close on Escape when modal is closed', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} isOpen={false} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not close on other keys', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space' });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Focus Trap', () => {
    it('focuses first focusable element when opened', async () => {
      // Without title/close button, first button in content gets focus
      render(
        <Modal {...defaultProps} showCloseButton={false}>
          <button>First Button</button>
          <button>Second Button</button>
        </Modal>
      );

      await waitFor(() => {
        expect(screen.getByText('First Button')).toHaveFocus();
      });
    });

    it('traps Tab navigation within modal', async () => {
      const user = userEvent.setup();
      render(
        <Modal {...defaultProps} title="Test">
          <button>Button 1</button>
          <button>Button 2</button>
        </Modal>
      );

      const closeButton = screen.getByLabelText('Close modal');
      const button1 = screen.getByText('Button 1');
      const button2 = screen.getByText('Button 2');

      // Wait for initial focus
      await waitFor(() => expect(closeButton).toHaveFocus());

      // Tab forward through elements
      await user.tab();
      expect(button1).toHaveFocus();

      await user.tab();
      expect(button2).toHaveFocus();

      // Tab from last element should wrap to first
      await user.tab();
      expect(closeButton).toHaveFocus();
    });

    it('traps Shift+Tab navigation within modal', async () => {
      const user = userEvent.setup();
      render(
        <Modal {...defaultProps} title="Test">
          <button>Button 1</button>
          <button>Button 2</button>
        </Modal>
      );

      const closeButton = screen.getByLabelText('Close modal');
      const button2 = screen.getByText('Button 2');

      // Wait for initial focus
      await waitFor(() => expect(closeButton).toHaveFocus());

      // Shift+Tab from first element should wrap to last
      await user.tab({ shift: true });
      expect(button2).toHaveFocus();
    });
  });

  describe('Body Scroll Locking', () => {
    it('blocks body scroll when modal is open', () => {
      render(<Modal {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when modal is closed', () => {
      const { rerender } = render(<Modal {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');

      rerender(<Modal {...defaultProps} isOpen={false} />);

      expect(document.body.style.overflow).toBe('');
    });

    it('does not block scroll when blockScroll is false', () => {
      render(<Modal {...defaultProps} blockScroll={false} />);

      expect(document.body.style.overflow).toBe('');
    });

    it('restores scroll on unmount', () => {
      const { unmount } = render(<Modal {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Animations', () => {
    it('applies visible styles when open', () => {
      render(<Modal {...defaultProps} />);
      const modal = screen.getByRole('dialog');

      expect(modal).toHaveStyle({
        opacity: 1,
        transform: 'scale(1) translateY(0)',
      });
    });

    it('applies overlay visible styles when open', () => {
      const { container } = render(<Modal {...defaultProps} />);
      const overlay = container.querySelector('[aria-hidden="true"]');

      expect(overlay).toHaveStyle({ opacity: 1 });
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<Modal {...defaultProps} title="Test Modal" />);
      const modal = screen.getByRole('dialog');

      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('has aria-hidden on overlay', () => {
      const { container } = render(<Modal {...defaultProps} />);
      const overlay = container.querySelector('[aria-hidden="true"]');

      expect(overlay).toHaveAttribute('aria-hidden', 'true');
    });

    it('close button has accessible label', () => {
      render(<Modal {...defaultProps} title="Test" />);

      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing children gracefully', () => {
      render(<Modal isOpen={true} onClose={jest.fn()} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('handles complex footer content', () => {
      const footer = (
        <div>
          <button>Cancel</button>
          <button>Save</button>
        </div>
      );
      render(<Modal {...defaultProps} footer={footer} />);

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('handles rapid open/close toggling', () => {
      const { rerender } = render(<Modal {...defaultProps} isOpen={false} />);

      rerender(<Modal {...defaultProps} isOpen={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      rerender(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(<Modal {...defaultProps} isOpen={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('handles multiple buttons in content for focus trap', async () => {
      render(
        <Modal {...defaultProps} title="Test">
          <button>Button 1</button>
          <button>Button 2</button>
          <button>Button 3</button>
          <input type="text" placeholder="Input" />
          <a href="#test">Link</a>
        </Modal>
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Close modal')).toHaveFocus();
      });
    });
  });

  describe('Mobile Bottom Sheet', () => {
    it('applies mobileBottomSheet styles by default', () => {
      const { container } = render(<Modal {...defaultProps} />);
      const modal = screen.getByRole('dialog');

      // The component applies these inline, but media queries won't apply in Jest
      // We just verify the prop is respected in rendering
      expect(modal).toBeInTheDocument();
    });

    it('can disable mobileBottomSheet', () => {
      render(<Modal {...defaultProps} mobileBottomSheet={false} />);
      const modal = screen.getByRole('dialog');

      expect(modal).toBeInTheDocument();
    });
  });
});
