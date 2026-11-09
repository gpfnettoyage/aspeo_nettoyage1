'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CodeInputProps {
  /** Number of digits (default: 6) */
  length?: number;
  /** Called on every change */
  onChange?: (value: string) => void;
  /** Called when all digits are entered */
  onComplete?: (value: string) => void;
  /** Disable all inputs */
  disabled?: boolean;
  /** Auto-focus first input on mount (default: true) */
  autoFocus?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Variant: 'default' for numeric only, 'backup' for alphanumeric */
  variant?: 'default' | 'backup';
}

export function CodeInput({
  length = 6,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  className,
  variant = 'default',
}: CodeInputProps) {
  const [values, setValues] = useState<string[]>(() => Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pendingCallbackRef = useRef<{ onChange?: string; onComplete?: string } | null>(null);

  // Focus first input on mount
  useEffect(() => {
    if (autoFocus && !disabled) {
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [autoFocus, disabled]);

  // Handle pending callbacks after render
  useEffect(() => {
    if (pendingCallbackRef.current) {
      const { onChange: onChangeValue, onComplete: onCompleteValue } = pendingCallbackRef.current;
      pendingCallbackRef.current = null;

      if (onChangeValue !== undefined) {
        onChange?.(onChangeValue);
      }
      if (onCompleteValue !== undefined) {
        onComplete?.(onCompleteValue);
      }
    }
  });

  const sanitizeInput = useCallback(
    (input: string): string => {
      if (variant === 'backup') {
        return input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1);
      }
      return input.replace(/\D/g, '').slice(-1);
    },
    [variant]
  );

  const handleInputChange = useCallback(
    (index: number, inputValue: string) => {
      const sanitized = sanitizeInput(inputValue);

      setValues((prev) => {
        const newValues = [...prev];
        newValues[index] = sanitized;
        const fullValue = newValues.join('');

        // Schedule callbacks for after render
        pendingCallbackRef.current = {
          onChange: fullValue,
          onComplete: sanitized && index === length - 1 && newValues.every((d) => d !== '')
            ? fullValue
            : undefined,
        };

        return newValues;
      });

      // Auto-focus next input
      if (sanitized && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [length, sanitizeInput]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace') {
        if (!values[index] && index > 0) {
          e.preventDefault();
          inputRefs.current[index - 1]?.focus();
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === 'ArrowRight' && index < length - 1) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }
    },
    [values, length]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const rawData = e.clipboardData.getData('text');
      const pastedData =
        variant === 'backup'
          ? rawData.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, length)
          : rawData.replace(/\D/g, '').slice(0, length);

      if (pastedData.length > 0) {
        const newValues = [
          ...pastedData.split(''),
          ...Array(Math.max(0, length - pastedData.length)).fill(''),
        ];
        setValues(newValues);

        const fullValue = newValues.join('');

        // Schedule callbacks for after render
        pendingCallbackRef.current = {
          onChange: fullValue,
          onComplete: pastedData.length >= length ? fullValue : undefined,
        };

        const focusIndex = Math.min(pastedData.length, length - 1);
        inputRefs.current[focusIndex]?.focus();
      }
    },
    [length, variant]
  );

  return (
    <div
      className={cn('flex justify-center gap-2', className)}
      role="group"
      aria-label="Code de vérification"
    >
      {values.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode={variant === 'backup' ? 'text' : 'numeric'}
          maxLength={1}
          value={digit}
          onChange={(e) => handleInputChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            'w-12 h-14 text-center text-xl font-bold',
            'focus:ring-2 focus:ring-primary focus:border-primary',
            'transition-all duration-150',
            variant === 'backup' && 'font-mono'
          )}
          disabled={disabled}
          aria-label={`Caractère ${index + 1} sur ${length}`}
        />
      ))}
    </div>
  );
}
