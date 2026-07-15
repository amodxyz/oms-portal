import React, { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Chatbot from './Chatbot';

export default function Layout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-white rounded-md shadow-md text-gray-800"
        >
          {isSidebarOpen ? '✖' : '☰'}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 min-h-screen pt-16 lg:pt-8 w-full overflow-x-hidden">
        {children}
      </main>
      <Chatbot />
    </div>
  );
}
