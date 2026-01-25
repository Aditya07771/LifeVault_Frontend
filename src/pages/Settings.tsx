import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getInitials, formatFileSize } from '@/services/api';
import { User, Wallet, HardDrive, AlertTriangle, Copy, ExternalLink } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-black mb-2">Settings</h1>
        <p className="text-black/50 mb-8">Manage your account and preferences</p>

        {/* Profile Section */}
        <div className="bg-white rounded-xl border border-black/5 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-black/50" />
            <h2 className="text-lg font-semibold">Profile</h2>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
              {getInitials(user?.name || user?.email)}
            </div>
            <div>
              <p className="text-lg font-semibold text-black">{user?.name || 'No name set'}</p>
              <p className="text-black/50">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-black/5">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-black/50">{user?.email}</p>
              </div>
              <button className="px-4 py-2 text-sm border border-black/10 rounded-lg hover:bg-black/5">
                Change
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-black/50">••••••••</p>
              </div>
              <button className="px-4 py-2 text-sm border border-black/10 rounded-lg hover:bg-black/5">
                Change
              </button>
            </div>
          </div>
        </div>

        {/* Aptos Wallet Section */}
        <div className="bg-white rounded-xl border border-black/5 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Wallet className="w-5 h-5 text-black/50" />
            <h2 className="text-lg font-semibold">Aptos Wallet</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-black/40 uppercase mb-2">Wallet Address</p>
              <div className="flex items-center gap-2">
                <code className="text-sm break-all flex-1">{user?.aptosAddress || 'No wallet'}</code>
                {user?.aptosAddress && (
                  <button
                    onClick={() => copyToClipboard(user.aptosAddress!)}
                    className="p-2 hover:bg-black/5 rounded-lg"
                    title="Copy address"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Balance</p>
                <p className="text-sm text-black/50">{user?.aptosBalance || 0} APT</p>
              </div>
              <a
                href={`https://explorer.aptoslabs.com/account/${user?.aptosAddress}?network=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm border border-black/10 rounded-lg hover:bg-black/5"
              >
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </a>
            </div>
          </div>
        </div>

        {/* Storage Section */}
        <div className="bg-white rounded-xl border border-black/5 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <HardDrive className="w-5 h-5 text-black/50" />
            <h2 className="text-lg font-semibold">Storage</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-black/5">
              <p className="font-medium">Total Memories</p>
              <p className="text-black/60">{user?.totalMemories || 0} items</p>
            </div>
            <div className="flex items-center justify-between py-3">
              <p className="font-medium">Storage Used</p>
              <p className="text-black/60">{formatFileSize(user?.storageUsed || 0)}</p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-black/5">
              <div>
                <p className="font-medium">Sign Out</p>
                <p className="text-sm text-black/50">Sign out of your account</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Sign Out
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-black/50">Permanently delete your account</p>
              </div>
              <button className="px-4 py-2 text-sm border border-red-500 text-red-500 rounded-lg hover:bg-red-50">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;