/* eslint-disable no-unused-vars */
import React from 'react';
import { useTranslation } from "react-i18next";

const Contact = () => {
    const phoneNumbers = [
        
        { number: '+250788457408', display: '+250 788 457 408' },
        { number: '+250795570541', display: '+250 795 570 541' },
        { number: '+250783251199', display: '+250 783 251 199' },
        { number: '+250725169154', display: '+250 725 196 154' }

    ];

    const emails = [
        'ltdanaweza@gmail.com',
        'princemugabe567@gmail.com'

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
