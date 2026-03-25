/**
 * Toast hook wrapping sonner for consistent API
 */
import { toast as sonnerToast } from "sonner";

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

export function useToast() {
  const toast = ({ title, description, variant = 'default', duration }: ToastOptions) => {
    const message = title || description || '';
    const options = {
      description: title ? description : undefined,
      duration,
    };

    switch (variant) {
      case 'destructive':
        sonnerToast.error(message, options);
        break;
      case 'success':
        sonnerToast.success(message, options);
        break;
      default:
        sonnerToast(message, options);
    }
  };

  return { toast };
}

// For direct imports
export { toast as sonnerToast } from "sonner";
