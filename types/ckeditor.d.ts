// CKEditor 5 React + Classic build don't ship TypeScript declarations.
// These shims keep `tsc --noEmit` happy without changing runtime behaviour.

declare module '@ckeditor/ckeditor5-react' {
  import type { ComponentType } from 'react';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const CKEditor: ComponentType<any>;
}

declare module '@ckeditor/ckeditor5-build-classic' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ClassicEditor: any;
  export default ClassicEditor;
}
