// components/ui/glow-border.tsx
import React from 'react';
import clsx from 'clsx';

interface GlowBorderProps {
  borderRadius?: number;
  color?: string | string[];
  borderWidth?: number;
  duration?: number;
  className?: string;
}

const GlowBorder: React.FC<GlowBorderProps> = ({
  borderRadius = 10,
  color = '#FFF',
  borderWidth = 2,
  duration = 10,
  className = '',
}) => {
  const backgroundImage = `radial-gradient(transparent, transparent, ${
    Array.isArray(color) ? color.join(',') : color
  }, transparent, transparent)`;

  const styles: React.CSSProperties = {
    '--border-radius': `${borderRadius}px`,
    '--border-width': `${borderWidth}px`,
    '--duration': `${duration}s`,
    backgroundImage,
    backgroundSize: '300% 300%',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMask:
      'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor' as any,
    maskComposite: 'exclude' as any,
    padding: `var(--border-width)`,
    borderRadius: `var(--border-radius)`,
    pointerEvents: 'none',
  } as React.CSSProperties;

  return (
    <div
      className={clsx(
        'absolute inset-0 w-full h-full rounded-[inherit] will-change-[background-position] animate-glow',
        className
      )}
      style={styles}
    />
  );
};

export default GlowBorder;
