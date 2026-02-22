import { describe, test, expect, beforeAll } from "bun:test";
import { type KeyPairSigner } from "@solana/kit";
import { connect, type Connection } from "solana-kite";
import { getInitializeInstruction } from "../clients/js/src/generated";

describe("Kite Example Program", () => {
  let payer: KeyPairSigner;
  let connection: Connection;

  beforeAll(async () => {
    connection = connect();
    payer = await connection.createWallet({
      commitment: "confirmed",
    });
  });

  test.skip("should initialize the program", async () => {
    const initializeInstruction = getInitializeInstruction();
    const signature = await connection.sendTransactionFromInstructions({
      feePayer: payer,
      instructions: [initializeInstruction],
      commitment: "confirmed",
      skipPreflight: true,
    });

    console.log("Transaction sent:", signature);
    expect(signature).toBeDefined();
  }, 45000);
});
