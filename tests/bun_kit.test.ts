import { describe, test, expect, beforeAll } from "bun:test";
import * as solana from "@solana/kit";
import { createDefaultLiteSVMClient, RpcFromLiteSVM } from "@solana/kit-plugins";
import { getInitializeInstruction, BUN_KIT_PROGRAM_ADDRESS } from "../clients/js/src/generated";

describe("Bun Kit Program", () => {
  let client: ReturnType<typeof createDefaultLiteSVMClient>;
  let payer: solana.KeyPairSigner;

  beforeAll(async () => {
    payer = await solana.generateKeyPairSigner();
    client = await createDefaultLiteSVMClient({ payer: payer });
    client.rpc satisfies RpcFromLiteSVM;

    // Airdrop SOL to payer
    await client.airdrop(payer.address, solana.lamports(2_000_000_000n));

    //client.svm.setAccount(payer.address);
    client.svm.addProgramFromFile(BUN_KIT_PROGRAM_ADDRESS, "./target/deploy/bun_kit.so");

    // Verify program is deployed
    const accountInfo = await client.rpc
      .getAccountInfo(BUN_KIT_PROGRAM_ADDRESS, { encoding: "base64" })
      .send();

    if (!accountInfo.value || !accountInfo.value.executable) {
      throw new Error(`Program ${BUN_KIT_PROGRAM_ADDRESS} is not deployed.`);
    }
  });

  test("should initialize the program", async () => {
    const { value: latestBlockhash } = await client.rpc.getLatestBlockhash().send();
    const initializeInstruction = getInitializeInstruction();

    // Build and sign transaction
    const transactionMessage = solana.pipe(
      solana.createTransactionMessage({ version: 0 }),
      (tx) => solana.setTransactionMessageFeePayerSigner(payer, tx),
      (tx) => solana.setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => solana.appendTransactionMessageInstruction(initializeInstruction, tx),
    );

    const signedTransaction = await solana.signTransactionMessageWithSigners(transactionMessage);

    // Send transaction using LiteSVM's sendTransaction
    const signature = client.svm.sendTransaction(signedTransaction);

    console.log(":white_check_mark: Transaction sent:", signature);
    expect(signature).toBeDefined();
  }, 45000);
});
