import CustomBanner from '@/components/CustomBanner';
import React from 'react';

const page = () => {
    return (
        <div>
            <CustomBanner routeName={"Terms & Conditions"} />
            <div className="max-w-5xl mx-auto">
      <div className="bg-white p-8 rounded ">
        <p className="text-sm text-gray-600 mb-4">
          At Didaylor, we are committed to protecting your privacy and ensuring you have a positive experience on our website. The Privacy Policy outlines how we collect, use, and protect your information.
        </p>

        <h2 className="font-bold text-lg mb-3">Information We Collect</h2>
        <p className="text-sm mb-2">We collect both personal and non-personal information when you use our services:</p>
        <ul className="mb-6">
          <li className="flex mb-1">
            <span className="text-sm">• </span>
            <p className="text-sm ml-1"><span className="font-semibold">Personal Identification Information:</span> This includes your name, email address, phone number, and billing information.</p>
          </li>
          <li className="flex mb-1">
            <span className="text-sm">• </span>
            <p className="text-sm ml-1"><span className="font-semibold">Non-Personal Information:</span> This includes information about your device, browsing history, and usage of our website, such as IP addresses and browser types.</p>
          </li>
        </ul>

        <h2 className="font-bold text-lg mb-3">How We Use Your Information</h2>
        <p className="text-sm mb-2">We use the information we collect for the following purposes:</p>
        <ul className="mb-6">
          <li className="flex mb-1">
            <span className="text-sm">• </span>
            <div className="text-sm ml-1">
              <p className="font-semibold">Provide and Improve Services:</p>
              <p className="ml-4">To deliver the features and functionality of BuzzySite, including card creation, gift collection, and payment processing.</p>
            </div>
          </li>
          <li className="flex mb-1">
            <span className="text-sm">• </span>
            <div className="text-sm ml-1">
              <p className="font-semibold">Account Management:</p>
              <p className="ml-4">To create and manage your user account, track your activity, and provide customer support.</p>
            </div>
          </li>
          <li className="flex mb-1">
            <span className="text-sm">• </span>
            <div className="text-sm ml-1">
              <p className="font-semibold">Communication:</p>
              <p className="ml-4">To send you important updates, notifications about your account, and promotional offers (you can opt out of promotional emails at any time).</p>
            </div>
          </li>
          <li className="flex mb-1">
            <span className="text-sm">• </span>
            <div className="text-sm ml-1">
              <p className="font-semibold">Security:</p>
              <p className="ml-4">To protect the security of your account and our website, and to prevent fraud or unauthorized access.</p>
            </div>
          </li>
          <li className="flex mb-1">
            <span className="text-sm">• </span>
            <div className="text-sm ml-1">
              <p className="font-semibold">Analytics:</p>
              <p className="ml-4">To analyze user behavior and trends, optimize our services, and improve your overall experience.</p>
            </div>
          </li>
        </ul>

        <h2 className="font-bold text-lg mb-3">Data Sharing</h2>
        <p className="text-sm mb-2">We respect your privacy and do not sell, rent, or trade your personal data. However, we may share your information with trusted third parties for the following purposes:</p>
        <ul className="mb-6">
          <li className="flex mb-1">
            <span className="text-sm">• </span>
            <p className="text-sm ml-1"><span className="font-semibold">Service Providers:</span> These include payment processors, shipping carriers, and customer support tools that help us deliver our services.</p>
          </li>
          <li className="flex mb-1">
            <span className="text-sm">• </span>
            <p className="text-sm ml-1"><span className="font-semibold">Legal Obligations:</span> If required by law or in response to legal processes, we may disclose your information.</p>
          </li>
          <li className="flex mb-1">
            <span className="text-sm">• </span>
            <p className="text-sm ml-1"><span className="font-semibold">Business Transfers:</span> In the case of a merger, acquisition, or sale of assets, your data may be transferred.</p>
          </li>
        </ul>

        <h2 className="font-bold text-lg mb-3">Data Security</h2>
        <p className="text-sm mb-6">We implement industry-standard security measures to protect your data. However, no system can be 100% secure, and we cannot guarantee the absolute security of your personal information. We urge you to take appropriate measures to protect your information as well.</p>

        <h2 className="font-bold text-lg mb-3">Your Rights</h2>
        <p className="text-sm mb-2">You have the right to:</p>
        <ul className="mb-6">
          <li className="flex mb-1">
            <span className="text-sm">• </span>
            <p className="text-sm ml-1"><span className="font-semibold">Access:</span> Request a copy of the personal information we hold about you.</p>
          </li>
          <li className="flex mb-1">
            <span className="text-sm">• </span>
            <p className="text-sm ml-1"><span className="font-semibold">Correction:</span> Request updates to incorrect or incomplete data.</p>
          </li>
          <li className="flex mb-1">
            <span className="text-sm">• </span>
            <p className="text-sm ml-1"><span className="font-semibold">Deletion:</span> Request deletion of your account or personal information.</p>
          </li>
          <li className="flex mb-1">
            <span className="text-sm">• </span>
            <p className="text-sm ml-1"><span className="font-semibold">Opt-Out:</span> You can opt-out of receiving promotional emails by following the unsubscribe instructions.</p>
          </li>
        </ul>

        <h2 className="font-bold text-lg mb-3">Cookies</h2>
        <p className="text-sm mb-2">We use cookies to enhance your experience on our site. These small files help us:</p>
        <ul className="mb-4">
          <li className="flex mb-1">
            <span className="text-sm">• </span>
            <p className="text-sm ml-1">Remember your preferences and login details.</p>
          </li>
          <li className="flex mb-1">
            <span className="text-sm">• </span>
            <p className="text-sm ml-1">Analyze website traffic and user behavior.</p>
          </li>
          <li className="flex mb-1">
            <span className="text-sm">• </span>
            <p className="text-sm ml-1">Provide personalized content and offers.</p>
          </li>
        </ul>
        <p className="text-sm mb-6">You can control cookies through your browser settings, but disabling cookies may limit certain features of the site.</p>

        <h2 className="font-bold text-lg mb-3">Changes to This Privacy Policy</h2>
        <p className="text-sm mb-6">From time to time, we may update this Privacy Policy. Any changes will be reflected on this page with a revised "Effective Date." Please review this policy periodically to stay informed about how we protect your information.</p>

        <h2 className="font-bold text-lg mb-3">Contact Us</h2>
        <p className="text-sm">If you have any questions or concerns about our Privacy Policy, please contact us at:</p>
        <p className="text-sm">Email: support@didaylorapp.com</p>
        <p className="text-sm">Phone: 1-800-123-4567</p>
        <p className="text-sm">Address: 123 Fashion Street, New York, NY, 10001</p>
      </div>
    </div>
        </div>
    );
};

export default page;