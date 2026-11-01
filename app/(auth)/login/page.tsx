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

// Quick login & mock auth aktif saat development (bisa dimatikan dengan NEXT_PUBLIC_ENABLE_MOCK_AUTH=0).
const MOCK_AUTH_ENABLED =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH !== '0';

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
      const { accessToken, user } = response.data;

      login(accessToken, user);
      showToast.success(`Selamat datang kembali, ${user.name || 'User'}!`);
      router.push(redirectPath);
    } catch {
      // Fallback login mock — HANYA saat development & flag aktif.
      if (!MOCK_AUTH_ENABLED) {
        showToast.error('Email atau password salah, atau server tidak dapat dihubungi.');
        return;
      }
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

  const handleQuickDemoLogin = async (role: Role) => {
    setIsSubmitting(true);
    const demoEmail = `${role === 'PROJECT_MANAGER' ? 'pm' : role.toLowerCase()}@makromedia.id`;
    const demoPassword = 'Password123!';
    setValue('email', demoEmail);
    setValue('password', demoPassword);

    try {
      const response = await apiClient.post('/auth/login', {
        email: demoEmail,
        password: demoPassword,
      });
      const { accessToken, user } = response.data;
      login(accessToken, user);
      showToast.success(`Selamat datang kembali, ${user.name || role}!`);
      router.push(redirectPath);
    } catch {
      // Fallback ke mock jika backend offline atau kena rate-limit
      const mockToken = `mock-jwt-token-${role.toLowerCase()}-demo`;
      const mockUser = {
        ...mockUserByRole[role],
        email: demoEmail,
      };
      login(mockToken, mockUser);
      showToast.success(`Masuk sebagai ${mockUser.name} (${role})`);
      router.push(redirectPath);
    } finally {
      setIsSubmitting(false);
    }
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
              Email Address
            </label>
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-200">{errors.email.message}</p>
          )}
        </div>

        <div className="pt-6">
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder=" "
              className="peer w-full bg-transparent border-b border-white/60 focus:border-white text-white py-2 px-0 text-2xl focus:outline-none transition-colors pr-10"
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
              className="absolute right-0 top-2 text-white/70 hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-6 h-6" />
              ) : (
                <Eye className="w-6 h-6" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-200">{errors.password.message}</p>
          )}
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

      {MOCK_AUTH_ENABLED && (
        <div className="mt-10 pt-6 border-t border-white/15">
          <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wider text-center mb-3">
            Quick Demo Login (Role Tester)
          </p>
          <div className="flex flex-wrap gap-2 justify-center text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('DIREKTUR')}
              className="px-3 py-1.5 bg-white hover:bg-white/80 text-black border border-white/20 transition-colors font-medium rounded-lg cursor-pointer"
            >
              Direktur
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('FINANCE')}
              className="px-3 py-1.5 bg-white hover:bg-white/80 text-black border border-white/20 transition-colors font-medium rounded-lg cursor-pointer"
            >
              Finance
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('SALES')}
              className="px-3 py-1.5 bg-white hover:bg-white/80 text-black border border-white/20 transition-colors font-medium rounded-lg cursor-pointer"
            >
              Sales
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('PROJECT_MANAGER')}
              className="px-3 py-1.5 bg-white hover:bg-white/80 text-black border border-white/20 transition-colors font-medium rounded-lg cursor-pointer"
            >
              PM
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('PRODUKSI')}
              className="px-3 py-1.5 bg-white hover:bg-white/80 text-black border border-white/20 transition-colors font-medium rounded-lg cursor-pointer"
            >
              Produksi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full bg-linear-to-br from-blue-600 via-blue-600 to-indigo-700 overflow-x-hidden flex flex-col">
      <div className="absolute -top-24 -left-24 w-120 h-120 rounded-full bg-linear-to-tr from-[#3388FF] to-[#0D00FF] blur-md pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-140 h-140 rounded-full bg-linear-to-br from-[#1A5CFF] to-[#002699] blur-md pointer-events-none" />

      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mb-3 flex items-center justify-center">
            <Image
              src="/makromedia-logo1.png"
              alt="Logo Makromedia Visual"
              width={80}
              height={80}
              priority
              className="object-contain"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-1 drop-shadow-xs">
            CV. Makromedia Visual
          </h1>
          <p className="text-blue-100 text-sm sm:text-base text-center mb-6">
            Sign In to your account
          </p>

          <Suspense
            fallback={
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            }
          >
            <LoginFormContent />
          </Suspense>
        </div>
      </main>

      <footer className="relative z-10 py-4 text-center text-xs text-blue-200/80">
        &copy; {new Date().getFullYear()} CV. Makromedia Visual. All rights
        reserved.
      </footer>
    </div>
  );
}
