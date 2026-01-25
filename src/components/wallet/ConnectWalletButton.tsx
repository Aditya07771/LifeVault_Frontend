import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { Wallet, LogOut, ExternalLink, Copy, Check, Loader2, AlertCircle } from 'lucide-react';

interface ConnectWalletButtonProps {
  onAuthSuccess?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showAddress?: boolean;
  className?: string;
}

export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  onAuthSuccess,
  variant = 'default',
  size = 'md',
  showAddress = true,
  className = ''
}) => {
  const {
    isConnected,
    isConnecting,
    address,
    network,
    isPetraInstalled,
    connect,
    disconnect,
    authenticateWithWallet
  } = useWallet();

  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = async () => {
    setError(null);
    const result = await connect();
    if (!result.success) {
      setError(result.error || 'Connection failed');
    }
  };

  const handleAuthenticate = async () => {
    setError(null);
    setAuthenticating(true);
    
    const result = await authenticateWithWallet();
    
    if (result.success) {
      onAuthSuccess?.();
    } else {
      setError(result.error || 'Authentication failed');
    }
    
    setAuthenticating(false);
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setShowDropdown(false);
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    default: 'bg-black text-white hover:bg-black/80',
    outline: 'border-2 border-black text-black hover:bg-black hover:text-white',
    ghost: 'text-black hover:bg-black/5'
  };

  // Not installed
  if (!isPetraInstalled) {
    return (
      <a
        href="https://petra.app/"
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 rounded-lg font-medium transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      >
        <Wallet className="w-4 h-4" />
        Install Petra
        <ExternalLink className="w-3 h-3" />
      </a>
    );
  }

  // Connected - show address dropdown
  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`inline-flex items-center gap-2 rounded-lg font-medium transition-colors ${sizeClasses[size]} bg-green-500/10 text-green-700 hover:bg-green-500/20 border border-green-500/20 ${className}`}
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {showAddress ? truncateAddress(address) : 'Connected'}
        </button>

        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)} 
            />
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-black/10 z-50 overflow-hidden">
              {/* Network Badge */}
              <div className="px-4 py-3 bg-gray-50 border-b border-black/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-black/50 uppercase tracking-wider">Network</span>
                  <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {network || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Address */}
              <div className="p-4 border-b border-black/5">
                <p className="text-xs text-black/50 mb-1">Wallet Address</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono flex-1 truncate">{address}</code>
                  <button
                    onClick={handleCopyAddress}
                    className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"
                    title="Copy address"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-black/50" />
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="p-2">
                <a
                  href={`https://explorer.aptoslabs.com/account/${address}?network=${network?.toLowerCase() || 'testnet'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-black/70 hover:bg-black/5 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Explorer
                </a>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect Wallet
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Not connected - show connect button
  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className={`inline-flex items-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      >
        {isConnecting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Wallet className="w-4 h-4" />
        )}
        {isConnecting ? 'Connecting...' : 'Connect Petra'}
      </button>
      
      {error && (
        <div className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  );
};