declare module 'react-test-renderer' {
  import { ReactElement } from 'react';
  
  export interface Renderer {
    toJSON(): any;
    toTree(): any;
    unmount(): void;
    update(element: ReactElement): void;
    getInstance(): any;
    root: any;
  }
  
  export function create(element: ReactElement): Renderer;
  export function act(callback: () => void | Promise<void>): void;
} 