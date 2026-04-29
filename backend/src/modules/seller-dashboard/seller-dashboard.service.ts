import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, fn, col } from 'sequelize';

import { Inquiry } from '../inquiries/inquiry.model';
import { InquiryStatus } from '../inquiries/enums/inquiry-status.enum';
import { ProductImage } from '../products/product-image.model';
import { Product } from '../products/product.model';
import {
  type DashboardTopProductDto,
  type SellerStatsDto,
  type TimeseriesPointDto,
} from './dto/dashboard.dto';

@Injectable()
export class SellerDashboardService {
  constructor(
    @InjectModel(Product) private readonly productModel: typeof Product,
    @InjectModel(Inquiry) private readonly inquiryModel: typeof Inquiry,
  ) {}

  async stats(sellerId: string): Promise<SellerStatsDto> {
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;
    const last30Start = new Date(now.getTime() - 30 * day);
    const prev30Start = new Date(now.getTime() - 60 * day);

    const [
      totalProducts,
      activeProducts,
      productAggregates,
      totalInquiries,
      last30dInquiries,
      prev30dInquiries,
      openInquiries,
      respondedInquiries,
    ] = await Promise.all([
      this.productModel.count({ where: { sellerId }, paranoid: true }),
      this.productModel.count({ where: { sellerId, isActive: true } }),
      this.productModel.findOne({
        where: { sellerId },
        attributes: [
          [fn('COALESCE', fn('SUM', col('view_count')), 0), 'totalViews'],
        ],
        raw: true,
      }),
      this.inquiryModel.count({ where: { sellerId } }),
      this.inquiryModel.count({
        where: {
          sellerId,
          createdAt: { [Op.gte]: last30Start },
        } as never,
      }),
      this.inquiryModel.count({
        where: {
          sellerId,
          createdAt: { [Op.gte]: prev30Start, [Op.lt]: last30Start },
        } as never,
      }),
      this.inquiryModel.count({ where: { sellerId, status: InquiryStatus.NEW } }),
      this.inquiryModel.count({ where: { sellerId, status: InquiryStatus.RESPONDED } }),
    ]);

    const totalViews = Number(
      (productAggregates as unknown as { totalViews: string | number } | null)?.totalViews ?? 0,
    );
    const conversionRate = totalViews > 0 ? totalInquiries / totalViews : 0;

    return {
      totalProducts,
      activeProducts,
      totalViews,
      totalInquiries,
      last30dInquiries,
      prev30dInquiries,
      openInquiries,
      respondedInquiries,
      conversionRate: Number(conversionRate.toFixed(4)),
    };
  }

  async timeseries(sellerId: string, days: number): Promise<TimeseriesPointDto[]> {
    const day = 24 * 60 * 60 * 1000;
    const start = new Date(Date.now() - days * day);
    start.setUTCHours(0, 0, 0, 0);

    // Group inquiries created since `start` by date(created_at::date).
    const rows = (await this.inquiryModel.findAll({
      where: {
        sellerId,
        createdAt: { [Op.gte]: start },
      } as never,
      attributes: [
        [fn('DATE', col('created_at')), 'bucketDate'],
        [fn('COUNT', col('id')), 'bucketCount'],
      ],
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true,
    })) as unknown as { bucketDate: string | Date; bucketCount: string | number }[];

    const byDate = new Map<string, number>();
    for (const row of rows) {
      const key =
        row.bucketDate instanceof Date
          ? row.bucketDate.toISOString().slice(0, 10)
          : String(row.bucketDate).slice(0, 10);
      byDate.set(key, Number(row.bucketCount));
    }

    // Backfill zero-count days so the chart always has `days` points.
    const points: TimeseriesPointDto[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * day);
      d.setUTCHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      points.push({ date: key, count: byDate.get(key) ?? 0 });
    }
    return points;
  }

  async topProducts(
    sellerId: string,
    by: 'views' | 'inquiries',
    limit: number,
  ): Promise<DashboardTopProductDto[]> {
    const sortColumn = by === 'inquiries' ? 'inquiryCount' : 'viewCount';
    const rows = await this.productModel.findAll({
      where: { sellerId },
      include: [
        {
          model: ProductImage,
          attributes: ['url', 'isPrimary', 'position'],
          required: false,
          separate: true,
          order: [['position', 'ASC']],
        },
      ],
      order: [[sortColumn, 'DESC']],
      limit,
    });

    return rows.map((p) => {
      const primary = p.images?.find((i) => i.isPrimary) ?? p.images?.[0] ?? null;
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        viewCount: p.viewCount,
        inquiryCount: p.inquiryCount,
        primaryImageUrl: primary?.url ?? null,
      };
    });
  }
}
