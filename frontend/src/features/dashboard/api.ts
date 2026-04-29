import { api } from '@/lib/axios';
import type {
  DashboardTopProduct,
  SellerStats,
  TimeseriesPoint,
} from '@/types/dashboard';

export async function getStats(): Promise<SellerStats> {
  const { data } = await api.get<SellerStats>('/seller-dashboard/stats');
  return data;
}

export async function getTimeseries(days = 30): Promise<TimeseriesPoint[]> {
  const { data } = await api.get<TimeseriesPoint[]>('/seller-dashboard/timeseries', {
    params: { days },
  });
  return data;
}

export async function getTopProducts(
  by: 'views' | 'inquiries' = 'views',
  limit = 5,
): Promise<DashboardTopProduct[]> {
  const { data } = await api.get<DashboardTopProduct[]>('/seller-dashboard/top-products', {
    params: { by, limit },
  });
  return data;
}
