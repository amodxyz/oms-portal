import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Chatbot from './Chatbot';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {children}
      </main>
      <Chatbot />
    </div>
  );
}
