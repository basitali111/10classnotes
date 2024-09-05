"use client";
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link'; // Import Link to navigate to the Sign-Up page

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn('credentials', { email, password, redirect: false });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="mb-4 text-2xl font-bold">Sign In</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-4">
          <label className="block">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="p-2 text-white bg-blue-500 rounded">
          Sign In
        </button>
      </form>
      {/* Add a link to the Sign-Up page */}
      <p>
        Don't have an account?{' '}
        <Link href="/auth/signup" className="text-blue-500 underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
