import { Client, GatewayIntentBits, Partials } from 'discord.js'

export function startBot(token: string): Client {
    console.log('Bot is starting...')

    const client = new Client({
        intents: [
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.Guilds,
        ],
        partials: [
            Partials.User,
            Partials.GuildScheduledEvent,
            Partials.GuildMember,
            Partials.ThreadMember,
            Partials.Channel,
            Partials.Message,
            Partials.Reaction
        ]
    })

    client.login(token)

    client.on('ready', async () => {
        if (client.user && client.application) {
            console.log(`Bot connected ! Name: ${client.user.username}`)
        } else {
            throw "Bot didn't start up properly"
        }
    })

    return client
}
