import React from 'react';

const LoadingSpinner = ({ color = '#4F46E5', size = '50px' }) => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div
        style={{
          borderTopColor: color,
          width: size,
          height: size,
        }}
        className="border-4 border-gray-200 rounded-full animate-spin"
      ></div>
    </div>
  );
};

export default LoadingSpinner;
