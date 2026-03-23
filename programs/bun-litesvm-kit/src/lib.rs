pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
// pub use state::*;

declare_id!("9w1KbUjYakxKxW1iXBNPrhyqvK4dgzE5DTSYksW5rz5");

#[program]
pub mod bun_litesvm_kit {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }
}
