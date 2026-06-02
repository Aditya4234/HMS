'use client';

import { useState, useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';

function OTPVerificationContent() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const type = searchParams.get('type') || 'password-reset';

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Email is required');
      return;
    }
    try {
      if (type === 'verification') {
        await authAPI.resendVerification({ email });
      } else {
        await authAPI.resendOTP({ email });
      }
      toast.success('Code resent to your email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete code');
      return;
    }

    setIsLoading(true);
    try {
      if (type === 'verification') {
        await authAPI.verifyEmail({ email, otp: otpString });
        toast.success('Email verified successfully!');
        router.push('/dashboard');
      } else {
        const response = await authAPI.verifyOTP({ email, otp: otpString });
        const { resetToken } = response.data.data;
        toast.success('Code verified!');
        router.push(`/reset-password?email=${encodeURIComponent(email)}&resetToken=${resetToken}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  const isVerification = type === 'verification';

  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isVerification ? 'Verify Your Email' : 'OTP Verification'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isVerification
                ? "Enter the 6-digit code sent to verify your email"
                : 'Enter the 6-digit code sent to'}
            </p>
            <p className="text-indigo-400 text-sm font-medium">{email || 'your email'}</p>
          </div>

          <div className="flex justify-center gap-3 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-bold bg-white/[0.02] border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            variant="gradient"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              isVerification ? 'Verify Email' : 'Verify OTP'
            )}
          </Button>

          <p className="text-center mt-4 text-gray-500 text-sm">
            Didn&apos;t receive the code?{' '}
            <button type="button" onClick={handleResend} className="text-indigo-400 hover:text-indigo-300">
              Resend
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function OTPVerificationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OTPVerificationContent />
    </Suspense>
  );
}