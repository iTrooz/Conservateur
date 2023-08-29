use poise::serenity_prelude as serenity;

pub struct Handler;

#[serenity::async_trait]
impl serenity::EventHandler for Handler {
    async fn reaction_add(&self, ctx: serenity::Context, reaction: serenity::Reaction) -> anyhow::Result<()> {
        println!("{:?}", reaction);

        let message = ctx
            .http
            .get_message(reaction.channel_id.0, reaction.message_id.0).await;
    }
}
