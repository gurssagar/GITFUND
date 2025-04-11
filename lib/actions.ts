'use server'

import { promises } from 'dns';
import {StreamChat} from 'stream-chat'

const serverClient = StreamChat.getInstance(
  process.env.STREAM_KEY!,
  process.env.STREAM_SECRET!,
);

export async function createToken(userId:"string"): Promise<string> {
    return serverClient.createToken('user-id') // replace with your user id from yo
}