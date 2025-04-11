import {StreamChat} from 'stream-chat'

const apiKey=process.env.NEXT_PUBLIC_STREAM_API_KEY
const apiSecret=process.env.STREAM_SECRET
const userId="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" // replace with your user id from y
 
export async function GET() {
    const serverClient = StreamChat.getInstance(
      apiKey!,
      apiSecret!,
    );
    const token = serverClient.createToken(userId);
    console.log(token)
    return Response.json(
      {message:'hello world'}  
    )
}