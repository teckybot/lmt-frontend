// components/LoadingContext.js
import React, { createContext, useContext, useState } from 'react';
import { FiLoader } from 'react-icons/fi';

const LoadingContext = createContext();

export const useLoading = () => {
  return useContext(LoadingContext);
};

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  const value = {
    loading,
    showLoading,
    hideLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg">
            <FiLoader className="animate-spin text-3xl text-blue-500 mb-2" />
            <p className="text-gray-600">Loading pls wait ...</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};