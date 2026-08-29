export type EchoKind = 'stranger' | 'historical';

export interface LocalEcho {
  id: string;
  content: string;
  position: [number, number, number];
  rotation: number;
  fade: number;
  kind: EchoKind;
  era?: string;
}
