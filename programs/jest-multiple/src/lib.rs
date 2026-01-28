pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
// pub use state::*;

declare_id!("EEMw5bXyDq75hWqtQMXW6N3bsKnQhCBwRQAsg3sdnv4c");

#[program]
pub mod jest_multiple {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }
}
