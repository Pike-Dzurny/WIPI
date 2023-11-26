import React, { FC, ChangeEvent } from 'react';

interface Step2Props {
  nextStep: () => void;
  prevStep: () => void;
}

const Step2: FC<Step2Props> = ({ nextStep, prevStep }) => {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Handle file change
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission
    // If successful, call nextStep()
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Step 2</h2>
    </div>
    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="image1" className="block text-sm font-medium leading-6 text-gray-900">Image 1</label>
          <div className="mt-2 border-2 border-dashed border-gray-500 p-4">
            <input id="image1" name="image1" type="file" onChange={handleFileChange} required className="focus:outline-none p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-sky-300 sm:text-sm sm:leading-6" />
          </div>
        </div>
        <div>
          <label htmlFor="image2" className="block text-sm font-medium leading-6 text-gray-900">Image 2</label>
          <div className="mt-2 border-2 border-dashed border-gray-500 p-4">
            <input id="image2" name="image2" type="file" onChange={handleFileChange} required className="focus:outline-none p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-sky-300 sm:text-sm sm:leading-6" />
          </div>
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium leading-6 text-gray-900">Bio</label>
          <div className="mt-2">
            <textarea id="bio" name="bio" required className="focus:outline-none p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-sky-300 sm:text-sm sm:leading-6"></textarea>
          </div>
        </div>
        <div className="flex space-x-4">
          <button type="button" onClick={prevStep} className="focus:outline-none flex-1 justify-center rounded-md bg-gray-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600">Back</button>
          <input type="submit" value="Next" className="focus:outline-none flex-1 justify-center rounded-md bg-sky-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600" />
        </div>
      </form>
    </div>
  </div>
        
  );
};

export default Step2;