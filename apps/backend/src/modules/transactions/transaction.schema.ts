import { z } from "zod";

// FE: note, payee, tags(string)
// BE model: notes, partner, tagIds(ObjectId)
// => schema nhận CẢ 2 để tương thích, service sẽ normalize.

export const createTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  title: z.string().min(1),

  amount: z.number().nonnegative(),

  currency: z.string().default("VND"),
  exchangeRateToBase: z.number().positive().default(1),
  originalAmount: z.number().nullable().optional(),

  category: z.string().min(1),
  wallet: z.string().min(1).default("Ví chính"),

  // FE gửi yyyy-mm-dd
  date: z.coerce.date().default(() => new Date()),

  // nhận cả 2 kiểu tên field
  note: z.string().optional(),
  notes: z.string().optional(),
  payee: z.string().optional(),
  partner: z.string().optional(),

  // nhận tags (name) hoặc tagIds (ObjectId string)
  tags: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),

  attachments: z
    .array(
      z.object({
        filename: z.string(),
        url: z.string().url(),
        mimeType: z.string().optional().default(""),
        size: z.number().optional().default(0),
      })
    )
    .optional(),

  splits: z
    .array(
      z.object({
        category: z.string().min(1),
        amount: z.number().nonnegative(),
        note: z.string().optional(),
      })
    )
    .optional(),

  refundOfId: z.string().optional(),

  installmentPlan: z
    .object({
      enabled: z.boolean().default(false),
      totalInstallments: z.number().int().nonnegative().default(0),
      currentInstallment: z.number().int().nonnegative().default(0),
      startDate: z.coerce.date().nullable().optional(),
      intervalMonths: z.number().int().positive().default(1),
    })
    .optional(),

  recurring: z
    .object({
      enabled: z.boolean().default(false),
      frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).default("MONTHLY"),
      interval: z.number().int().positive().default(1),
      byWeekday: z.number().int().min(0).max(6).nullable().optional(),
      nextRunAt: z.coerce.date().nullable().optional(),
      endDate: z.coerce.date().nullable().optional(),
      remainingCount: z.number().int().nullable().optional(),
    })
    .optional(),

  reminder: z
    .object({
      enabled: z.boolean().default(false),
      nextAt: z.coerce.date().nullable().optional(),
      method: z.enum(["NONE", "EMAIL"]).default("NONE"),
    })
    .optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const listQuerySchema = z.object({
  // FE: from/to, BE cũ: start/end
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  start: z.coerce.date().optional(),
  end: z.coerce.date().optional(),

  range: z.enum(["DAY", "WEEK", "MONTH", "YEAR"]).optional(),
  wallet: z.string().optional(),
  category: z.string().optional(),

  tag: z.string().optional(), // tag id OR tag name
  q: z.string().optional(),

  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
});
