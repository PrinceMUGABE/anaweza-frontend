/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import AboutImg from '../../assets/pictures/system/logo.png';

function About() {
  // Array of images
  const images = [AboutImg];

  // State to keep track of the current image index
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // useEffect hook to change the image every 3 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // 3000 ms = 3 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <section id="about" className="py-10 bg-slate-100 dark:text-white">
      <div className="bg-gray-300 mt-2 py-2">
        <h2
          data-aos="fade-up"
          className="text-center text-4xl font-bold mb-10 text-black dark:text-black py-2"
        >
          About Us
        </h2>
      </div>

      <main className="container mx-auto flex flex-col items-center justify-center">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-4 md:p-8 bg-white rounded-lg shadow-lg">
          <div data-aos="fade-right">
            <img
              src={images[currentImageIndex]} // Display image based on the current index
              alt="Geospatial Analysis"
              className="w-full h-80 object-cover rounded-lg"
            />
          </div>
          <div data-aos="fade-left" className="flex flex-col gap-4">
            <div className="p-4 border-l-4 border-gray-700">
              <h3 className="text-2xl font-semibold mb-2 text-black">Who We Are</h3>
              <p className="text-sm dark:text-slate-800">
                HealthGeoTrack is a cutting-edge platform dedicated to improving healthcare outcomes 
                through advanced geospatial analysis. We provide real-time insights to optimize resource allocation, 
                monitor disease outbreaks, and improve healthcare access.
              </p>
            </div>
            <div className="p-4 border-l-4 border-gray-700">
              <h3 className="text-2xl font-semibold mb-2 text-black">Vision</h3>
              <p className="text-sm dark:text-slate-800">
                Our vision is to revolutionize healthcare planning and resource management through 
                geospatial intelligence, ensuring equitable healthcare delivery for populations across diverse geographic regions.
              </p>
            </div>
            <div className="p-4 border-l-4 border-gray-700">
              <h3 className="text-2xl font-semibold mb-2 text-black">Mission</h3>
              <p className="text-sm dark:text-slate-800">
                We are committed to delivering innovative geospatial analytics solutions that enable 
                healthcare organizations to make data-driven decisions, enhancing public health outcomes 
                and fostering a healthier, more connected society.
              </p>
            </div>
          </div>
        </section>
      </main>
    </section>
  );
}

export default About;
