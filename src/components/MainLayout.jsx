/* eslint-disable no-unused-vars */
import React from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";
import Navbar from "./Navbar/Navbar";
import Hero from "./Hero/Hero";
import Manage_Jobs from "./pages/jobs/Manage_All_Jobs";
import Blog from "./blog/Blog";
import Testimonials from "./Testimonial/Testimonial";
import FeaturedJobs from "./featuredJobs/FeaturedJobs";
import SearchBar from "./searchBar/SearchBar";
import FeaturedSeekers from "./jobSeekers/JobSeekers";
import HowItWorks from "./howItWorks/HowItWorks";
import CTASection from "./ctaSectio/CTASection";
import NewsletterSignup from "./newsLetter/NewsLetter";
import Footer from "./Footer/Footer";
import Advertisements from "./advertisement/advertisements"
import Cards from "./cards/cards";

const MainLayout = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <Navbar />
      <Advertisements />
      <SearchBar />
      {/* <Hero /> */}
      <Cards />
  
      <FeaturedJobs/>
      <FeaturedSeekers />
      <HowItWorks />
      <Testimonials />
      <CTASection />
      {/* <Blog /> */}
      <NewsletterSignup />
      <Footer />
    </I18nextProvider>
  );
};

export default MainLayout;
