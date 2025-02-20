/* eslint-disable no-unused-vars */
import React from 'react';

const BlogSection = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Top 10 In-Demand Skills for 2025",
      excerpt: "Discover the most sought-after skills that employers are looking for in today's job market.",
      image: "/api/placeholder/400/250",
      category: "Career Tips",
      date: "Feb 15, 2025"
    },
    {
      id: 2,
      title: "How to Ace Your Remote Job Interview",
      excerpt: "Expert tips and strategies for succeeding in virtual interviews and landing your dream remote job.",
      image: "/api/placeholder/400/250",
      category: "Interview Tips",
      date: "Feb 12, 2025"
    },
    {
      id: 3,
      title: "Building a Professional Online Presence",
      excerpt: "Learn how to create and maintain a strong professional profile that attracts employers.",
      image: "/api/placeholder/400/250",
      category: "Personal Branding",
      date: "Feb 10, 2025"
    }
  ];

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-blue-800">Career Resources</h2>
          <button className="text-blue-600 hover:text-blue-700">View All Articles →</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div key={post.id} className="rounded-lg overflow-hidden shadow-lg">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm text-blue-600">{post.category}</span>
                  <span className="text-sm text-gray-500">{post.date}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <button className="text-blue-600 hover:text-blue-700">
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogSection;