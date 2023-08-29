use poise::serenity_prelude as serenity;

pub struct Handler;

#[serenity::async_trait]
impl serenity::EventHandler for Handler {
    async fn message(&self, ctx: serenity::Context, new_message: serenity::Message) {
        println!("Got message");
        println!("{:?}", ctx.data);
    }
}
