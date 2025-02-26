// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";



// Imports
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout.jsx";
import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register.jsx";
import VerifyPassword from "./components/auth/VerifyPassword.jsx";
import ResetPassword from "./components/auth/ResetPassword.jsx";
import ChangePassword from "./components/auth/ChangePassword.jsx";
import Blog from "./components/blog/Blog.jsx";


// Admin imports
import Layout from "./components/admin/Layout.jsx";
import Users from "./components/pages/admin/Users.jsx";
import CreateUser from "./components/pages/admin/CreateNewUser.jsx";
import EditUsers from "./components/pages/admin/EditUsers.jsx";
import AdminHome from "./components/pages/admin/Home.jsx"



import AdminProfile from "./components/pages/admin/AdminProfile.jsx";
import Register_as_jobSeeker from "./components/job seeker/Register_as_jobSeeker.jsx";
import JobSeeker_Layout from "./components/job seeker/Layout.jsx";
import Job_seeker_home from "./components/job seeker/pages/Home.jsx";
import Manage_Job_categories from "./components/pages/admin/Manage_Job_cetegories.jsx";
import Admin_Manage_Jobs from "./components/pages/admin/ManageJobOffers.jsx";
import Admin_Manage_JobSeekers from "./components/pages/admin/ManageJobSeekers.jsx";
import Admin_ManageAdvertisements from "./components/pages/admin/manage_advertisements.jsx";
import Employer_Layout from "./components/pages/job_provider/account/Layout.jsx";
import Employer_Home from "./components/pages/job_provider/pages/Home.jsx";









const App = () => {
  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in",
      delay: 100,
    });

    AOS.refresh();
  }, []);

  return (
    <div className="bg-white dark:bg-black dark:text-white text-black overflow-x-hidden">
      <BrowserRouter>
        <Routes>
          {/* Home view */}
          <Route path="/" element={<MainLayout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/verifypassword" element={<VerifyPassword />} />
          <Route path="/passwordreset" element={<ResetPassword />} />
          <Route path="/changePassword" element={<ChangePassword />} />
          <Route path="/blog" element={<Blog />} />

          {/* End Home view */}

          {/* Admin */}

          <Route path="/admin" element={<Layout />}>
            <Route index element={<AdminHome />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/edituser/:id" element={<EditUsers />} />
            <Route path="/admin/createUser/" element={<CreateUser />} />
            <Route path="/admin/job_categories" element={<Manage_Job_categories />} />
            <Route path="/admin/job_offers" element={<Admin_Manage_Jobs />} />
            <Route path="/admin/job_seekers" element={<Admin_Manage_JobSeekers />} />
            <Route path="/admin/advertisements" element={<Admin_ManageAdvertisements />} />

            <Route path="/admin/profile/:id" element={<AdminProfile />} />

          </Route>


          <Route path="/registerAsJobSeeker" element={<Register_as_jobSeeker />} />

          <Route path="/job_seeker" element={<JobSeeker_Layout />}>
             <Route index element={<Job_seeker_home />} />


          </Route>



          <Route path="/employer" element={<Employer_Layout />}>
             <Route index element={<Employer_Home />} />


          </Route>

        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
