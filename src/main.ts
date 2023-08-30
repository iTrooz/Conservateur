import registerEvents from './events'
import { loadConfig } from './config'
import { startBot } from './bot'

export const CONFIG = loadConfig()

export const CLIENT = startBot(CONFIG.token)

// register events
registerEvents(CLIENT)
