import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import walletService from '@/services/walletService';
import api from '@/services/api';

interface WalletContextType {
  // State
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  publicKey: string | null;
  network: string | null;
  isPetraInstalled: boolean;
  
  // Actions
  connect: () => Promise<{ success: boolean; address?: string; error?: string }>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<{ signature: string; fullMessage: string; nonce: string }>;
  authenticateWithWallet: () => Promise<{ success: boolean; token?: string; error?: string }>;
  linkWalletToAccount: () => Promise<{ success: boolean; error?: string }>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [isPetraInstalled, setIsPetraInstalled] = useState(false);

  // Check wallet status on mount
  useEffect(() => {
    const checkWallet = async () => {
      const installed = walletService.isPetraInstalled();
      setIsPetraInstalled(installed);

      if (installed) {
        const account = await walletService.getAccount();
        if (account) {
          setIsConnected(true);
          setAddress(account.address);
          setPublicKey(account.publicKey);
          const net = await walletService.getNetwork();
          setNetwork(net);
        }
      }
    };

    // Small delay to ensure window.aptos is available
    const timer = setTimeout(checkWallet, 100);
    return () => clearTimeout(timer);
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (isPetraInstalled) {
      walletService.onAccountChange((account) => {
        if (account) {
          setAddress(account.address);
          setPublicKey(account.publicKey);
          setIsConnected(true);
        } else {
          setAddress(null);
          setPublicKey(null);
          setIsConnected(false);
        }
      });

      walletService.onNetworkChange((net) => {
        setNetwork(net.name);
      });
    }
  }, [isPetraInstalled]);

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      const result = await walletService.connect();
      setIsConnected(true);
      setAddress(result.address);
      setPublicKey(result.publicKey);
      const net = await walletService.getNetwork();
      setNetwork(net);
      return { success: true, address: result.address };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await walletService.disconnect();
    setIsConnected(false);
    setAddress(null);
    setPublicKey(null);
  }, []);

  const signMessage = useCallback(async (message: string) => {
    return await walletService.signMessage(message);
  }, []);

  /**
   * Authenticate with wallet (login/register via wallet)
   */
  const authenticateWithWallet = useCallback(async () => {
    try {
      if (!address) {
        const connectResult = await connect();
        if (!connectResult.success) {
          return { success: false, error: connectResult.error };
        }
      }

      const currentAddress = address || walletService.getAddress();
      if (!currentAddress) {
        return { success: false, error: 'No wallet address' };
      }

      // Generate auth message
      const message = walletService.generateAuthMessage(currentAddress);
      
      // Sign the message
      const signResult = await walletService.signMessage(message);
      
      // Send to backend for verification
      const response = await api.post('/auth/wallet', {
        address: currentAddress,
        publicKey: publicKey || walletService.getPublicKey(),
        signature: signResult.signature,
        message: signResult.fullMessage,
        nonce: signResult.nonce
      });

      const { token } = response.data.data;
      localStorage.setItem('token', token);
      
      return { success: true, token };
    } catch (error: any) {
      console.error('Wallet authentication failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }, [address, publicKey, connect]);

  /**
   * Link wallet to existing account
   */
  const linkWalletToAccount = useCallback(async () => {
    try {
      if (!address) {
        const connectResult = await connect();
        if (!connectResult.success) {
          return { success: false, error: connectResult.error };
        }
      }

      const currentAddress = address || walletService.getAddress();
      if (!currentAddress) {
        return { success: false, error: 'No wallet address' };
      }

      // Generate link message
      const message = `Link this wallet to your LifeVault account.\n\nWallet: ${currentAddress}\nTimestamp: ${Date.now()}`;
      
      // Sign the message
      const signResult = await walletService.signMessage(message);
      
      // Send to backend
      const response = await api.post('/auth/link-wallet', {
        address: currentAddress,
        publicKey: publicKey || walletService.getPublicKey(),
        signature: signResult.signature,
        message: signResult.fullMessage,
        nonce: signResult.nonce
      });

      return { success: true };
    } catch (error: any) {
      console.error('Wallet linking failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }, [address, publicKey, connect]);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        address,
        publicKey,
        network,
        isPetraInstalled,
        connect,
        disconnect,
        signMessage,
        authenticateWithWallet,
        linkWalletToAccount
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};