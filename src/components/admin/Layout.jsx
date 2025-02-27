/* eslint-disable no-unused-vars */
import React from 'react';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import WhatsAppButton from '../whatsapp';

function Layout() {
  const whatsappNumber = "+250788457408"; 
  return (
    <div className="bg-gray-100 min-h-screen">
     {/* <Header /> */}
     <Sidebar />

      <main className="max-w-7xl mx-auto p-4 mr-4">
        <Outlet />
      </main>

      {/* WhatsApp Button */}
      <WhatsAppButton phoneNumber={whatsappNumber} />
    </div>

    
  );
}

export default Layout;