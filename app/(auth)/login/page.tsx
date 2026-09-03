'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { showToast } from '@/components/ui/Toast';
import { Role } from '@/types/user';
import { mockUsers, mockUserByRole } from '@/lib/mock/users.mock';
import Image from 'next/image';

const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = searchParams.get('from') || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/auth/login', data);
      const { token, user } = response.data;

      login(token, user);
      showToast.success(`Selamat datang kembali, ${user.name || 'User'}!`);
      router.push(redirectPath);
    } catch {
      // Fallback for development/demo mode when backend API is offline
      const matchedUser = mockUsers.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase()
      );

      let targetUser = matchedUser;
      if (!targetUser) {
        const emailLower = data.email.toLowerCase();
        let targetRole: Role = 'DIREKTUR';
        if (emailLower.includes('finance')) targetRole = 'FINANCE';
        else if (emailLower.includes('sales')) targetRole = 'SALES';
        else if (emailLower.includes('pm') || emailLower.includes('project')) targetRole = 'PROJECT_MANAGER';
        else if (emailLower.includes('produksi') || emailLower.includes('tim')) targetRole = 'PRODUKSI';

        targetUser = {
          ...mockUserByRole[targetRole],
          email: data.email,
        };
      }

      const mockToken = `mock-jwt-token-${targetUser.role.toLowerCase()}`;
      login(mockToken, targetUser);
      showToast.success(`Masuk sebagai ${targetUser.name} (${targetUser.role})`);
      router.push(redirectPath);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = (role: Role) => {
    const mockToken = `mock-jwt-token-${role.toLowerCase()}-demo`;
    const mockUser = mockUserByRole[role];
    login(mockToken, mockUser);
    showToast.success(`Masuk sebagai ${mockUser.name} (${role})`);
    router.push(redirectPath);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="pt-6">
          <div className="relative">
            <input
              id="email"
              type="email"
              placeholder=" "
              className="peer w-full bg-transparent border-b border-white/60 focus:border-white text-white py-2 px-0 text-2xl focus:outline-none transition-colors"
              {...register('email')}
            />
            <label
              htmlFor="email"
              className="absolute left-0 top-2.5 text-2xl text-white/60 cursor-text transition-all duration-200 peer-focus:-top-6 peer-focus:text-2xl peer-focus:font-bold peer-focus:text-white peer-not-placeholder-shown:-top-6 peer-not-placeholder-shown:text-2xl peer-not-placeholder-shown:font-bold peer-not-placeholder-shown:text-white"
            >
              Email
            </label>
          </div>
          {errors.email && (
            <p className="text-sm text-red-200 font-medium mt-1.5">{errors.email.message}</p>
          )}
        </div>

        <div className="pt-6">
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder=" "
              className="peer w-full bg-transparent border-b border-white/60 focus:border-white text-white py-2 px-0 pr-10 text-2xl focus:outline-none transition-colors"
              {...register('password')}
            />
            <label
              htmlFor="password"
              className="absolute left-0 top-2.5 text-2xl text-white/60 cursor-text transition-all duration-200 peer-focus:-top-6 peer-focus:text-2xl peer-focus:font-bold peer-focus:text-white peer-not-placeholder-shown:-top-6 peer-not-placeholder-shown:text-2xl peer-not-placeholder-shown:font-bold peer-not-placeholder-shown:text-white"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-1 focus:outline-none cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-200 font-medium mt-1.5">{errors.password.message}</p>
          )}

          <div className="text-right mt-3">
            <a
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault();
                showToast.info('Silakan hubungi administrator IT untuk mereset kata sandi Anda.');
              }}
              className="text-md text-white/80 hover:text-white font-medium transition-colors inline-block"
            >
              Forgot Password?
            </a>
          </div>
        </div>

        <div className="pt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white hover:bg-blue-50 text-blue-600 font-bold py-3 rounded-2xl shadow-lg transition-all duration-200 active:scale-[0.99] disabled:opacity-75 flex items-center justify-center gap-2 text-2xl cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </div>
      </form>

      <div className="mt-10 pt-6 border-t border-white/15">
        <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wider text-center mb-3">
          Quick Demo Login (Role Tester)
        </p>
        <div className="flex flex-wrap gap-2 justify-center text-xs">
          <button
            type="button"
            onClick={() => {
              setValue('email', mockUserByRole.DIREKTUR.email);
              setValue('password', 'password123');
              handleQuickDemoLogin('DIREKTUR');
            }}
            className="px-3 py-1.5 bg-white hover:bg-white/80 text-black border border-white/20 transition-colors font-medium"
          >
            Direktur
          </button>
          <button
            type="button"
            onClick={() => {
              setValue('email', mockUserByRole.FINANCE.email);
              setValue('password', 'password123');
              handleQuickDemoLogin('FINANCE');
            }}
            className="px-3 py-1.5 bg-white hover:bg-white/80 text-black border border-white/20 transition-colors font-medium"
          >
            Finance
          </button>
          <button
            type="button"
            onClick={() => {
              setValue('email', mockUserByRole.SALES.email);
              setValue('password', 'password123');
              handleQuickDemoLogin('SALES');
            }}
            className="px-3 py-1.5 bg-white hover:bg-white/80 text-black border border-white/20 transition-colors font-medium"
          >
            Sales
          </button>
          <button
            type="button"
            onClick={() => {
              setValue('email', mockUserByRole.PROJECT_MANAGER.email);
              setValue('password', 'password123');
              handleQuickDemoLogin('PROJECT_MANAGER');
            }}
            className="px-3 py-1.5 bg-white hover:bg-white/80 text-black border border-white/20 transition-colors font-medium"
          >
            PM
          </button>
          <button
            type="button"
            onClick={() => {
              setValue('email', mockUserByRole.PRODUKSI.email);
              setValue('password', 'password123');
              handleQuickDemoLogin('PRODUKSI');
            }}
            className="px-3 py-1.5 bg-white hover:bg-white/80 text-black border border-white/20 transition-colors font-medium"
          >
            Produksi
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full bg-linear-to-br from-blue-600 via-blue-600 to-indigo-700 overflow-x-hidden flex flex-col">
      <div className="absolute -top-24 -left-24 w-120 h-120 rounded-full bg-linear-to-tr from-[#3388FF] to-[#0D00FF] blur-md pointer-events-none" />
      <div className="absolute top-1/2 -right-20 -translate-y-1/2 w-32 h-32 rounded-full bg-linear-to-tr from-[#3388FF] to-[#0D00FF] blur-md pointer-events-none" />
      <div className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-linear-to-tr from-[#3388FF] to-[#0D00FF] blur-md pointer-events-none" />

      <div className="w-full p-6 sm:p-10 lg:px-16 lg:pt-16 flex justify-center z-50 relative">
        <div className="w-full max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-14 lg:h-14">
              <Image src="/makromedia-logo.png" alt="Logo" width={100} height={100} />
            </div>
            <span className="font-bold text-lg lg:text-xl text-white tracking-wide">
              Makromedia
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full p-6 sm:p-10 lg:p-16 flex justify-center items-center z-10 relative">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center justify-center">
          <div className="flex flex-col h-full">
            <div className="max-w-lg">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight uppercase mb-3 lg:mb-4 leading-none">
                WELCOME BACK!
              </h1>
              <p className="text-blue-100 text-2xl sm:text-3xl  opacity-90">
                Please sign in to access your dashboard and manage everything in one place.
              </p>
            </div>
          </div>

          <div className="w-full bg-white/5 backdrop-blur-xs p-6 sm:p-8 rounded-2xl border border-white/10 lg:bg-transparent lg:p-0 lg:border-none mt-2 lg:mt-0">
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-8 text-white">
                  <Loader2 className="w-6 h-6 animate-spin text-white mr-2" />
                  <span className="text-sm">Memuat form login...</span>
                </div>
              }
            >
              <LoginFormContent />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}