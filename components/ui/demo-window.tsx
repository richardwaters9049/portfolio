import React from 'react'

const Demowindow = () => {
  return (
    <div className="space-y-4 p-4">
      <div className='w-full h-full flex flex-col items-center justify-center bg-blue-100 p-6 rounded-lg'>
        <h1 className='text-2xl font-bold mb-2'>Modules</h1>
        <p className='text-sm text-gray-600'>This is a module component.</p>
        <p className='text-sm text-gray-600'>You can customize this component as needed.</p>
        <button className='mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors'>
          Click Me
        </button>
        <p className='mt-2 text-sm text-gray-500'>This button does nothing for now.</p>
      </div>

      <div className='mt-6'>
        <h2 className='text-xl font-semibold mb-2'>Additional Information</h2>
        <p className='text-sm text-gray-600'>You can add more content here to provide additional information about the module.</p>
      </div>
    </div>
  );
};

export default Demowindow;
