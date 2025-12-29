-- Restore backup data with proper category mapping
-- This script restores the 2 expenses and 1 income record from the backup
-- with proper mapping of old ExpenseCategory enum to new categoryId UUIDs

-- First, verify categories exist
-- OUTSOURCING: 847358ba-c48e-4401-81a1-5f04f1adb5e0
-- MISCELLANEOUS: 2ae5234a-b20b-493f-bc67-8dccebb831a3

-- Restore expenses with proper categoryId
INSERT INTO expenses (
  id, description, "categoryId", amount, currency, "amountUSDT", "amountIDR",
  "exchangeRateId", "expenseDate", notes, "receiptUrl", tags,
  "createdAt", "updatedAt", "projectId"
) VALUES (
  '388e6984-6c3f-4609-ad55-05074b45fe6f',
  'Reimburse Julius (Transport, 3D Asset, Render)',
  '847358ba-c48e-4401-81a1-5f04f1adb5e0', -- OUTSOURCING
  858000.00000000,
  'IDR',
  51.16215003,
  858000.00,
  NULL,
  '2025-12-28 00:00:00',
  NULL,
  NULL,
  '{}',
  '2025-12-28 17:15:15.474',
  '2025-12-28 17:15:15.474',
  NULL
), (
  '211e9c40-9bd7-4697-9207-6badbbaa0bc4',
  'Reimburse Kelby (Ringgit, Transport, Tools, Konsumsi)',
  '2ae5234a-b20b-493f-bc67-8dccebb831a3', -- MISCELLANEOUS
  6215000.00000000,
  'IDR',
  370.59762519,
  6215000.00,
  NULL,
  '2025-12-28 00:00:00',
  NULL,
  NULL,
  '{}',
  '2025-12-28 17:16:07.879',
  '2025-12-28 17:16:07.879',
  NULL
);

-- Restore income
INSERT INTO income (
  id, description, amount, currency, "amountUSDT", "amountIDR",
  "incomeDate", notes, tags, "createdAt", "updatedAt"
) VALUES (
  '1c99951a-1f9c-487b-bd16-7efe646eb65a',
  'Initial Payment',
  34755300.00000000,
  'IDR',
  2072.44274222,
  34755300.00,
  '2025-12-28 00:00:00',
  NULL,
  '{}',
  '2025-12-28 17:13:48.453',
  '2025-12-28 17:13:48.453'
);
