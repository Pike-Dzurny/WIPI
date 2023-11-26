import React, { FC } from 'react';

interface Step2Props {
  prevStep: () => void;
}

const Step2: FC<Step2Props> = ({ prevStep }) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission
    // If successful, call nextStep()
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="button" onClick={prevStep}>Back</button>
      <input type="submit" value="Next" />
    </form>
  );
};

export default Step2;