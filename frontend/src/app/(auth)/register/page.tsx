'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building2, ArrowRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().regex(/^\+?[\d\s\-()]{7,20}$/, 'Invalid phone number').optional().or(z.literal('')),
    hotelName: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch('password', '');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber || undefined,
        hotelName: data.hotelName || undefined,
      });
      const { user, accessToken } = response.data.data;
      login(user, accessToken);
      toast.success('Account created! Please verify your email.');
      setRegistered(true);
      setRegisteredEmail(data.email);
      router.push('/otp-verification?email=' + encodeURIComponent(data.email) + '&type=verification');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          <div className="text-center mb-8">
            <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="text-xl font-bold text-white">HotelManager</span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-gray-400">Start managing your hotel like a pro</p>
          </div>

          <div className="glass rounded-2xl p-8 border border-white/10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      {...register('fullName')}
                      placeholder="John Doe"
                      className="pl-10 bg-white/[0.02] border-white/10 text-white placeholder:text-gray-600"
                    />
                  </div>
                  {errors.fullName && <p className="text-red-400 text-xs mt-1">{String(errors.fullName.message)}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone (optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      {...register('phoneNumber')}
                      placeholder="+1 234 567 890"
                      className="pl-10 bg-white/[0.02] border-white/10 text-white placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 bg-white/[0.02] border-white/10 text-white placeholder:text-gray-600"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{String(errors.email.message)}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Hotel Name (optional)</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    {...register('hotelName')}
                    placeholder="Grand Hotel"
                    className="pl-10 bg-white/[0.02] border-white/10 text-white placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10 bg-white/[0.02] border-white/10 text-white placeholder:text-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{String(errors.password.message)}</p>}
                  <div className="mt-2 space-y-1">
                    {[
                      { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
                      { label: 'Uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
                      { label: 'Lowercase letter', test: (v: string) => /[a-z]/.test(v) },
                      { label: 'Number', test: (v: string) => /[0-9]/.test(v) },
                      { label: 'Special character', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
                    ].map((rule) => {
                      const passed = rule.test(passwordValue);
                      return (
                        <div key={rule.label} className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${passed ? 'bg-green-500' : 'bg-gray-600'}`} />
                          <span className={`text-xs ${passed ? 'text-green-400' : 'text-gray-500'}`}>{rule.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      {...register('confirmPassword')}
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-white/[0.02] border-white/10 text-white placeholder:text-gray-600"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">{String(errors.confirmPassword.message)}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('terms')}
                  className="w-4 h-4 rounded border-gray-600 bg-white/5 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-400">
                  I agree to the{' '}
                  <a href="#" className="text-indigo-400 hover:text-indigo-300">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-indigo-400 hover:text-indigo-300">
                    Privacy Policy
                  </a>
                </span>
              </div>
              {errors.terms && <p className="text-red-400 text-xs">{String(errors.terms.message)}</p>}

              <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>
          </div>

          <p className="text-center mt-6 text-gray-400 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-90" />
        <div className="relative flex flex-col justify-center px-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Join Thousands of Hoteliers
            </h2>
            <p className="text-indigo-100 text-lg leading-relaxed">
              Start your journey with the most powerful hotel management platform. Free 14-day trial, no credit card required.
            </p>
            <div className="mt-12 space-y-6">
              {[
                { stat: '10,000+', label: 'Hotels using our platform' },
                { stat: '2.5M+', label: 'Bookings processed' },
                { stat: '99.9%', label: 'Platform uptime' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center space-x-4"
                >
                  <span className="text-3xl font-bold text-white">{item.stat}</span>
                  <span className="text-indigo-200">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
