# AI Context Guide: Solana Program Development

This document provides comprehensive context for AI assistants to help with Solana program development in this codebase.

## Project Overview

**Template Name**: Bun Kit - Solana Program Template  
**Purpose**: Minimal, modern Solana program development using Anchor framework with Bun runtime

---

## Technology Stack

### Core Framework

| Component       | Version/Versioning               | Purpose                                         |
| --------------- | -------------------------------- | ----------------------------------------------- |
| **Anchor Lang** | Git master branch (latest)       | Solana smart contract framework                 |
| **Rust**        | 1.93.0 (via rust-toolchain.toml) | Smart contract language                         |
| **Bun**         | 1.3.8                            | JavaScript/TypeScript runtime & package manager |

### Web3 & Client Libraries

| Component               | Version | Purpose                                   |
| ----------------------- | ------- | ----------------------------------------- |
| **@solana/kit**         | ^5.5.1  | Web3.js v2 - Modern Solana JavaScript SDK |
| **@solana/kit-plugins** | ^0.2.0  | LiteSVM testing plugin and utilities      |

### Code Generation

| Component                     | Version         | Purpose                            |
| ----------------------------- | --------------- | ---------------------------------- |
| **Codama**                    | latest (1.3.8+) | IDL-to-client code generation      |
| **@codama/nodes-from-anchor** | ^1.3.8          | Parse Anchor IDL into Codama nodes |
| **@codama/renderers-js**      | ^1.6.1          | Generate TypeScript clients        |

### Development Tools

| Component    | Version       | Purpose                          |
| ------------ | ------------- | -------------------------------- |
| **Mise**     | Latest        | Task runner & version manager    |
| **Oxlint**   | Latest        | TypeScript/JavaScript linting    |
| **Oxfmt**    | Latest        | TypeScript/JavaScript formatting |
| **Rustfmt**  | Via toolchain | Rust formatting                  |
| **Clippy**   | Via toolchain | Rust linting                     |
| **Surfpool** | Latest        | Local Solana validator           |

---

## Project Structure

```
├── Anchor.toml              # Anchor configuration
├── Cargo.toml               # Rust workspace configuration
├── Cargo.lock               # Rust dependency lock
├── mise.toml                # Task runner & tool definitions
├── package.json             # Node dependencies
├── tsconfig.json            # TypeScript configuration
├── codama.json              # Client generation configuration
├── rust-toolchain.toml      # Rust version specification
├── .oxfmtrc.json            # Oxfmt configuration
├── txtx.yml                 # Deployment runbook configuration
│
├── programs/
│   └── bun-kit/
│       ├── Cargo.toml       # Program-specific dependencies
│       └── src/
│           ├── lib.rs       # Program entry point & module exports
│           ├── constants.rs # Program constants
│           ├── error.rs     # Custom error definitions
│           ├── state.rs     # Account state structures
│           ├── instructions.rs # Instruction module exports
│           └── instructions/
│               └── initialize.rs # Individual instruction handlers
│
├── clients/
│   └── js/
│       └── src/
│           └── generated/   # Auto-generated TypeScript clients
│               ├── index.ts
│               ├── instructions/
│               ├── errors/
│               ├── programs/
│               └── shared/
│
├── tests/
│   └── *.test.ts            # Bun test files
│
├── migrations/              # Deployment migration scripts
└── target/
    ├── deploy/              # Compiled .so files
    └── idl/                 # Anchor IDL files
```

---

## Development Standards & Patterns

### Rust Program Structure

#### 1. Module Organization (lib.rs pattern)

```rust
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
// pub use state::*;

declare_id!("<PROGRAM_ID>");

#[program]
pub mod <program_name> {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }
}
```

#### 2. Instruction Pattern (instructions/<name>.rs)

```rust
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct <InstructionName> {
    // Define accounts here
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    msg!("Greetings from: {:?}", ctx.program_id);
    Ok(())
}
```

#### 3. Constants Pattern (constants.rs)

```rust
use anchor_lang::prelude::*;

#[constant]
pub const SEED: &str = "anchor";
```

#### 4. Error Pattern (error.rs)

```rust
use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Custom error message")]
    CustomError,
}
```

#### 5. Dependencies (programs/\*/Cargo.toml)

- Use Anchor from GitHub master branch (not crates.io):

```toml
[dependencies]
anchor-lang = { git = "https://github.com/solana-foundation/anchor", branch = "master" }
```

### TypeScript Testing Standards

#### Test File Pattern (tests/\*.test.ts)

```typescript
import { describe, test, expect, beforeAll } from "bun:test";
import * as solana from "@solana/kit";
import { createDefaultLiteSVMClient, RpcFromLiteSVM } from "@solana/kit-plugins";
import { get<InstructionName>Instruction, <PROGRAM_NAME>_PROGRAM_ADDRESS } from "../clients/js/src/generated";

describe("<Program Name>", () => {
  let client: ReturnType<typeof createDefaultLiteSVMClient>;
  let payer: solana.KeyPairSigner;

  beforeAll(async () => {
    payer = await solana.generateKeyPairSigner();
    client = await createDefaultLiteSVMClient({
      payer: payer,
      airdropAmount: solana.lamports(2_000_000_000n),
    });
    client.rpc satisfies RpcFromLiteSVM;
    client.svm.addProgramFromFile(<PROGRAM_NAME>_PROGRAM_ADDRESS, "./target/deploy/<program_name>.so");
  });

  test("should <do something>", async () => {
    const { value: latestBlockhash } = await client.rpc.getLatestBlockhash().send();
    const instruction = get<InstructionName>Instruction(/* args */);

    // Build transaction using pipe pattern
    const transactionMessage = solana.pipe(
      solana.createTransactionMessage({ version: 0 }),
      (tx) => solana.setTransactionMessageFeePayerSigner(payer, tx),
      (tx) => solana.setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => solana.appendTransactionMessageInstruction(instruction, tx),
    );

    const signedTransaction = await solana.signTransactionMessageWithSigners(transactionMessage);
    const signature = client.svm.sendTransaction(signedTransaction);

    expect(signature).toBeDefined();
  }, 45000);
});
```

#### Key Testing Patterns

- Use **Bun test runner** (not Mocha/Jest)
- Use **LiteSVM** via `@solana/kit-plugins` for local testing
- Use **@solana/kit** (Web3.js v2) - functional programming style with `pipe()`
- Import generated clients from `../clients/js/src/generated`
- Always use version 0 transactions (`{ version: 0 }`)
- Set 45-second timeout for tests (45000 ms)

---

## Configuration Files Reference

### Anchor.toml

```toml
[toolchain]
package_manager = "bun"

[features]
resolution = true
skip-lint = false

[programs.localnet]
<program_name> = "<PROGRAM_ID>"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "bun test"
```

### codama.json

```json
{
  "idl": "target/idl/<program_name>.json",
  "before": [],
  "scripts": {
    "js": {
      "from": "@codama/renderers-js",
      "args": ["clients/js/src/generated"]
    }
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "types": ["bun-types"],
    "lib": ["es2024"],
    "module": "nodenext",
    "target": "es2024",
    "moduleResolution": "nodenext",
    "esModuleInterop": true,
    "isolatedModules": true
  }
}
```

### rust-toolchain.toml

```toml
[toolchain]
channel = "1.93.0"
components = ["rustfmt", "clippy"]
profile = "minimal"
```

### .oxfmtrc.json

```json
{
  "ignorePatterns": [
    ".anchor",
    ".DS_Store",
    "target",
    "node_modules",
    "dist",
    "build",
    "test-ledger"
  ]
}
```

---

## Available Mise Tasks

| Task            | Description                                  | Dependencies    |
| --------------- | -------------------------------------------- | --------------- |
| `mise setup`    | Install npm/bun dependencies                 | -               |
| `mise sync`     | Sync Anchor program keys                     | -               |
| `mise localnet` | Start Surfpool validator                     | -               |
| `mise lint`     | Run Oxlint with auto-fix                     | -               |
| `mise fmt`      | Format TypeScript (Oxfmt) + Rust (cargo fmt) | -               |
| `mise build`    | Build program + generate clients             | lint, fmt, sync |
| `mise deploy`   | Deploy to localnet                           | build           |
| `mise test`     | Run Bun tests                                | build           |
| `mise update`   | Update Bun packages + Cargo deps             | -               |
| `mise clean`    | Clean all build artifacts                    | -               |

### Alias: `m` = `mise`

---

## Build Workflow

### Standard Development Flow

```bash
# 1. Setup (one-time)
mise trust
mise install  # Install tools
mise setup    # Install dependencies

# 2. Development loop
mise fmt      # Format code
mise lint     # Fix lint issues
mise build    # Build program + generate clients
mise test     # Run tests

# 3. Deployment (requires localnet)
mise localnet  # Terminal 1: Start validator
mise deploy    # Terminal 2: Deploy program
```

### Build Process Details

1. **lint** → Oxlint fixes TypeScript issues
2. **fmt** → Oxfmt formats TypeScript, cargo fmt formats Rust
3. **sync** → `anchor keys sync` updates program IDs
4. **build** → `anchor build` compiles program + `codama run js` generates clients
5. **test** → Bun test runner executes tests with LiteSVM

---

## Key Differences from Standard Anchor

| Aspect            | This Template                    | Standard Anchor           |
| ----------------- | -------------------------------- | ------------------------- |
| Package Manager   | **Bun**                          | Yarn/NPM                  |
| Test Runner       | **Bun test**                     | Mocha                     |
| Client Generation | **Codama**                       | anchor-client-gen or none |
| Web3 Library      | **@solana/kit** (v2)             | @solana/web3.js (v1)      |
| Testing Framework | **solana-kit-plugins (LiteSVM)** | Manual or banks-client    |
| Task Runner       | **Mise**                         | npm scripts or custom     |
| Local Validator   | **Surfpool**                     | solana-test-validator     |
| Formatter         | **Oxfmt**                        | Prettier                  |
| Linter            | **Oxlint**                       | ESLint                    |

---

## Common Patterns & Imports

### Solana Kit (@solana/kit) - Functional Style

```typescript
import * as solana from "@solana/kit";

// Creating transactions
const transactionMessage = solana.pipe(
  solana.createTransactionMessage({ version: 0 }),
  (tx) => solana.setTransactionMessageFeePayerSigner(payer, tx),
  (tx) => solana.setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  (tx) => solana.appendTransactionMessageInstruction(instruction, tx),
);

// Signing
const signedTransaction = await solana.signTransactionMessageWithSigners(transactionMessage);

// Keypairs
const payer = await solana.generateKeyPairSigner();
const airdropAmount = solana.lamports(2_000_000_000n); // 2 SOL in lamports
```

### Generated Client Imports

```typescript
// From codama-generated clients
import {
  get<InstructionName>Instruction,
  <PROGRAM_NAME>_PROGRAM_ADDRESS,
} from "../clients/js/src/generated";
```

### LiteSVM Testing

```typescript
import { createDefaultLiteSVMClient, RpcFromLiteSVM } from "@solana/kit-plugins";

const client = await createDefaultLiteSVMClient({
  payer: payer,
  airdropAmount: solana.lamports(2_000_000_000n),
});

// Add compiled program
client.svm.addProgramFromFile(PROGRAM_ADDRESS, "./target/deploy/program.so");

// Send transaction
const signature = client.svm.sendTransaction(signedTransaction);
```

---

## Deployment Environments

### Localnet (Default)

- Validator: Surfpool (`mise localnet`)
- RPC: http://127.0.0.1:8899
- Wallet: ~/.config/solana/id.json

### Devnet

- RPC: https://api.devnet.solana.com
- Configured in txtx.yml

---

## Important Notes

### Anchor Version

- Uses **master branch** from GitHub, NOT crates.io releases
- Must compile anchor-cli from source

### TypeScript Configuration

- Uses `nodenext` module resolution (not Node10/Node)
- Targets ES2024
- Bun types must be included

### Testing

- Always add program to LiteSVM before testing: `client.svm.addProgramFromFile()`
- Tests timeout at 45 seconds by default
- Use BigInt for lamports (e.g., `2_000_000_000n`)

### Code Generation

- Codama generates clients in `clients/js/src/generated/`
- Run `codama run js` or `mise build` to regenerate after IDL changes
- Never manually edit files in `clients/js/src/generated/`

### Git Ignore

Key entries in `.gitignore`:

- .anchor/
- target/
- node_modules/
- .surfpool/
- test-ledger/
- clients/js/src/generated/ (optional - can be regenerated)

---

## When Helping with This Codebase

1. **Always use Bun**, never npm/yarn/pnpm
2. **Use @solana/kit** (functional style with pipe), not @solana/web3.js
3. **Use Bun test runner**, not Mocha/Jest
4. **Use Oxfmt/Oxlint**, not Prettier/ESLint
5. **Import clients from generated/**, not from @project-serum/anchor
6. **Follow the module structure**: lib.rs → instructions/ → individual files
7. **Use Anchor from GitHub master**, not crates.io
8. **Use LiteSVM** for testing, not banks-client
9. **Use mise tasks** for common operations, not manual commands
10. **Format and lint** before any build/test operations

---

## Quick Reference: Adding a New Instruction

1. Create file: `programs/bun-kit/src/instructions/<name>.rs`
2. Export in `programs/bun-kit/src/instructions.rs`
3. Add handler in `programs/bun-kit/src/lib.rs`
4. Run `mise build` to generate clients
5. Write test in `tests/<name>.test.ts`
6. Run `mise test`
