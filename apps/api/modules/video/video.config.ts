import { StreamChat } from 'stream-chat'

import 'dotenv/config'

const STREAM_API_KEY = process.env.STREAM_API_KEY || 'dummy_stream_api_key'
const STREAM_API_SECRET = process.env.STREAM_API_SECRET || 'dummy_stream_api_secret_1234567890_key'

export const streamVideoClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET)
export { STREAM_API_KEY }
