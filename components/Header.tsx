
import React from 'react';
import { PhotoIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center">
        <PhotoIcon className="w-8 h-8 text-indigo-400 mr-3" />
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          AI Photo Restorer
        </h1>
      </div>
    </header>
  );
};

export default Header;
