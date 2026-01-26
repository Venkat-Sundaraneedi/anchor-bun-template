pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
// pub use state::*;

declare_id!("5gP1fQZ6vG2iAwd1nCCQKFaayNiiPDZybw7cyfxotdpW");

#[program]
pub mod jest_multiple {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }
}
