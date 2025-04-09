/* eslint-disable no-unused-vars */
import React from 'react';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import WhatsAppButton from '../../../whatsapp';

function Employer_Layout() {
  const whatsappNumber = "+250796087267";
  return (
    
    <div className="bg-gray-100 min-h-screen">
     <Header />


      <main className="max-w-7xl mx-auto ">
        <Outlet />
      </main>

      {/* WhatsApp Button */}
      <WhatsAppButton phoneNumber={whatsappNumber} />
    </div>
  );
}

export default Employer_Layout;