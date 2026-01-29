import { describe, test, expect, beforeAll } from "bun:test";
import * as solana from "@solana/kit";
import { airdrop, litesvm, transactionPlanner } from "@solana/kit-plugins";
import { getInitializeInstruction, BUN_KIT_PROGRAM_ADDRESS } from "../clients/js/src/generated";

const RPC_ENDPOINT = process.env.RPC_ENDPOINT || "http://127.0.0.1:8899";

describe("Bun Kit Program", () => {
  let rpc: ReturnType<typeof solana.createSolanaRpc>;
  let client: solana.createEmptyClient;
  let payer: solana.KeyPairSigner;

  beforeAll(async () => {
    client = solana.createEmptyClient().use(litesvm()).use(airdrop());
    rpc = solana.createSolanaRpc(RPC_ENDPOINT);
    payer = await solana.generateKeyPairSigner();

    // Airdrop SOL to payer
    client.airdrop(payer.address, lamports(2_000_000_000n));
    try {
      await rpc.requestAirdrop(payer.address, BigInt(2_000_000_000)).send();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.warn("Airdrop failed:", error);
    }

    // Verify program is deployed
    const accountInfo = await rpc
      .getAccountInfo(BUN_KIT_PROGRAM_ADDRESS, { encoding: "base64" })
      .send();

    if (!accountInfo.value || !accountInfo.value.executable) {
      throw new Error(
        `Program ${BUN_KIT_PROGRAM_ADDRESS} is not deployed. Run 'anchor deploy' first.`,
      );
    }
  });

  test("should initialize the program", async () => {
    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
    const initializeInstruction = getInitializeInstruction();

    // Build and sign transaction
    const transactionMessage = solana.pipe(
      solana.createTransactionMessage({ version: 0 }),
      (tx) => solana.setTransactionMessageFeePayerSigner(payer, tx),
      (tx) => solana.setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => solana.appendTransactionMessageInstruction(initializeInstruction, tx),
    );

    const signedTransaction = await solana.signTransactionMessageWithSigners(transactionMessage);
    const signature = solana.getSignatureFromTransaction(signedTransaction);
    const base64Transaction = solana.getBase64EncodedWireTransaction(signedTransaction);

    // Send transaction
    await rpc
      .sendTransaction(base64Transaction, {
        encoding: "base64",
        maxRetries: 3,
      })
      .send();

    // Wait for confirmation
    let confirmed = false;
    for (let i = 0; i < 30; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const status = await rpc.getSignatureStatuses([signature]).send();

      if (
        status.value[0]?.confirmationStatus === "confirmed" ||
        status.value[0]?.confirmationStatus === "finalized"
      ) {
        confirmed = true;
        expect(status.value[0].err).toBeNull();
        break;
      }
    }

    expect(confirmed).toBe(true);
    console.log("✅ Transaction confirmed:", signature);
  }, 45000);
});
