# Anchor Bun Template

A minimal, modern Solana program template using Anchor framework with Bun runtime.

## Prerequisites

| Tool           | Purpose                       | Installation                                                    |
| -------------- | ----------------------------- | --------------------------------------------------------------- |
| **Mise**       | Task runner & version manager | `curl https://mise.run \| sh`                                   |
| **Solana CLI** | Solana toolchain              | `sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"` |
| **Anchor CLI** | Solana framework              | See compilation instructions below                              |
| **Surfpool**   | Local validator               | `curl -sL https://run.surfpool.run/ \| bash`                    |

```bash
# Optional QoL: Enable mise completions
mise use -g usage
```

### Anchor CLI Installation (Compiled from master)

This template uses Anchor's master branch. To install:

```bash
# Clone and build anchor from source
git clone https://github.com/solana-foundation/anchor.git
cd anchor
cargo build -p anchor-cli --release

# Copy to global PATH
cp target/release/anchor ~/.local/bin/  # or any directory in your PATH
```

Verify installations:

```bash
mise --version
solana --version
anchor --version
surfpool --version
```

## Quick Start

```bash
# Clone and setup
git clone https://github.com/Venkat-Sundaraneedi/anchor-bun-template.git
cd anchor-bun-template
mise trust    # Trust the mise configuration
mise install  # Install project dependencies (tools)

mise setup  # Install project dependencies (npm packages)

# Run tests
mise test
```

## Opinionated Tech Stack

| Component             | This Template               | Default Anchor        |
| --------------------- | --------------------------- | --------------------- |
| **Package Manager**   | Bun                         | Yarn/NPM              |
| **Test Runner**       | Bun test                    | Mocha                 |
| **Client Library**    | Generated via Codama        | anchor-lang/core      |
| **Web3 Library**      | @solana/kit (Web3.js v2)    | @solana/web3.js v1    |
| **Testing Framework** | solana-kit-plugins (litesvm)| Manual                |
| **Automation**        | Mise tasks                  | Custom scripts        |
| **Localnet**          | Surfpool                    | solana-test-validator |
| **Deployment**        | Surfpool Runbooks           | Anchor migrations     |

## Project Structure

```
├── programs/bun-kit/          # Solana program (Rust)
│   ├── src/
│   │   ├── lib.rs            # Program entry point
│   │   ├── instructions/     # Instruction handlers
│   │   ├── state/            # Account state definitions
│   │   ├── constants.rs      # Program constants
│   │   └── error.rs          # Custom errors
├── tests/                     # Test suite (TypeScript)
│   ├── bun_kit.test.ts       # Main test file
│   └── kite_example.test.ts  # Kite example tests
├── clients/                   # Generated clients
│   └── js/
│       ├── src/generated/    # Codama-generated client code
│       ├── index.ts          # Client exports
│       └── package.json      # Client package config
├── migrations/               # Deployment scripts
│   └── deploy.ts             # Anchor migration script
├── runbooks/                 # Surfpool runbooks
│   ├── README.md             # Runbook documentation
│   └── deployment/           # Deployment runbook
├── target/                   # Build artifacts
├── Anchor.toml              # Anchor configuration
├── Cargo.toml               # Rust workspace config
├── codama.json              # Codama client generation config
├── mise.toml                # Mise task runner config
├── package.json             # Bun dependencies
└── tsconfig.json            # TypeScript configuration
```

## Tech Stack (Installed automatically via mise)

| Component                     | Purpose                      | Version    |
| ----------------------------- | ---------------------------- | ---------- |
| **Bun**                       | JavaScript runtime           | 1.3.9+     |
| **Anchor Lang**               | Solana framework             | Git master |
| **Codama**                    | TypeScript client generation | latest     |
| **Solana Kit**                | Web3.js v2 wrapper           | ^6.1.0     |
| **Solana Kit Plugins**        | LiteSVM testing utilities    | ^0.5.0     |
| **Oxlint**                    | TypeScript linting           | latest     |
| **Oxfmt**                     | TypeScript formatting        | latest     |
| **PM2**                       | Process manager              | latest     |

## NPM Dependencies

| Package                        | Purpose                    | Version  |
| ------------------------------ | -------------------------- | -------- |
| **@solana/kit**                | Core Solana web3 library   | ^6.1.0   |
| **@solana/kit-plugins**          | Testing plugins (LiteSVM)  | ^0.5.0   |
| **@codama/nodes-from-anchor**  | Codama Anchor IDL parser   | ^1.3.8   |
| **@codama/renderers-js**         | TypeScript client renderer | ^2.0.2   |
| **solana-kite**                  | Kite deployment utility    | ^3.2.0   |

## Development Workflow

```bash
// ====================================
// SETUP & SYNC
// ====================================
mise setup      # Install dependencies
mise sync       # Sync Anchor keys

// ====================================
// DEVELOPMENT
// ====================================
mise fmt        # Format code (TypeScript + Rust)
mise lint       # Lint and fix
mise build      # Build program and generate Codama clients

// ====================================
// TESTING & DEPLOYMENT
// ====================================
mise test       # Run tests (using Bun test runner)


// ====================================
// DEPLOYMENT
// ====================================
# Note: Ensure surfpool is running for localnet deployment
mise surfpool_start   # Start local validator (surfpool via pm2)
mise surfpool_stop    # Stop surfpool
mise deploy           # Deploy to localnet
```

## Available Mise Tasks

| Task            | Description                              | Dependencies         |
| --------------- | ---------------------------------------- | -------------------- |
| **setup**       | Install Bun dependencies                 | -                    |
| **sync**        | Sync Anchor program keys                 | -                    |
| **build**       | Build program + generate clients         | sync                 |
| **test**        | Run full test suite                      | build, lint, fmt     |
| **lint**        | Lint TypeScript with auto-fix            | -                    |
| **fmt**         | Format TypeScript and Rust code          | -                    |
| **deploy**      | Deploy program to Surfpool               | build                |
| **surfpool_start** | Start Surfpool validator (pm2)          | -                    |
| **surfpool_stop**  | Stop Surfpool validator                 | -                    |
| **update**      | Update Bun and Cargo dependencies        | -                    |
| **clean**       | Clean all build artifacts and caches     | -                    |

## Configuration Files

- **Anchor.toml** - Program configuration and provider settings
- **mise.toml** - Task runner and tool versions
- **codama.json** - Codama client generation configuration
- **Cargo.toml** - Rust workspace configuration
- **tsconfig.json** - TypeScript compiler configuration
- **txtx.yml** - Surfpool runbook configuration

## Testing

Tests use Bun's built-in test runner with Codama-generated clients and LiteSVM:

```typescript
import { describe, test, expect, beforeAll } from "bun:test";
import * as solana from "@solana/kit";
import { createDefaultLiteSVMClient } from "@solana/kit-plugins";
import { getInitializeInstruction, BUN_KIT_PROGRAM_ADDRESS } from "../clients/js";
```

The test suite includes:
- LiteSVM-based in-memory testing (no local validator needed)
- Program loading from compiled `.so` files
- Transaction building with @solana/kit pipe API

## Client Generation

The template uses **Codama** to generate TypeScript clients from the Anchor IDL:

1. Build the program: `anchor build` generates the IDL at `target/idl/bun_kit.json`
2. Run Codama: `codama run js` generates clients in `clients/js/src/generated/`
3. Import from the generated client:
   ```typescript
   import { getInitializeInstruction, BUN_KIT_PROGRAM_ADDRESS } from "../clients/js";
   ```

## Surfpool Integration

This template includes Surfpool for advanced local development:

- **Surfnet**: Local validator with mainnet forking capability
- **Runbooks**: Infrastructure-as-code deployment scripts
- **Watch Mode**: Auto-deploy on program recompilation

Start with watch mode:
```bash
surfpool start --watch
```

Execute runbooks:
```bash
surfpool run deployment
```

## Local Development Notes

// ====================================
// IMPORTANT
// ====================================
// For localnet deployment, ensure surfpool is running.
(The project is configured to deploy to localnet by default.)

## Code Quality

- **Formatter**: Oxfmt (TypeScript) + cargo fmt (Rust)
- **Linter**: Oxlint with auto-fix and type-aware checking
- **Client Generation**: Codama generates TypeScript clients from Anchor IDL
- **Type Safety**: Strict TypeScript with `noUncheckedIndexedAccess`

## Maintenance

```bash
mise update    # Update project dependencies
mise clean     # Clean build artifacts and caches
```

## Network Configuration

Default network: **localnet**

- Update `provider.cluster` in `Anchor.toml` for different networks
- Program address: `BkYi3E2b4ujmxJEdopTz3nhRwu2Ax9XgNXuC7MYfCKR2`
- Ensure corresponding validator (surfpool for localnet) is running

## Program Info

- **Program Name**: bun_kit
- **Program ID**: BkYi3E2b4ujmxJEdopTz3nhRwu2Ax9XgNXuC7MYfCKR2
- **Instructions**: Initialize
- **State**: (Add your account states here)
