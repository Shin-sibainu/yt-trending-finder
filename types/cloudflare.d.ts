// Minimal ambient types to satisfy TS without installing workers types

interface D1PreparedStatement {
  bind: (...args: any[]) => D1PreparedStatement;
  first<T = any>(): Promise<T | null>;
  all<T = any>(): Promise<{ results: T[] }>;
  run(): Promise<any>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

