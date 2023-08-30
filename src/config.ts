export interface GuildConfig {
    memes_channel: string
    best_memes_channel: string
    needed_reactions: number
    emoji: string
}

export interface Config {
    token: string
    servers: { [k: string]: GuildConfig }
}

export function loadConfig(): Config {
    const config: Config = require('../config.json')
    return config
}
