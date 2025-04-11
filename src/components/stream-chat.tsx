'use client'
import { useCreateChatClient, Chat } from 'stream-chat-react';
import { useCallback } from 'react';
import { createToken } from '../../lib/actions';

interface ChatProps {
    userdata: {
        id: string;
        name: string;
        image: string;
    }
}

export default function StreamChat({ userdata }: ChatProps) {
    const tokenProvider = useCallback(async () => {
        return await createToken(userdata.id);
    }, [userdata.id]);

    const client = useCreateChatClient({
        apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
        tokenOrProvider: tokenProvider,
        userData: userdata
    });

    if (!client) return <div>Loading chat...</div>;

    return (
        <div className="h-full w-full">
            <Chat client={client}>
                {/* Add your Channel and other Stream components here */}
                Stream chat
            </Chat>
        </div>
    );
}