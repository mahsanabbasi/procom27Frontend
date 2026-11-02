import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Custom hook for accessible modal dialogs.
 * Handles:
 * - Focus trapping (cycles Tab & Shift+Tab within modalRef)
 * - Escape key dismissal (calls onClose)
 * - Body scroll lock (sets overflow to 'hidden' and restores on cleanup)
 * - Focus restoration (returns focus to previously active element)
 *
 * @param {boolean} isOpen - Whether modal dialog is currently visible
 * @param {Function} [onClose] - Close handler callback
 * @param {React.RefObject} [customRef] - Optional existing ref to modal container
 * @returns {{ modalRef: React.RefObject }}
 */
export function useModalAccessibility(isOpen, onClose, customRef) {
  const internalRef = useRef(null);
  const modalRef = customRef || internalRef;
  const previouslyFocusedElement = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Remember currently focused element to restore on close
    previouslyFocusedElement.current = document.activeElement;

    // 2. Lock body scroll while open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 3. Set initial focus into modal
    const frameId = requestAnimationFrame(() => {
      if (!modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        modalRef.current.focus?.();
      }
    });

    // 4. Trap focus and listen for Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      if (e.key === 'Tab') {
        if (!modalRef.current) return;

        const focusables = Array.from(
          modalRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
        ).filter(
          (el) =>
            !el.hasAttribute('disabled') &&
            el.tabIndex !== -1 &&
            (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0)
        );

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;

      if (
        previouslyFocusedElement.current &&
        typeof previouslyFocusedElement.current.focus === 'function'
      ) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen, onClose, modalRef]);

  return { modalRef };
}
