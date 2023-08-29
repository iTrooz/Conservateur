mod bot;
mod config;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // load config
    let config = config::load_config()?;

    // init the bot with the token
    bot::init_bot(&config.token).await;

    Ok(())
}
