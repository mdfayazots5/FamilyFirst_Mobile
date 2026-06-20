import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import FFButton from '../../shared/components/FFButton';
import FFCard from '../../shared/components/FFCard';
import FFErrorState from '../../shared/components/FFErrorState';
import FFPageHeader from '../../shared/components/FFPageHeader';
import FFSectionHeader from '../../shared/components/FFSectionHeader';
import FFShimmer from '../../shared/components/FFShimmer';
import { AuthRepository } from '../../core/repositories/AuthRepository';
import { useAuth } from '../../core/auth/AuthContext';

type OtpLocationState = {
  phoneNumber?: string;
  countryCode?: string;
  otpToken?: string;
};

const OtpVerifyScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleAuthResponse } = useAuth();
  const { phoneNumber, countryCode = '+91', otpToken } = (location.state as OtpLocationState) ?? {};
  const otpTokenRef = useRef(otpToken ?? '');
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!phoneNumber || !otpTokenRef.current) {
      navigate('/login', { replace: true });
    }
  }, [navigate, phoneNumber]);

  const handleChange = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, '').slice(-1);
    if (value && !nextValue) {
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = nextValue;
    setOtp(nextOtp);
    setError(null);

    if (nextValue && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (nextOtp.every(Boolean)) {
      void handleVerify(nextOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code: string) => {
    if (!phoneNumber || !otpTokenRef.current || code.length !== 6) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthRepository.verifyOtp(phoneNumber, otpTokenRef.current, code);
      handleAuthResponse(response);
      navigate('/', { replace: true });
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'Enter the latest code and try again.';
      setError(message);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phoneNumber) {
      return;
    }

    setIsResending(true);
    setError(null);
    setResendMessage(null);

    try {
      const response = await AuthRepository.sendOtp(phoneNumber, countryCode);
      otpTokenRef.current = response.otpToken;
      setOtp(['', '', '', '', '', '']);
      setResendMessage('A fresh code has been sent to your phone.');
      inputRefs.current[0]?.focus();
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'We could not resend the code right now.';
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream page-enter">
      <FFPageHeader
        title="Verify phone"
        subtitle={phoneNumber ? `${countryCode} ${phoneNumber}` : 'Enter your 6-digit code'}
        showBack
        onBack={() => navigate('/login')}
      />

      <main className="mx-auto max-w-lg px-4 py-6 pb-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-4"
        >
          <FFCard variant="primary" className="space-y-3 p-6 text-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-ff bg-white/12">
              <ShieldCheck className="h-7 w-7 text-accent" />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-white">One more step</p>
              <p className="mt-1 text-sm text-white/75">
                Enter the 6-digit code sent to your phone to finish signing in.
              </p>
            </div>
          </FFCard>

          <FFCard className="space-y-5 p-4 sm:p-5 lg:p-6">
            <FFSectionHeader icon={<CheckCircle2 />} title="Enter your code" />

            <div className="grid grid-cols-6 gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  autoFocus={index === 0}
                  value={digit}
                  onChange={(event) => handleChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  className="min-h-12 rounded-xl border border-black/10 bg-white text-center text-lg font-bold text-primary outline-none transition focus:border-accent sm:text-xl"
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>

            <FFButton
              className="w-full"
              onClick={() => handleVerify(otp.join(''))}
              disabled={otp.some((digit) => !digit)}
              isLoading={isLoading}
            >
              Verify code
            </FFButton>

            {(isLoading || isResending) && (
              <div className="space-y-3">
                <FFShimmer height="3rem" borderRadius="0.75rem" className="shimmer" />
                <FFShimmer height="4rem" borderRadius="1rem" className="shimmer" />
              </div>
            )}

            {error ? (
              <FFErrorState
                title="Verification failed"
                message={error}
                onRetry={() => setError(null)}
              />
            ) : null}

            {!error && resendMessage ? (
              <div className="rounded-ff-sm border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
                {resendMessage}
              </div>
            ) : null}
          </FFCard>

          <FFCard variant="warm" className="space-y-4 p-4 sm:p-5 lg:p-6">
            <FFSectionHeader icon={<RefreshCw />} title="Need another code" />
            <p className="text-sm text-gray-500">
              If the message has not arrived yet, you can request a fresh code.
            </p>
            <FFButton variant="outline" className="w-full" onClick={handleResend} isLoading={isResending}>
              Resend code
            </FFButton>
          </FFCard>
        </motion.div>
      </main>
    </div>
  );
};

export default OtpVerifyScreen;
