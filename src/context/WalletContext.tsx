import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import {
  AptosWalletAdapterProvider,
  useWallet as useAptosWallet,
  Wallet,
  WalletName,
  InputTransactionData
} from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from 'petra-plugin-wallet-adapter';
import { Network } from '@aptos-labs/ts-sdk';
import api from '@/services/api';

// Define the wallet context type
interface WalletContextType {
  // Connection state
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  wallet: Wallet | null;
  wallets: readonly Wallet[];
  
  // Account info
  account: {
    address: string;
    publicKey: string;
  } | null;
  network: {
    name: string;
    chainId?: string;
    url?: string;
  } | null;
  
  // Actions
  connect: (walletName?: WalletName) => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<{
    signature: string;
    fullMessage: string;
    nonce: string;
  }>;
  signAndSubmitTransaction: (transaction: InputTransactionData) => Promise<{ hash: string }>;
  
  // Auth actions
  authenticateWithWallet: () => Promise<{ success: boolean; token?: string; error?: string }>;
  linkWalletToAccount: () => Promise<{ success: boolean; error?: string }>;
  
  // Helpers
  isPetraInstalled: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

// Inner component that uses the Aptos wallet hook
const WalletContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    connect: aptosConnect,
    disconnect: aptosDisconnect,
    account,
    connected,
    connecting,
    disconnecting,
    wallet,
    wallets,
    network,
    signMessage: aptosSignMessage,
    signAndSubmitTransaction: aptosSignAndSubmitTransaction,
  } = useAptosWallet();

  // Check if Petra is installed
  const isPetraInstalled = useMemo(() => {
    return wallets.some(w => w.name === 'Petra');
  }, [wallets]);

  // Connect to wallet
  const connect = useCallback(async (walletName?: WalletName) => {
    try {
      await aptosConnect(walletName || 'Petra' as WalletName);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }, [aptosConnect]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      await aptosDisconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }, [aptosDisconnect]);

  // Sign a message
  const signMessage = useCallback(async (message: string) => {
    if (!connected || !account) {
      throw new Error('Wallet not connected');
    }

    const nonce = Date.now().toString() + Math.random().toString(36).substring(2);
    
    const response = await aptosSignMessage({
      message,
      nonce,
    });

    return {
      signature: response.signature as string,
      fullMessage: response.fullMessage,
      nonce: response.nonce,
    };
  }, [connected, account, aptosSignMessage]);

  // Sign and submit transaction
  const signAndSubmitTransaction = useCallback(async (transaction: InputTransactionData) => {
    if (!connected) {
      throw new Error('Wallet not connected');
    }

    const response = await aptosSignAndSubmitTransaction(transaction);
    return { hash: response.hash };
  }, [connected, aptosSignAndSubmitTransaction]);

  // Generate auth message
  const generateAuthMessage = useCallback((address: string) => {
    const timestamp = Date.now();
    return `Sign this message to authenticate with LifeVault.\n\nWallet: ${address}\nTimestamp: ${timestamp}\n\nThis signature will not trigger any blockchain transaction or cost any gas fees.`;
  }, []);

  // Authenticate with wallet
  const authenticateWithWallet = useCallback(async () => {
    try {
      if (!connected || !account) {
        // Try to connect first
        await connect();
        // Wait a bit for connection to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const currentAccount = account;
      if (!currentAccount?.address) {
        return { success: false, error: 'No wallet connected' };
      }

      const message = generateAuthMessage(currentAccount.address);
      const signResult = await signMessage(message);

      // Send to backend
      const response = await api.post('/auth/wallet', {
        address: currentAccount.address,
        publicKey: currentAccount.publicKey,
        signature: signResult.signature,
        message: signResult.fullMessage,
        nonce: signResult.nonce,
      });

      const { token } = response.data.data;
      localStorage.setItem('token', token);

      return { success: true, token };
    } catch (error: any) {
      console.error('Wallet authentication failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Authentication failed',
      };
    }
  }, [connected, account, connect, signMessage, generateAuthMessage]);

  // Link wallet to existing account
  const linkWalletToAccount = useCallback(async () => {
    try {
      if (!connected || !account) {
        await connect();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const currentAccount = account;
      if (!currentAccount?.address) {
        return { success: false, error: 'No wallet connected' };
      }

      const message = `Link this wallet to your LifeVault account.\n\nWallet: ${currentAccount.address}\nTimestamp: ${Date.now()}`;
      const signResult = await signMessage(message);

      const response = await api.post('/auth/link-wallet', {
        address: currentAccount.address,
        publicKey: currentAccount.publicKey,
        signature: signResult.signature,
        message: signResult.fullMessage,
        nonce: signResult.nonce,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Wallet linking failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to link wallet',
      };
    }
  }, [connected, account, connect, signMessage]);

  const value: WalletContextType = {
    connected,
    connecting,
    disconnecting,
    wallet,
    wallets,
    account: account ? {
      address: account.address,
      publicKey: account.publicKey as string,
    } : null,
    network: network ? {
      name: network.name,
      chainId: network.chainId,
      url: network.url,
    } : null,
    connect,
    disconnect,
    signMessage,
    signAndSubmitTransaction,
    authenticateWithWallet,
    linkWalletToAccount,
    isPetraInstalled,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Outer provider that wraps with AptosWalletAdapterProvider
export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Configure wallets - add Petra
  const wallets = [new PetraWallet()];

  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={true}
      dappConfig={{
        network: Network.TESTNET,
        aptosApiKey: import.meta.env.VITE_APTOS_API_KEY,
        aptosConnect: {
          dappId: 'lifevault',
        },
      }}
      onError={(error) => {
        console.error('Wallet adapter error:', error);
      }}
    >
      <WalletContextProvider>
        {children}
      </WalletContextProvider>
    </AptosWalletAdapterProvider>
  );
};

// Hook to use wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};