import { once } from 'events';
import type { RpcNodeGlobal } from './globalSetup';

/** Stops the Hardhat JSON-RPC node started in globalSetup. */
export default async function globalTeardown(): Promise<void> {
  const node = (globalThis as RpcNodeGlobal).__RPC_NODE__;
  if (node && node.exitCode === null && node.signalCode === null) {
    const exited = once(node, 'exit');
    node.kill();
    await exited;
  }
}
