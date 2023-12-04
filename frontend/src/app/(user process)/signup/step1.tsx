/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback, FC } from 'react';
import { handleSignUp } from '../../api/auth/[...nextauth]/handleSignUp';
import debounce from 'lodash.debounce';
import { signIn }  from 'next-auth/react';
import Link from 'next/link';




interface Step1Props {
  nextStep: () => void;
}


const Step1: FC<Step1Props> = ({ nextStep }) => {
    const [message, setMessage] = useState('');

    const [password, setPassword] = useState('');
    const [isInputEmpty, setIsInputEmpty] = useState(true);
    const [isLengthValid, setIsLengthValid] = useState(false);
    const [isSpecialCharValid, setIsSpecialCharValid] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isInputTouched, setIsInputTouched] = useState(false);

    const [username, setUsername] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState(true);
    const [isUsernameInputEmpty, setIsUsernameEmpty] = useState(true);
    const [isChecking, setIsChecking] = useState(false); // New state variable

    const [currentStep, setCurrentStep] = useState(1);





    
    const checkUsernameAvailability = useCallback(debounce(async (username) => {
      // Call your API to check if the username is available
      console.log('Checking username availability...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/check-username?username=${username}`);
      console.log('Response:', response);
      const data = await response.json();
    
      setUsernameAvailable(data.available);
      setIsChecking(false); // Set isChecking back to false when the check is complete
    }, 1000), []);
    
    useEffect(() => {
      setIsUsernameEmpty(username.length === 0);
      if (username.length > 0) {
        setIsChecking(true); // Set isChecking to true whenever the username changes
        checkUsernameAvailability(username);
      }
    }, [username, checkUsernameAvailability]);

    const [passwordError, setPasswordError] = useState('');

    
    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const password = event.target.value;
      setIsInputEmpty(password.length === 0);
      setIsLengthValid(password.length >= 8);
      setIsSpecialCharValid(/[\W]/.test(password));
      if(password.length > 0) {
      setIsInputTouched(true);
      }
      else{
      setIsInputTouched(false);
      }
    };
  
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget as HTMLFormElement);
      const email = String(formData.get('email'));
      const username = String(formData.get('username'));
      const password = String(formData.get('password'));


      // Simple validation for email
      const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
      if (!emailRegex.test(email)) {
        setMessage('Invalid email address');
        return;
      }
      
    
      // Check the password requirements
      let errors = [];
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/[\W]/.test(password)) {
        errors.push('Password must contain a special character');
      }
    
      if (errors.length > 0) {
        setPasswordError(errors.join('\n'));
        setIsLengthValid(false);
        setIsSpecialCharValid(false);
      } else {
        // If there are no errors, proceed with the sign-up process
        setPasswordError('');
        setIsLengthValid(true);
        setIsSpecialCharValid(true);
    
        const success = await handleSignUp(
          username,
          password,
          email,
        );
    
        setMessage(success.message ? 'Sign-up was successful' : 'Sign-up failed');
        if(success.message){
          console.log(success);
          console.log(`Username: ${username}, Password: ${password}`)
          signIn('credentials', {
            callbackUrl: '/',
            redirect: true,
            username: username,
            password: password
          });
        }
        else{
          console.log(success);
        }
      }
    };
  
      return (
        <>
        <div className="rounded-lg shadow p-6 max-w-md mx-auto bg-white">
          <div className="flex min-h-full flex-col justify-center px-6 py-2 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Sign up for an account</h2>
            </div>
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <input id="email" name="email" type="email" required className="input-field w-full p-2 border-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-400 rounded-md" />
            <label htmlFor="email" className="label absolute left-2 top-2.5 transition-all duration-200 text-gray-400">Email address</label>
          </div>
              
          <div className="relative">
          <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">Username</label>
          <div className="mt-2 relative">
            <input 
              id="username" 
              name="username" 
              type="text"
              autoCorrect="off" 
              required
              autoComplete="current-password" 
              className={`p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${isUsernameInputEmpty ? 'ring-gray-300' : (isChecking ? 'ring-yellow-500' : (usernameAvailable ? 'ring-green-500' : 'ring-red-500'))} focus:outline-none placeholder:text-gray-400 sm:text-sm sm:leading-6`} 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
            />
            {!usernameAvailable && !isUsernameInputEmpty && !isChecking && <p className="text-red-500 text-sm mt-2">Username taken</p>}
          </div>
        </div>



          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password</label>
            <div className="mt-2 relative">
            <input
                id="password"
                name="password"
                autoCorrect="off"
                type={isPasswordVisible ? "text" : "password"}
                required
                className={`focus:outline-none p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 pr-24 ${isLengthValid && isSpecialCharValid ? 'ring-green-500 focus:ring-green-500' : (isInputTouched ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-gray-300')}`}
                onChange={handlePasswordChange}
              />
              
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                {!isInputEmpty && (
                  <svg onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)} className={`h-5 w-5 ${isLengthValid && isSpecialCharValid ? 'text-green-500' : 'text-red-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isLengthValid && isSpecialCharValid ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                  </svg>
                )}
                <span onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="text-sm text-gray-500 cursor-pointer">
                  {isPasswordVisible ? "Hide" : "Show"}
                </span>
              </div>
                {showTooltip && (
                  <div className="absolute right-0 transform translate-x-full mt-2 p-2 bg-white rounded shadow-lg text-sm">
                    <p>Requirements:</p>
                    <ul>
                      <li className={isLengthValid ? 'text-green-500' : 'text-red-500'}>
                        <svg className="inline h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isLengthValid ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                        </svg>
                        At least 8 characters
                      </li>
                      <li className={isSpecialCharValid ? 'text-green-500' : 'text-red-500'}>
                        <svg className="inline h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSpecialCharValid ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                        </svg>
                        Includes a special character
                      </li>
                    </ul>
                  </div>
                )}
            </div>
            {passwordError && <ul className="text-red-500 text-sm mt-1">{passwordError.split('\n').map((error, index) => <li key={index}><i>{error}</i></li>)}</ul>}
            
             </div>



          <div>
            <input type="submit" value="Sign Up" className="focus:outline-none flex w-full justify-center rounded-md bg-sky-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600" />
          </div>
            </form>
      
            <p className="mt-10 text-center text-sm text-gray-500">{message}</p>
            </div>
            

      </div>
      
    </div>
    <div className="mt-2 shadow p-5 border-gray-300 rounded-md bg-white flex flex-col items-center w-full">
    <p className="mb-4">Already have an account?</p>
    <Link href="/signin" className='w-full px-6 lg:px-8'>
        <div className="w-full p-2 bg-green-500 text-white text-center rounded-md">Sign In</div>
    </Link>
</div>
  </>
        
      );
  };

export default Step1;