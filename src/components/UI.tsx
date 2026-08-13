import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Section = ({ children, className, id }: SectionProps) => (
  <section id={id} className={cn("py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24 overflow-hidden", className)}>
    <div className="max-w-7xl mx-auto">
      {children}
    </div>
  </section>
);

export const KintsugiDivider = ({ className }: { className?: string }) => (
  <div className={cn("relative h-px w-full my-12", className)}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-burnished to-transparent opacity-40" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border border-gold-burnished bg-sage-soft" />
  </div>
);

export const Button = ({ 
  children, 
  variant = 'primary', 
  className,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' }) => {
  const variants = {
    primary: {
      bg: "bg-emerald-deep",
      text: "text-sage-soft",
      hoverBg: "bg-gold-burnished",
      hoverText: "group-hover:text-emerald-deep",
      border: "border-emerald-deep"
    },
    secondary: {
      bg: "bg-gold-light",
      text: "text-emerald-deep",
      hoverBg: "bg-emerald-deep",
      hoverText: "group-hover:text-gold-light",
      border: "border-gold-light"
    },
    outline: {
      bg: "bg-transparent",
      text: "text-emerald-deep",
      hoverBg: "bg-emerald-deep",
      hoverText: "group-hover:text-sage-soft",
      border: "border-emerald-deep"
    }
  };

  const v = variants[variant];

  return (
    <motion.button 
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn(
        "group relative px-8 py-3 font-medium tracking-widest uppercase text-xs overflow-hidden border transition-shadow duration-500 shadow-sm hover:shadow-lg",
        "focus-visible:ring-2 focus-visible:ring-gold-burnished/50 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-sage-soft",
        v.bg,
        v.text,
        v.border,
        className
      )}
      {...(props as any)}
    >
      {/* Hover Background Slide */}
      <div 
        className={cn(
          "absolute inset-0 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
          v.hoverBg
        )} 
      />
      
      {/* Button Content */}
      <span className={cn("relative z-10 flex items-center justify-center gap-2 transition-colors duration-500", v.hoverText)}>
        {children}
      </span>
    </motion.button>
  );
};

export const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  title 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode; 
  title?: string;
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };

    const handleTabKey = (e: KeyboardEvent) => {
      if (!modalRef.current) return;
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      window.addEventListener('keydown', handleTabKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('keydown', handleTabKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Only focus first element on initial open, not on every render
  const justOpened = useRef(false);
  useEffect(() => {
    if (isOpen && !justOpened.current) {
      justOpened.current = true;
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector('button, input, [tabindex]:not([tabindex="-1"])') as HTMLElement;
        firstFocusable?.focus();
      }, 100);
    }
    if (!isOpen) {
      justOpened.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-emerald-deep/80 backdrop-blur-sm"
        aria-hidden="true"
      />
      <motion.div 
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-xl bg-sage-soft p-6 sm:p-8 md:p-12 shadow-2xl border border-gold-burnished/20 overflow-y-auto max-h-[90vh] focus:outline-none"
        tabIndex={-1}
      >
        <Button 
          onClick={onClose}
          variant="outline"
          className="absolute top-6 right-6 p-2 border-none bg-transparent hover:bg-transparent text-emerald-deep"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </Button>
        {title && <h3 id="modal-title" className="text-3xl font-serif mb-8 text-emerald-deep">{title}</h3>}
        {children}
      </motion.div>
    </div>
  );
};
