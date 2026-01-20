import * as anchor from "@anchor-lang/core";
import { test, expect } from "bun:test";

test("jest-multiple - Is initialized!", async () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  
  // Add your test here.
  const program = anchor.workspace.jestMultiple;
  const tx = await program.methods.initialize().rpc();
  
  console.log("Your transaction signature", tx);
  
  // Add assertions if needed
  expect(tx).toBeDefined();
});
