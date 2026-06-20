import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, KeyRound, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import FFButton from '../../shared/components/FFButton';
import FFCard from '../../shared/components/FFCard';
import FFErrorState from '../../shared/components/FFErrorState';
import FFPageHeader from '../../shared/components/FFPageHeader';
import FFSectionHeader from '../../shared/components/FFSectionHeader';
import FFShimmer from '../../shared/components/FFShimmer';
import { AuthRepository } from '../../core/repositories/AuthRepository';
import { useAuth } from '../../core/auth/AuthContext';

const countries = [
  { code: '+91', label: 'India' },
  { code: '+971', label: 'UAE' },
  { code: '+966', label: 'Saudi Arabia' },
  { code: '+1', label: 'United States' },
  { code: '+44', label: 'United Kingdom' },
];

const PhoneLoginScreen: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { handleAuthResponse } = useAuth();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (phoneNumber.length !== 10) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }

    if (!password.trim()) {
      setError('Enter your password to continue.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const authResponse = await AuthRepository.loginWithPassword(phoneNumber, countryCode, password);
      handleAuthResponse(authResponse);
      navigate('/', { replace: true });
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'Unable to sign in right now.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream page-enter">
      <FFPageHeader title="Welcome back" subtitle="Sign in with your phone and password" />

      <main className="mx-auto max-w-lg px-4 py-6 pb-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-4"
        >
          <FFCard variant="primary" className="space-y-3 p-6 text-white">
            <p className="font-display text-xl font-bold text-white">Family sign in</p>
            <p className="text-sm text-white/75">
              Secure access for parents, teachers, family admins, and platform admins.
            </p>
          </FFCard>

          <FFCard className="space-y-5 p-4 sm:p-5 lg:p-6">
            <FFSectionHeader icon={<Phone />} title="Phone sign in" />

            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label htmlFor="countryCode" className="block text-xs font-semibold text-gray-500">
                  Country
                </label>
                <select
                  id="countryCode"
                  value={countryCode}
                  onChange={(event) => setCountryCode(event.target.value)}
                  className="min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent"
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.label} ({country.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="block text-xs font-semibold text-gray-500">
                  Phone number
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  autoFocus
                  placeholder="98765 43210"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-xs font-semibold text-gray-500">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 py-3 pr-14 text-sm text-primary outline-none transition focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="touch-target absolute right-1 top-1/2 -translate-y-1/2 rounded-xl text-gray-500 transition hover:bg-primary/5 hover:text-primary"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <FFButton type="submit" className="w-full" isLoading={isLoading}>
                Sign in
              </FFButton>
            </form>

            {isLoading ? (
              <div className="space-y-3">
                <FFShimmer height="3rem" borderRadius="0.75rem" className="shimmer" />
                <FFShimmer height="5rem" borderRadius="1rem" className="shimmer" />
              </div>
            ) : null}

            {error ? (
              <FFErrorState
                title="Sign-in failed"
                message={error}
                onRetry={() => setError(null)}
              />
            ) : null}
          </FFCard>

          <FFCard variant="warm" className="space-y-4 p-4 sm:p-5 lg:p-6">
            <FFSectionHeader icon={<KeyRound />} title="Other sign-in options" />
            <p className="text-sm text-gray-500">
              Children and elders can continue with their PIN instead of a password.
            </p>
            <FFButton variant="outline" className="w-full" onClick={() => navigate('/child-login')}>
              Continue with PIN
            </FFButton>
          </FFCard>

          <div className="px-1 text-center text-xs text-gray-500">
            Use the phone number linked to your FamilyFirst account.
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PhoneLoginScreen;
