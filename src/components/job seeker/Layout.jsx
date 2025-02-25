/* eslint-disable no-unused-vars */
import React from 'react';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function JobSeeker_Layout() {
  return (
    <div className="bg-gray-100 min-h-screen">
     <Header />


      <main className="max-w-7xl mx-auto ">
        <Outlet />
      </main>
    </div>
  );
}

export default JobSeeker_Layout;