/* eslint-disable no-unused-vars */
import React from "react";

const Blog = () => {
  return (
    <div id="blog" className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
        About <span className="text-blue-600">Anaweza</span>
      </h1>
      
      {/* Mission Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Our Mission</h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Our mission is to bridge the gap between **job seekers** and **employers** by providing
          a seamless platform for showcasing skills, experiences, and opportunities. We strive to
          create an ecosystem where talent meets opportunity effortlessly.
        </p>
      </section>
      
      {/* Vision Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Our Vision</h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          To be the leading job-matching platform that empowers individuals by helping them
          connect with employers, enhance their professional growth, and contribute to a thriving workforce.
        </p>
      </section>

      {/* How It Works Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">How Anaweza Works</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-blue-100 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-blue-800 mb-2">For Job Seekers</h3>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Create a profile showcasing skills, education, and experience.</li>
              <li>Apply for job postings that match your qualifications.</li>
              <li>Get contacted directly by employers looking for talent.</li>
            </ul>
          </div>

          <div className="bg-green-100 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-green-800 mb-2">For Employers</h3>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Search for available job seekers based on skills and experience.</li>
              <li>Post job descriptions and receive applications.</li>
              <li>Directly connect with potential employees.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to Get Started?</h3>
        <p className="text-lg text-gray-600 mb-6">
          Join Anaweza today and take the next step in your career or find the right talent for your organization.
        </p>
        <a
          href="/register"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-800 transition duration-300"
        >
          Join Now
        </a>
      </div>
    </div>
  );
};

export default Blog;