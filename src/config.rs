use std::collections::HashMap;

use anyhow::Context;
use poise::serenity_prelude::TypeMapKey;

#[derive(serde::Deserialize)]
pub struct Config {
    pub token: String,
    pub servers: HashMap<String, ServerConfig>,
}

impl TypeMapKey for Config {
    type Value = Config;
}

#[derive(serde::Deserialize)]
pub struct ServerConfig {
    pub memes_channel: String,
    pub best_memes_channel: String,
}

pub fn load_config() -> anyhow::Result<Config> {
    let f = std::fs::File::open("config.yml").context("Failed to open config.yml file")?;
    let config: Config = serde_yaml::from_reader(f).context("Could not parse config")?;

    Ok(config)
}
