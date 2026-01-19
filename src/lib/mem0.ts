import { Memory } from 'mem0ai/oss';

let mem0Client: Memory | null = null;

export function getMem0Client() {
  if (!mem0Client) {
    mem0Client = new Memory({
      version: 'v1.1',
      embedder: {
        provider: 'openai',
        config: {
          apiKey: process.env.OPENAI_API_KEY || '',
          model: 'text-embedding-3-small',
        },
      },
      vectorStore: {
        provider: 'memory',
        config: {
          collectionName: 'memories',
          dimension: 1536,
        },
      },
      llm: {
        provider: 'openai',
        config: {
          apiKey: process.env.OPENAI_API_KEY || '',
          model: 'gpt-4.1-nano',
        },
      },
    });
  }
  return mem0Client;
}
