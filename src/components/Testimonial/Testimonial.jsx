/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "James Mwangi",
      role: "Software Developer",
      company: "Tech Solutions Ltd",
      image: "/api/placeholder/80/80",
      quote: "Through Anaweza, I found my dream job within weeks. The platform made it easy to showcase my skills and connect with top employers.",
    },
    {
      id: 2,
      name: "Mary Njeri",
      role: "HR Manager",
      company: "BuildRight Construction",
      image: "/api/placeholder/80/80",
      quote: "As an employer, Anaweza has transformed our recruitment process. We've found excellent candidates who perfectly match our requirements.",
    },
    {
      id: 3,
      name: "Peter Ochieng",
      role: "Account Manager",
      company: "Financial Solutions",
      image: "/api/placeholder/80/80",
      quote: "The platform's professional network helped me transition to a better role. The job matching system is incredibly accurate.",
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-black">Success Stories</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hear from professionals who found success through Anaweza
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full"
                />
                <div className="ml-4">
                  <h3 className="font-semibold text-lg text-gray-950">{testimonial.name}</h3>
                  <p className="text-gray-600">{testimonial.role}</p>
                  <p className="text-gray-500 text-sm">{testimonial.company}</p>
                </div>
              </div>
              <blockquote className="text-gray-600 italic">
                "{testimonial.quote}"
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;