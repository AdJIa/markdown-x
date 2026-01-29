declare module 'react-syntax-highlighter' {
  import * as React from 'react';
  
  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    customStyle?: React.CSSProperties;
    codeTagProps?: React.HTMLProps<HTMLElement>;
    showLineNumbers?: boolean;
    lineNumberStyle?: React.CSSProperties;
    children: string;
  }
  
  export class Prism extends React.Component<SyntaxHighlighterProps> {}
  export class Light extends React.Component<SyntaxHighlighterProps> {}
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const vscDarkPlus: any;
  export const vs: any;
  export const atomDark: any;
  export const oneDark: any;
  export const oneLight: any;
}

declare module 'react-syntax-highlighter/dist/cjs/styles/prism' {
  export const vscDarkPlus: any;
  export const vs: any;
  export const atomDark: any;
  export const oneDark: any;
  export const oneLight: any;
}
