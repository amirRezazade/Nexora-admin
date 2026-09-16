# Nova × Supabase

مرحله‌به‌مرحله: `guide.html`

## فایل‌ها

| فایل | کار |
| --- | --- |
| `schema.sql` | ساخت جدول‌ها، ایندکس، view انبار، RLS |
| `seed.sql` | دیتای متوسط Nova |
| `verify.sql` | شمارش رکوردها برای چک کردن |
| `generate-seed.mjs` | اگر دیتای mockapi عوض شد، seed را دوباره بساز |

## ترتیب اجرا در SQL Editor

1. کل `schema.sql` را Run کن
2. کل `seed.sql` را Run کن
3. کل `verify.sql` را Run کن

اگر خواستی از نو بسازی، دوباره همان `schema.sql` را اجرا کن (جدول‌های قبلی را drop می‌کند).
