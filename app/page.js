"use client";
import { useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Chat from '../components/Chat';

export default function Home() {
  useEffect(() => {
    // Send email notification each time the user visits the website
    sendEmailNotification();
  }, []);

  const sendEmailNotification = async () => {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'allahbadshah148@gmail.com', // Replace with the recipient's email
          subject: 'User Visit Notification',
          message: 'A user has visited the website.',
        }),
      });
      console.log('User visit notification sent');
    } catch (error) {
      console.error('Failed to send visit notification:', error);
    }
  };

  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side for chat */}
      <div className="flex flex-col items-center justify-start w-1/4 min-h-screen p-2 bg-gray-100 border-r">
        {!session ? (
          <div className="flex flex-col items-center justify-center w-full">
            <p className="text-sm text-gray-700">Sign in to chat</p>
            <button
              onClick={() => signIn()}
              className="p-2 mt-2 text-sm text-white bg-blue-500 rounded"
            >
              Sign In
            </button>
          </div>
        ) : (
          <>
            <h2 className="mb-2 text-sm font-bold">Room: {session.roomId}</h2>
            <Chat roomId={session.roomId} />
          </>
        )}
      </div>

      {/* Right side for article/content */}
      <div className="w-3/4 min-h-screen p-4">
        <h2 className="mb-4 text-lg font-semibold">Latest Article</h2>
        <p className="text-sm">
          Here is some article content. You can display any content on this side,
          while the chat happens in a small section on the left. This is where 
          you can place any blog posts, news, or other types of content for your visitors.
        </p>
      </div>
    </div>
  );
}
