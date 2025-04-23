'use client'

import { useEffect, useState } from 'react';
import Peer from 'peerjs';
import { useSession } from 'next-auth/react';

export default function ChatPage() {
  const session = useSession();
  const [peer, setPeer] = useState<Peer>();
  const [peerId, setPeerId] = useState('');
  const [targetPeerId, setTargetPeerId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('');

  useEffect(() => {
    if ((session?.data?.user as any)?.username) {
      // Create a valid peer ID by removing special characters and using only alphanumeric
      const sanitizedEmail = (session?.data?.user as any).username.replace(/[^a-zA-Z0-9]/g, '');
      const uniquePeerId = `${sanitizedEmail}`;
      
      const newPeer = new Peer(uniquePeerId, {
        host: '0.peerjs.com',
        secure: true,
        port: 443,
        debug: 3
      });
      
      newPeer.on('open', (id) => {
        setPeerId(id);
        setConnectionStatus('Connected to PeerJS server');
        console.log('My peer ID is:', id);
      });

      newPeer.on('error', (error) => {
        console.error('PeerJS error:', error);
        setConnectionStatus(`Error: ${error.type}`);
      });

      newPeer.on('connection', (conn) => {
        handleConnection(conn);
      });

      setPeer(newPeer);

      return () => {
        newPeer.destroy();
      };
    }
  }, [session?.data?.user?.email]);
  console.log(targetPeerId,"yoo")
  const [contributors, setContributors] = useState<any>([]);

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const response = await fetch('/api/requestIssue', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data) {
          console.log(data.assignments); // Log the response data t
          setContributors(data.assignments);
        }
      } catch (error) {
        console.error('Error fetching contributors:', error);
      }
    };
    fetchContributors();
  }, []);
  console.log(contributors,)
  const handleConnection = (conn: any) => {
    conn.on('open', () => {
      conn.on('data', (data: any) => {
        setMessages(prev => [...prev, `Received: ${data}`]);
      });
    });

    conn.on('error', (error: any) => {
      console.error('Connection error:', error);
      setConnectionStatus(`Connection error: ${error}`);
    });
  };

  const connectToPeer = () => {
    if (peer && targetPeerId) {
      const conn = peer.connect(targetPeerId);
      handleConnection(conn);
      setConnectionStatus('Connecting to peer...');
    }
  };

  const sendMessage = () => {
    if (peer && targetPeerId && message) {
      const conn = peer.connect(targetPeerId);
      conn.on('open', () => {
        conn.send(message);
        setMessages(prev => [...prev, `Sent: ${message}`]);
        setMessage('');
      });
    }
  };

  return (
  <div className="flex h-screen">
    {/* Sidebar with contributors */}
    <div className="w-1/4 p-4 overflow-y-auto" >
      <h2 className="text-xl font-bold mb-4">Contributors</h2>
      <div className="space-y-3">
        {contributors.map((contributor: any, index: number) => (
          <div 
            key={index} 
            className="flex items-center p-2 hover:bg-gray-900 rounded cursor-pointer"
            onClick={() => setTargetPeerId(contributor.Contributor_id)}
          >
            <img 
              src={contributor.image_url} 
              alt={contributor.username}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <p className="font-medium">{contributor.name}</p>
              <p className="text-sm text-gray-600">{contributor.role || 'Contributor'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Main chat area */}
    <div className="flex-1 p-4">
      <div className="mb-4">
        <p>Your Peer ID: {peerId}</p>
        <p className="text-sm text-gray-600">{connectionStatus}</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={targetPeerId}
          onChange={(e) => setTargetPeerId(e.target.value)}
          placeholder="Enter peer ID to connect"
          className="border p-2 mr-2"
        />
        <button
          onClick={connectToPeer}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Connect
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
          className="border p-2 mr-2"
        />
        <button
          onClick={sendMessage}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>

      <div className="border p-4 h-64 overflow-y-auto">
        {messages.map((msg, index) => (
          <p key={index} className="mb-2">{msg}</p>
        ))}
      </div>
    </div>
  </div>
);
}