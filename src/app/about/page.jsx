"use client";

import CustomBanner from '@/components/CustomBanner';
import { useRouter } from 'next/navigation';
import React from 'react';

const About = () => {
  const router = useRouter();
    return (
        <div>
            <CustomBanner routeName={"About us"} />

            <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto py-8 px-6">
        <header className="mb-10">
          <h1 className="text-xl font-medium text-gray-800 mb-2">
            Welcome to Mehor – The Apparel Community That Connects Creators, Innovators, and Enthusiasts!
          </h1>
          <p className="text-gray-700 leading-relaxed">
            At Mehor, we believe that fashion is more than just clothing—it's an expression of creativity, culture, and individuality. Our platform is designed to bring together designers, manufacturers, retailers, fashion enthusiasts, and trendsetters in one vibrant community. Whether you're looking to share your latest designs, discuss industry trends, network with professionals, or find new business opportunities, Mehor is the place for you.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="text-xl font-medium text-gray-800 mb-3">
            Our Mission
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Our mission is to empower and unite individuals in the apparel industry by providing a dynamic space for collaboration, learning, and growth. We aim to foster innovation, inclusivity, and professional connections within the fashion world.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-medium text-gray-800 mb-3">
            What We Offer
          </h2>
          <p className="text-gray-700 mb-3">
            A Thriving Community – Engage with like-minded individuals, join discussions, and share your insights.
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex">
              <span className="mr-2">•</span>
              <div>
                <span className="font-medium">Interactive Forums & Groups</span> – Discuss fashion trends, industry challenges, and emerging styles
              </div>
            </li>
            <li className="flex">
              <span className="mr-2">•</span>
              <div>
                <span className="font-medium">Personalized Profiles & Timelines</span> – Showcase your work, post updates, and connect with others just like on social platforms
              </div>
            </li>
            <li className="flex">
              <span className="mr-2">•</span>
              <div>
                <span className="font-medium">Business & Collaboration Opportunities</span> – Network with professionals, find partnerships, and discover new trends.
              </div>
            </li>
            <li className="flex">
              <span className="mr-2">•</span>
              <div>
                <span className="font-medium">Exclusive Fashion Content</span> – Stay updated with the latest industry news, events, and expert insights.
              </div>
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-medium text-gray-800 mb-3">
            Join the Mehor Community
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Mehor is more than just a forum—it's a hub for innovation, creativity, and growth in the apparel sector. Whether you're an emerging designer, a seasoned professional, or a fashion enthusiast, you'll find a home here.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Be a part of the movement. Join Mehor today and shape the future of fashion together!
          </p>
        </section>
      </div>

      <div className='flex justify-center gap-5'>
          <h3 onClick={()=> router.push("terms-conditions")} className='font-medium text-base cursor-pointer'>Terms and Conditions</h3>
          |
          <h3 onClick={()=> router.push("privacy-policy")} className='font-medium text-base cursor-pointer'>Privacy Policy</h3>
        </div>

    </div>
        </div>
    );
};

export default About;