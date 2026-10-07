import { ChildProcess, spawn } from 'child_process';
import path from 'path';

const RPC_HOST = '127.0.0.1';
const RPC_PORT = 8544;
const STARTUP_TIMEOUT_MS = 60000;

export type RpcNodeGlobal = typeof globalThis & { __RPC_NODE__?: ChildProcess };

/**
 * Starts a local Hardhat JSON-RPC node for the test suite.
 * Chain id, mnemonic and accounts are configured in hardhat.config.js.
 */
export default async function globalSetup(): Promise<void> {
  const node = spawn(
    process.execPath,
    [
      require.resolve('hardhat/internal/cli/bootstrap.js'),
      'node',
      '--hostname',
      RPC_HOST,
      '--port',
      String(RPC_PORT),
    ],
    {
      cwd: path.resolve(__dirname, '../..'),
      env: { ...process.env, HARDHAT_DISABLE_TELEMETRY_PROMPT: 'true' },
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );
  (globalThis as RpcNodeGlobal).__RPC_NODE__ = node;

  await new Promise<void>((resolve, reject) => {
    let ready = false;
    let output = '';
    const timer = setTimeout(() => {
      node.kill();
      reject(new Error(`Hardhat node did not start in time:\n${output}`));
    }, STARTUP_TIMEOUT_MS);

    // Output keeps being drained after startup so the node never blocks on a full pipe.
    const onData = (chunk: Buffer) => {
      if (ready) return;
      output += chunk.toString();
      if (output.includes('Started HTTP and WebSocket JSON-RPC server')) {
        ready = true;
        clearTimeout(timer);
        resolve();
      }
    };
    node.stdout?.on('data', onData);
    node.stderr?.on('data', onData);
    node.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Hardhat node exited with code ${code}:\n${output}`));
    });
  });
}
