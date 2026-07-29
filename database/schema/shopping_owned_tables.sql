-- Classic Way Shopping — customer-write schema deltas
-- Admin owns full catalog/inventory migrations. These scripts are for local/dev
-- bootstrap of shopping-owned tables when using create_all or manual apply.

\i ../backend/app/modules/notifications/sql/notifications.sql
\i ../backend/app/modules/recently_viewed/sql/recently_viewed.sql
\i ../backend/app/modules/support/sql/support.sql
