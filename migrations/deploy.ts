// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

import { connect, type Connection } from "solana-kite";

module.exports = async function (connection: Connection) {
  // Configure client to use the connection.
  // If no connection is provided, create a new one (defaults to localnet)
  const kiteConnection = connection || connect();

  // Add your deploy script here.
  // Use kiteConnection to interact with the Solana blockchain
  const wallet = await kiteConnection.createWallet(); // Example
  console.log(`wallet address: ${wallet.address}`);
};
