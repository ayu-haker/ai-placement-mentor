declare module 'mammoth' {
  interface MammothResult {
    value: string;
    messages: any[];
  }

  interface MammothOptions {
    path?: string;
    buffer?: Buffer;
  }

  export function extractRawText(options: MammothOptions): Promise<MammothResult>;
}
