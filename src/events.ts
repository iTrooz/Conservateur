import { type Client, Events, TextChannel } from 'discord.js'
import { CONFIG } from './main'
import { LOGGER } from './logger'

const sentBestMemes: string[] = [];

export default (client: Client): void => {

    client.on(Events.MessageReactionAdd, async (reaction, user) => {
        const logger_id = Math.floor(Math.random() * 10000)
        const logger = LOGGER.getSubLogger({ "name": `reaction/${logger_id}` })

        logger.debug("Received reaction")

        let guildConfig = CONFIG.servers[reaction.message.guild!.id];
        if (!guildConfig) {
            logger.debug("but there is no config for this guild")
            return;
        };


        // verify we are in the right channel
        if (guildConfig.memes_channel != reaction.message.channel.id) {
            logger.debug("in the wrong channel");
            return;
        }

        // verify if this is the right reaction
        if ((reaction.emoji.id && reaction.emoji.id == guildConfig.emoji) || (reaction.emoji.name == guildConfig.emoji)) {
        } else {
            logger.debug("wrong emoji");
            return;
        }

        // load reaction number, and verify we passed the threshold of reactions
        await reaction.fetch()
        if (!reaction.count || reaction.count < guildConfig.needed_reactions) {
            logger.debug("threshold not passed");
            return;
        };

        // resolve best-memes channel
        let bestMemesChannel = client.channels.resolve(guildConfig.best_memes_channel)!;
        if (!bestMemesChannel.isTextBased()) throw TypeError("best-memes channel is not text-based");

        // at this point, we already mark the message as been sent, and put it in the already-sent best memes list
        // this is because else, if the event is sent twice very quickly, this function might be run a second time while
        // the 'await' after this comment are being resolved, and the message may be posted twice
        if (sentBestMemes.includes(reaction.message.id)) {
            LOGGER.debug("best-memes channel already had that meme (id cache)")
            return;
        }
        sentBestMemes.push(reaction.message.id);
        // now that this is done, we can use 'await'
        // TODO no, check if the message was in the best-memes channel first (cache should be automatic ?)

        // retrieve message
        let message = reaction.message;
        await message.fetch();

        // compute content to be sent to best-memes channel
        let content = `Meme de ${user} (${message.url})\n`;
        if (message.attachments.size == 0) {
            content += "> " + message.content!.replace("\n", "\n> ");
        } else {
            content += message.attachments.map(attach => attach.url).join(" ");
        }

        // verify it hasn't already been sent
        await bestMemesChannel.messages.fetch({ limit: 100 })
        if (bestMemesChannel.messages.cache.filter(msg => msg.content == content).size > 0) {
            logger.debug("best-memes channel already had that meme (content cache)")
            return;
        }

        // send message
        await bestMemesChannel.send(content);
        logger.info("Received reaction, and sent meme to best-memes")
    })
}
