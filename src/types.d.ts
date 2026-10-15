import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

export {};
