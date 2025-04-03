import CustomBanner from '@/components/CustomBanner';
import React from 'react';

const page = () => {
    return (
        <div>
            <CustomBanner routeName={"Privacy Policy"} />
            <div className=" max-w-5xl mx-auto">
      <div className="bg-white p-8 rounded">
        <p className="text-sm text-gray-600 mb-4">
          At Didactic, we are committed to protecting your privacy and ensuring you have a positive experience on our website. The Privacy Policy outlines how we collect, use, and protect your information.
        </p>

        <h2 className="font-bold text-lg mb-2">Information We Collect</h2>
        <p className="text-sm mb-2">We collect both personal and non-personal information when you use our services:</p>
        <ul className="list-disc pl-8 text-sm mb-4">
          <li className="mb-1"><span className="font-semibold">Personal Identification Information:</span> This includes your name, email address, phone number, and billing information.</li>
          <li className="mb-1"><span className="font-semibold">Non-Personal Information:</span> This includes information about your device, browsing history, and usage of our website, such as IP addresses and browser type.</li>
        </ul>

        <h2 className="font-bold text-lg mb-2">How We Use Your Information</h2>
        <p className="text-sm mb-2">We use the collected information for the following purposes:</p>
        <ul className="list-disc pl-8 text-sm mb-4">
          <li className="mb-1"><span className="font-semibold">Provide and Improve Services:</span></li>
          <ul className="list-disc pl-8 text-sm mb-1">
            <li>To deliver the features and functionality of Notedible, including user creation, gift collection, and payment processing.</li>
          </ul>
          <li className="mb-1"><span className="font-semibold">Account Management:</span></li>
          <ul className="list-disc pl-8 text-sm mb-1">
            <li>To create and manage your user account, track your activity, and provide customer support.</li>
          </ul>
          <li className="mb-1"><span className="font-semibold">Communication:</span></li>
          <ul className="list-disc pl-8 text-sm mb-1">
            <li>To send you important updates, notifications about your account, and promotional offers (you can opt out of promotional emails at any time).</li>
          </ul>
          <li className="mb-1"><span className="font-semibold">Security:</span></li>
          <ul className="list-disc pl-8 text-sm mb-1">
            <li>To protect the security of your account and our website, and to prevent fraud or unauthorized access.</li>
          </ul>
          <li className="mb-1"><span className="font-semibold">Analytics:</span></li>
          <ul className="list-disc pl-8 text-sm mb-1">
            <li>To analyze user behavior and trends, optimize our services, and improve your overall experience.</li>
          </ul>
        </ul>

        <h2 className="font-bold text-lg mb-2">Data Sharing</h2>
        <p className="text-sm mb-2">We respect your privacy and do not sell, rent, or trade your personal data. However, we may share your information with trusted third parties for the following purposes:</p>
        <ul className="list-disc pl-8 text-sm mb-4">
          <li className="mb-1"><span className="font-semibold">Service Providers:</span> These include payment processors, shipping carriers, and customer support tools that help us deliver our services.</li>
          <li className="mb-1"><span className="font-semibold">Legal Obligations:</span> If required by law in response to legal processes, or to protect your rights or ours.</li>
          <li className="mb-1"><span className="font-semibold">Business Transfers:</span> In the case of a merger, acquisition, or sale of all or parts of our data may be transferred.</li>
        </ul>

        <h2 className="font-bold text-lg mb-2">Data Security</h2>
        <p className="text-sm mb-4">We implement industry-standard security measures to protect your data. However, no system can be 100% secure, and we cannot guarantee the absolute security of your personal information. We urge you to take appropriate measures to protect your information as well.</p>

        <h2 className="font-bold text-lg mb-2">Your Rights</h2>
        <p className="text-sm mb-2">You have the right to:</p>
        <ul className="list-disc pl-8 text-sm mb-4">
          <li className="mb-1"><span className="font-semibold">Access:</span> Request information about the data we collect about you.</li>
          <li className="mb-1"><span className="font-semibold">Correction:</span> Request updates to incorrect or incomplete data.</li>
          <li className="mb-1"><span className="font-semibold">Deletion:</span> Request deletion of your account or personal information.</li>
          <li className="mb-1"><span className="font-semibold">Opt-Out:</span> You can opt-out of receiving promotional emails by following the unsubscribe instructions.</li>
        </ul>

        <h2 className="font-bold text-lg mb-2">Cookies</h2>
        <p className="text-sm mb-2">We use cookies to enhance your experience on our site. These small files help us:</p>
        <ul className="list-disc pl-8 text-sm mb-4">
          <li className="mb-1">Remember your preferences and settings.</li>
          <li className="mb-1">Analyze website traffic and user behavior.</li>
          <li className="mb-1">Provide personalized content and offers.</li>
        </ul>
        <p className="text-sm mb-4">You can control cookies through your browser settings, but disabling cookies may limit certain features of the site.</p>

        <h2 className="font-bold text-lg mb-2">Changes to This Privacy Policy</h2>
        <p className="text-sm mb-4">From time to time, we may update this Privacy Policy. Any changes will be reflected on this page with a revised "Effective Date." Please review this policy periodically to stay informed on how we protect your information.</p>

        <h2 className="font-bold text-lg mb-2">Contact Us</h2>
        <p className="text-sm mb-4">If you have any questions or concerns about our Privacy Policy, please contact us at:<br />
        Email: support@fictionalapp.com<br />
        Phone: 1-800-123-4567<br />
        Address: 123 Fashion Street, New York, NY, 10001</p>
      </div>
    </div>
        </div>
    );
};

export default page;