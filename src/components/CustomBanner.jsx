import React from 'react';

const CustomBanner = ({routeName}) => {
    return (
        <div className="w-full bg-blue-50 py-6">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          {routeName}
        </h1>
        <div className="flex justify-center items-center space-x-2 text-gray-600">
          <a href="/" className="hover:text-gray-900">Home</a>
          <span>&gt;</span>
          <span className="text-gray-800">{routeName}</span>
        </div>
      </div>
    </div>
    );
};

export default CustomBanner;