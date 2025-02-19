/* eslint-disable no-unused-vars */
import React from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";
import Navbar from "./Navbar/Navbar";
import Hero from "./Hero/Hero";

const MainLayout = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <Navbar />
      <Hero />
    </I18nextProvider>
  );
};

export default MainLayout;
