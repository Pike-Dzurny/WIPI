"use client";

import { useState } from 'react';

// Import your step components
import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';

export default function Signup() {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {
    //setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div>
    {currentStep === 1 && <Step1 nextStep={nextStep} />}
    {//currentStep === 2 && <Step2 nextStep={nextStep} prevStep={prevStep} />
    }
    {//currentStep === 3 && <Step3 prevStep={prevStep} />
    }
 {//   <div className="w-full bg-gray-200 rounded-full h-1.5 ">
  //    <div className="bg-sky-600 h-2.5 rounded-full transition-all duration-500" style={{width: `${(currentStep / 3) * 100}%`}}></div>
   // </div>
  }
  </div>
  );
}