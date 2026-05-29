import { apiClient } from '../api-client';

export interface AdminMetrics {
  registeredUsers: number;
  totalTransactions: number;
  pendingKyc: number;
  currencies: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  walletAddress: string;
  username: string;
  avatarUrl: string | null;
  transactions: number;
  totalDeposit: number;
  totalWithdraw: number;
  kycStatus: 'Verified' | 'Unverified';
  createdAt: string;
  isActive: boolean;
}

export interface AdminTransaction {
  id: string;
  amount: number;
  currency: string;
  type: 'Deposit' | 'Withdraw' | 'Convert';
  username: string;
  date: string;
  txId: string;
  status: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

// Safe normalization of Admin Users
export function mapAdminUser(dto: any): AdminUser {
  return {
    id: String(dto.id ?? dto._id ?? ''),
    email: String(dto.email ?? ''),
    firstName: dto.firstName ?? dto.first_name ?? null,
    lastName: dto.lastName ?? dto.last_name ?? null,
    phone: dto.phone ?? null,
    walletAddress: dto.walletAddress ?? dto.wallet_address ?? dto.address ?? '0x...',
    username: dto.username ?? dto.email?.split('@')[0] ?? 'user',
    avatarUrl: dto.avatarUrl ?? dto.avatar_url ?? null,
    transactions: Number(dto.transactions ?? dto.transactionCount ?? 0),
    totalDeposit: Number(dto.totalDeposit ?? dto.total_deposit ?? 0),
    totalWithdraw: Number(dto.totalWithdraw ?? dto.total_withdraw ?? 0),
    kycStatus: dto.kycStatus === 'Verified' || dto.kyc_status === 'Verified' ? 'Verified' : 'Unverified',
    createdAt: dto.createdAt ?? dto.created_at ? new Date(dto.createdAt ?? dto.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'N/A',
    isActive: Boolean(dto.isActive ?? dto.is_active ?? true),
  };
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const response = await apiClient<any>('/admin/metrics');
  const data = response?.data ?? response ?? {};
  return {
    registeredUsers: Number(data.registeredUsers ?? 0),
    totalTransactions: Number(data.totalTransactions ?? 0),
    pendingKyc: Number(data.pendingKyc ?? 0),
    currencies: Number(data.currencies ?? 0),
    totalDeposits: Number(data.totalDeposits ?? 0),
    totalWithdrawals: Number(data.totalWithdrawals ?? 0),
  };
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await apiClient<any>('/admin/users');
  const data = response?.data ?? response ?? [];
  return Array.isArray(data) ? data.map(mapAdminUser) : [];
}

export async function getAdminUserById(id: string): Promise<AdminUser> {
  const response = await apiClient<any>(`/admin/users/${id}`);
  const data = response?.data ?? response ?? {};
  return mapAdminUser(data);
}

export async function getAdminTransactions(): Promise<AdminTransaction[]> {
  const response = await apiClient<any>('/admin/transactions');
  const data = response?.data ?? response ?? [];
  const typeMap: Record<string, 'Deposit' | 'Withdraw' | 'Convert'> = {
    deposit: 'Deposit',
    withdrawal: 'Withdraw',
    withdraw: 'Withdraw',
    convert: 'Convert',
    conversion: 'Convert',
  };
  return Array.isArray(data) ? data.map((dto: any) => ({
    id: String(dto.id ?? dto._id ?? ''),
    amount: Number(dto.amount ?? 0),
    currency: String(dto.currency ?? 'NGN'),
    type: typeMap[(dto.type as string)?.toLowerCase()] ?? 'Deposit',
    username: dto.username ?? dto.email ?? 'Unknown User',
    date: dto.createdAt ?? dto.date ? new Date(dto.createdAt ?? dto.date).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'N/A',
    txId: dto.txId ?? dto.transactionRef ?? dto.reference ?? dto.id ?? '0x...',
    status: dto.status ?? 'active',
  })) : [];
}

export async function getAdminPushNotifications(): Promise<PushNotification[]> {
  const response = await apiClient<any>('/admin/push-notifications');
  const data = response?.data ?? response ?? [];
  return Array.isArray(data) ? data.map((dto: any) => ({
    id: String(dto.id ?? dto._id ?? ''),
    title: String(dto.title ?? ''),
    message: String(dto.message ?? ''),
    status: dto.status === 'Active' || dto.status === 'active' ? 'Active' : 'Inactive',
    createdAt: dto.createdAt ?? dto.created_at ? new Date(dto.createdAt ?? dto.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'N/A',
  })) : [];
}

export async function createAdminPushNotification(payload: { title: string; message: string }): Promise<PushNotification> {
  const response = await apiClient<any>('/admin/push-notifications', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const data = response?.data ?? response ?? {};
  return {
    id: String(data.id ?? data._id ?? ''),
    title: String(data.title ?? ''),
    message: String(data.message ?? ''),
    status: data.status === 'Active' || data.status === 'active' ? 'Active' : 'Inactive',
    createdAt: data.createdAt ?? data.created_at ? new Date(data.createdAt ?? data.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'N/A',
  };
}
