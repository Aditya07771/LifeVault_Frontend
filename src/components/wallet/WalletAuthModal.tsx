import React, { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  Wallet,
  Shield,
  Check,
  Loader2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface WalletAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'link';
}

type Step = 'connect' | 'sign' | 'success' | 'error';

export const WalletAuthModal: React.FC<WalletAuthModalProps> = ({
  isOpen,
  onClose,
  mode,
}) => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const {
    connected,
    connecting,
    account,
    isPetraInstalled,
    connect,
    authenticateWithWallet,
    linkWalletToAccount,
  } = useWallet();

  const [step, setStep] = useState<Step>('connect');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(connected ? 'sign' : 'connect');
      setError(null);
      setLoading(false);
    }
  }, [isOpen, connected]);

  // Update step when connection status changes
  useEffect(() => {
    if (connected && step === 'connect') {
      setStep('sign');
    }
  }, [connected, step]);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setError(null);
    try {
      await connect('Petra' as any);
      setStep('sign');
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const handleSign = async () => {
    setLoading(true);
    setError(null);

    try {
      let result;

      if (mode === 'login') {
        result = await authenticateWithWallet();
      } else {
        result = await linkWalletToAccount();
      }

      if (result.success) {
        setStep('success');

        // Update user context if linking
        if (mode === 'link' && account?.address) {
          updateUser({ aptosAddress: account.address });
        }

        // Redirect after success
        setTimeout(() => {
          onClose();
          if (mode === 'login') {
            navigate('/dashboard');
          }
        }, 1500);
      } else {
        setError(result.error || 'Authentication failed');
        setStep('error');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setStep(connected ? 'sign' : 'connect');
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-black">
                {mode === 'login' ? 'Sign in with Wallet' : 'Link Your Wallet'}
              </h2>
              <p className="text-sm text-black/50">
                {mode === 'login' ? 'Use Petra wallet to authenticate' : 'Connect Petra to your account'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === 'connect'
                  ? 'bg-black text-white'
                  : ['sign', 'success'].includes(step)
                  ? 'bg-green-500 text-white'
                  : 'bg-black/10 text-black/50'
              }`}
            >
              {['sign', 'success'].includes(step) ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <div className={`w-16 h-0.5 ${['sign', 'success'].includes(step) ? 'bg-green-500' : 'bg-black/10'}`} />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === 'sign'
                  ? 'bg-black text-white'
                  : step === 'success'
                  ? 'bg-green-500 text-white'
                  : 'bg-black/10 text-black/50'
              }`}
            >
              {step === 'success' ? <Check className="w-4 h-4" /> : '2'}
            </div>
          </div>

          {/* Not Installed */}
          {!isPetraInstalled && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Petra Wallet Required</h3>
              <p className="text-black/50 mb-6">Please install Petra wallet to continue</p>
              <a
                href="https://petra.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-black/80"
              >
                Install Petra Wallet
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Step: Connect */}
          {isPetraInstalled && step === 'connect' && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-black/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-black/50 mb-6">Click below to connect your Petra wallet</p>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-black/80 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect Petra
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step: Sign */}
          {isPetraInstalled && step === 'sign' && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Sign Message</h3>
              {account?.address && (
                <p className="text-sm text-black/50 mb-2">
                  Connected: <span className="font-mono">{truncateAddress(account.address)}</span>
                </p>
              )}
              <p className="text-black/50 mb-6">
                Sign a message to verify ownership. This won't cost any gas.
              </p>
              <button
                onClick={handleSign}
                disabled={loading}
                className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-black/80 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Waiting for signature...
                  </>
                ) : (
                  <>
                    Sign Message
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-green-600">
                {mode === 'login' ? 'Successfully Authenticated!' : 'Wallet Linked Successfully!'}
              </h3>
              <p className="text-black/50">
                {mode === 'login' ? 'Redirecting to your dashboard...' : 'Your wallet is now connected'}
              </p>
            </div>
          )}

          {/* Step: Error */}
          {step === 'error' && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-red-600">Authentication Failed</h3>
              <p className="text-black/50 mb-6">{error || 'Something went wrong. Please try again.'}</p>
              <button
                onClick={handleRetry}
                className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-black/80"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Inline error */}
          {error && step !== 'error' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-black/30 mt-0.5" />
              <div>
                <p className="text-xs text-black/50">
                  <strong className="text-black/70">Secure & Gas-Free</strong>
                  <br />
                  Signing only proves wallet ownership. No blockchain transaction or gas fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};