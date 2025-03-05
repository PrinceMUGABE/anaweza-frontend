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
import CookieConsent from "./components/policy/cookies.jsx"


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
import Employer_About_Us from "./components/pages/job_provider/pages/about_anaweza.jsx";
import Job_seeker_Profile from "./components/job seeker/pages/job_seeker_Profile.jsx";
import Job_Seeker_ContactUs from "./components/job seeker/ContactUs.jsx";
import Job_Seeker_About from "./components/job seeker/pages/AboutUs.jsx";
import Job_Seeker_FeaturedJobs from "./components/job seeker/All_Jobs.jsx";
import List_of_Jobs from "./components/jobs/All_Jobs.jsx";
import Admin_Job_Applications from "./components/pages/admin/Job_Applications.jsx";
import Job_Seeker_Job_Seekers from "./components/job seeker/Job_Seeker_Job_Seekers.jsx";
import Job_Seeker_Advertisements from "./components/job seeker/advertisements.jsx";
import All_Job_Seekers from "./components/jobSeekers/all_job_seeker.jsx";
import About from "./components/about/About.jsx";
import Policy from "./components/policy/policy.jsx";
import TermsAndConditions from "./components/policy/terms_and_condition.jsx";
import Admin_ManageTestimonials from "./components/pages/admin/manage_testimonies.jsx";
import Job_Seeker_ManageTestimonials from "./components/job seeker/manage_testimonies.jsx";
import Cookies from "./components/policy/Main_Cookies.jsx";
import Employer_ContactUs from "./components/pages/job_provider/pages/contact_us.jsx";
import Employer_Job_Seekers from "./components/pages/job_provider/pages/job_seekers.jsx";
import Employer_Profile from "./components/pages/job_provider/account/profile.jsx";
import Employer_Advertisements from "./components/pages/job_provider/pages/advertisements.jsx";
import Job_Offer_ManageTestimonials from "./components/pages/job_provider/my_testimonies.jsx";
import Employer_Manage_Jobs from "./components/pages/job_provider/pages/my_jobs.jsx";











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
          <Route path="/jobs" element={<List_of_Jobs />} />
          <Route path="/job_seekers" element={<All_Job_Seekers />} />
          <Route path="/about" element={<About />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/terms_and_conditions" element={<TermsAndConditions />} />
          <Route path="/cookies" element={<Cookies />} />
     

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
            <Route path="/admin/job_applications" element={<Admin_Job_Applications />} />
            <Route path="/admin/testimonials" element={<Admin_ManageTestimonials />} />
            <Route path="/admin/profile/:id" element={<AdminProfile />} />

          </Route>


          <Route path="/registerAsJobSeeker" element={<Register_as_jobSeeker />} />
          

          <Route path="/job_seeker" element={<JobSeeker_Layout />}>
             <Route index element={<Job_seeker_home />} />
             <Route path="/job_seeker/profile/:id" element={<Job_seeker_Profile />} />
             <Route path="/job_seeker/contact" element={<Job_Seeker_ContactUs />} />
             <Route path="/job_seeker/about" element={<Job_Seeker_About />} />
             <Route path="/job_seeker/jobs" element={<Job_Seeker_FeaturedJobs />} />
             <Route path="/job_seeker/job_seekers" element={<Job_Seeker_Job_Seekers />} />
             <Route path="/job_seeker/advertisements" element={<Job_Seeker_Advertisements />} />
             <Route path="/job_seeker/testimonials" element={<Job_Seeker_ManageTestimonials />} />


          </Route>



          <Route path="/employer" element={<Employer_Layout />}>
             <Route index element={<Employer_Home />} />
             <Route path="/employer/about" element={<Employer_About_Us />} />
             <Route path="/employer/contact" element={<Employer_ContactUs />} />
             <Route path="/employer/job_seekers" element={<Employer_Job_Seekers />} />
             <Route path="/employer/profile/:id" element={<Employer_Profile />} />

             <Route path="/employer/job_seekers" element={<Employer_Job_Seekers />} />
             <Route path="/employer/advertisements" element={<Employer_Advertisements />} />
             <Route path="/employer/testimonials" element={<Job_Offer_ManageTestimonials />} />
             <Route path="/employer/jobs" element={<Employer_Manage_Jobs />} />
             


          </Route>

        </Routes>
        <CookieConsent/>
      </BrowserRouter>
      
    </div>
  );
};

export default App;
