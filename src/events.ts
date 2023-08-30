import { type Client, Events, TextChannel, Message, User, MessageReaction, PartialMessageReaction, PartialUser } from 'discord.js'
import { CONFIG } from './main'
import { LOGGER } from './logger'

const sentBestMemes: string[] = [];

function getMessageLinks(message: Message): string[] {
    let links = message.attachments.map(attach => attach.url);
    for (let url of message.embeds.map(embed => embed.url)) {
        if (url) links.push(url);
    }

    return links;
}

export default (client: Client): void => {

    // on startup, scan past messages to see if a meme should be posted as a best meme, but had its reaction when the bot was offline
    client.on(Events.ClientReady, async () => {
        let logger = LOGGER.getSubLogger({ "name": "init_reaction" });
        logger.info("Checking reactions from existing messages")

        for (const [guild, guildConfig] of Object.entries(CONFIG.servers)) {

            // find memes channel
            let memesChannel = await client.channels.fetch(guildConfig.memes_channel)
            if (!(memesChannel instanceof TextChannel)) {
                logger.warn(`memes channel of guild ${guild} is not a text channel`)
                continue;
            }
            // loop messages in that channel
            let messages = await memesChannel.messages.fetch({ limit: 100 })
            for (let [_, message] of messages) {
                // find reactions for that message
                for (let [_, reaction] of message.reactions.cache) {
                    // check the reaction
                    if(await handleReaction(reaction)) {
                        logger.info(`Found and sent best meme that wasn't posted: ${reaction.message.url}`);
                    }
                }
            }
        }

        logger.info(`Finished !`);
    })

    // check every new reaction made by users to see when a meme should be considered best meme
    client.on(Events.MessageReactionAdd, (reaction, user) => { handleReaction(reaction) });

    async function handleReaction(reaction: MessageReaction | PartialMessageReaction): Promise<boolean> {
        const logger_id = Math.floor(Math.random() * 10000)
        const logger = LOGGER.getSubLogger({ "name": `reaction/${logger_id}` })

        logger.debug("Received reaction")

        let guildConfig = CONFIG.servers[reaction.message.guild!.id];
        if (!guildConfig) {
            logger.debug("but there is no config for this guild")
            return false;
        };

        // verify we are in the right channel
        if (guildConfig.memes_channel != reaction.message.channel.id) {
            logger.debug("in the wrong channel");
            return false;
        }

        // verify if this is the right reaction
        if ((reaction.emoji.id && reaction.emoji.id == guildConfig.emoji) || (reaction.emoji.name == guildConfig.emoji)) {
        } else {
            logger.debug(`wrong emoji (${reaction.emoji.id || reaction.emoji.name})`);
            return false;
        }

        // load reaction number, and verify we passed the threshold of reactions
        await reaction.fetch()
        if (!reaction.count || reaction.count < guildConfig.needed_reactions) {
            logger.debug("threshold not passed");
            return false;
        };

        // resolve best-memes channel
        let bestMemesChannel = client.channels.resolve(guildConfig.best_memes_channel)!;
        if (!(bestMemesChannel instanceof TextChannel)) throw TypeError("best-memes channel is not a text channel");

        // at this point, we already mark the message as been sent, and put it in the already-sent best memes list
        // this is because else, if the event is sent twice very quickly, this function might be run a second time while
        // the 'await' after this comment are being resolved, and the message may be posted twice
        if (sentBestMemes.includes(reaction.message.id)) {
            LOGGER.debug("best-memes channel already had that meme (id cache)")
            return false;
        }
        sentBestMemes.push(reaction.message.id);
        // now that this is done, we can use 'await'
        // TODO no, check if the message was in the best-memes channel first (cache should be automatic ?)

        // retrieve message and get its links
        let message = reaction.message;
        message = await message.fetch();
        let links = getMessageLinks(message);
        // we can't post text because it would be difficult to check if it has already been posted
        if (links.length == 0) {
            LOGGER.debug("meme was text, we can't post that")
            message.reply("C'est cringe le texte, jpp poster ca")
        }

        // verify it hasn't already been sent by comparing links
        let bestMemes = await bestMemesChannel.messages.fetch({ limit: 100 }) // todo maybe do that in a ready event ?
        let bestMemesLinks = bestMemes.map(msg => getMessageLinks(msg)).flat();
        if (links.every(link => bestMemesLinks.includes(link))) {
            logger.debug("best-memes channel already had that meme (links check)")
            return false;
        }

        // send message
        let content = `Meme de ${message.author} (${message.url})\n${links.join(" ")}`;
        await bestMemesChannel.send(content);
        logger.info("Received reaction, and sent meme to best-memes");
        return true;
    }
}
