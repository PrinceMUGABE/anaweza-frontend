/* eslint-disable no-unused-vars */
import React from 'react';

const Contact = () => {
    const phoneNumbers = [
        { number: '+250788457408', display: '+250 788 457 408' },
        { number: '+250789990408', display: '+250 789 990 408' },
        { number: '+250786779262', display: '+250 786 779 262' }
    ];

    const emails = [
        'princemugabe568@gmail.com',
        'princemugabe567@gmail.com',
        'eddy123@gmail.com'
    ];

    const getEmailLink = (email) => {
        return `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;
    };

    return (
        <section id="contact" className="bg-gray-100 py-12 rounded-lg">
            <div className="container text-center">
                <h2 className='text-headingColor font-[700] text-[2.5rem] mb-8 text-black dark:text-black'>
                    Contact Us
                </h2>
                <div className='bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row md:justify-between text-left'>
                    <div className="md:w-1/2 md:mr-4">
                        <h3 className="text-xl font-semibold text-gray-800">Phone Numbers:</h3>
                        <ul className="mt-2 mb-4 text-lg text-gray-600">
                            {phoneNumbers.map((phone, index) => (
                                <li key={index} className="mt-1">
                                    <a href={`tel:${phone.number}`} className="text-blue-600 hover:underline">
                                        {phone.display}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:w-1/2 md:ml-4">
                        <h3 className="text-xl font-semibold text-gray-800">Email Addresses:</h3>
                        <ul className="mt-2 text-lg text-gray-600">
                            {emails.map((email, index) => (
                                <li key={index} className="mt-1">
                                    <a href={getEmailLink(email)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {email}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};


export default Contact;
