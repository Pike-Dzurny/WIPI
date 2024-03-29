/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback, FC } from 'react';
import { handleSignUp } from '../../api/auth/[...nextauth]/handleSignUp';
import debounce from 'lodash.debounce';
import { signIn }  from 'next-auth/react';
import Link from 'next/link';







export default function Signup() {
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
          console.log(`Username: ${username}, Password: ${password}, userId: ${success.userId}`)
          const userId = success.userId;
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
        <div>
          <div className="rounded-lg shadow p-6 max-w-md mx-auto bg-white">
            <div className="flex min-h-full flex-col justify-center px-6 py-2 lg:px-8">
              <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Sign up for an account</h2>
              </div>
              <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email</label>
              <input id="email" name="email" type="email" required className="mt-2 p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:outline-none ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6" />
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
            <button type="submit" className='relative w-full'>
              <div className="absolute w-full p-2 inset-0 rounded-md bg-green-300 blur-sm group-hover:bg-green-500 group-hover:blur trasnition duration-1000 group-hover:duration-300"></div>
              <div className={`relative w-full p-2 text-white text-center rounded-md Sign_Up_Button`}>Sign Up</div>
            </button>
            </div>

            </form>
        
              <p className="mt-10 text-center text-sm text-gray-500">{message}</p>
              </div>
              

        </div>
        
      </div>
      <div className="mt-2 shadow p-5 border-gray-300 rounded-md bg-white flex flex-col items-center w-full">
      <p className="mb-4">Already have an account?</p>
      <Link href="/signin" className='w-full px-6 lg:px-8'>
          <div className='relative w-full'>
            <div className={`absolute w-full mb-4  p-2 inset-0 rounded-md bg-blue-300 hover:bg-blue-800 blur-sm hover:blur-xl trasnition duration-1000 hover:duration-300`}></div>
            <button type="submit" className={`w-full relative mb-4 p-2 text-white rounded-md Sign_In_Button--activated`}>Sign In</button>
          </div>
      </Link>
  </div>
</div>        
      );
  };

