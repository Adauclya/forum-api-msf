import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({
  path: path.resolve(process.cwd(), '.test.env'),
});

export default defineConfig({
  test: {
    globals: true,
    env: {
      NODE_ENV: 'test',
    },
    fileParallelism: false,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});