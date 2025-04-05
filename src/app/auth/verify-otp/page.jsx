"use client";
import { notification } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const otpInputRefs = useRef([]);

  const router = useRouter();

  // Handle OTP input change
  const handleChange = (e, index) => {
    const value = e.target.value;
    
    // Only allow digits
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');

      // Auto focus to next input
      if (value && index < 5 && otpInputRefs.current[index + 1]) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').slice(0, 6);
    if (/^\d+$/.test(pasteData)) {
      const newOtp = [...otp];
      for (let i = 0; i < pasteData.length; i++) {
        newOtp[i] = pasteData[i];
      }
      setOtp(newOtp);
    }
  };

  // Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && otpInputRefs.current[index - 1]) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Validate OTP
  const validateOtp = () => {
    if (otp.some(digit => !digit)) {
      setError('Please enter the complete OTP');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateOtp()) {
      setIsSubmitting(true);
      
      try {
        // Simulate API verification
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // On successful verification
        notification.success({
          message: 'Verified Successfully',
          description: 'Your OTP has been verified',
        });
        
        // Redirect to reset password page or dashboard
        router.push('/auth/reset-password');
      } catch (err) {
        notification.error({
          message: 'Verification Failed',
          description: 'Invalid OTP. Please try again.',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle resend OTP
  const handleResendOtp = () => {
    // Reset timer
    setTimer(60);
    setIsResendDisabled(true);
    
    // Simulate API call to resend OTP
    notification.info({
      message: 'OTP Resent',
      description: 'A new OTP has been sent to your email',
    });
  };

  // Countdown timer for resend OTP
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isResendDisabled]);

  return (
    <div className="">
      <div className="flex h-screen justify-center">
        {/* Left Section with Background Image */}
        <div className="hidden md:flex md:w-1/2 justify-center relative">
          <Image 
            src="/images/login.png" 
            alt="People smiling" 
            layout="fill" 
            objectFit="cover"
          />
        </div>

        {/* Right Section with OTP Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md bg-white rounded-lg p-8 shadow-sm">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold">Verify OTP</h2>
              <p className="text-gray-600 mt-1">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-6">
                <div className="flex justify-center space-x-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => otpInputRefs.current[index] = el}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={handlePaste}
                      className={`w-12 h-12 text-center text-xl border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                Didn't receive code?{' '}
                <button
                  onClick={handleResendOtp}
                  disabled={isResendDisabled}
                  className={`font-medium ${isResendDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-500'}`}
                >
                  {isResendDisabled ? `Resend in ${timer}s` : 'Resend OTP'}
                </button>
              </p>
            </div>

            <div className="text-center mt-6 text-sm text-gray-600">
              <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;