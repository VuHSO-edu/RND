import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        poster?: string;
        alt?: string;
        'auto-rotate'?: boolean | string;
        'camera-controls'?: boolean | string;
        ar?: boolean | string;
        'ar-modes'?: string;
        'shadow-intensity'?: string;
        exposure?: string;
        style?: React.CSSProperties;
      };
    }
  }
}
