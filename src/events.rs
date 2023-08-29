use poise::serenity_prelude as serenity;

pub struct Handler;

#[serenity::async_trait]
impl serenity::EventHandler for Handler {
    async fn message(&self, ctx: serenity::Context, new_message: serenity::Message) {
        println!("Got message");
        // poise::dispatch_event(framework_data, &ctx, &poise::Event::Message { new_message }).await;
    }

    // For slash commands or edit tracking to work, forward interaction_create and message_update
}
