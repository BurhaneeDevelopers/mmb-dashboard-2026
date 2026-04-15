# Supabase Database Schema

This directory contains the database migrations for the FastenersPro application.

## Schema Overview

The database uses a relational structure with the following tables:

### Core Tables

1. **categories** - Product categories (e.g., Die Springs, Ejector Pins)
2. **masters** - Attribute types (e.g., Size, Length, Material) linked to categories
3. **master_fields** - Specific fields for each master with configuration
4. **master_values** - Individual values for master fields (e.g., "M6", "M8")
5. **products** - Actual products in the catalog
6. **product_master_values** - Junction table linking products to master values

### Relationships

```
categories (1) -----> (N) masters
masters (1) -----> (N) master_fields
master_fields (1) -----> (N) master_values
products (N) <-----> (N) master_values (via product_master_values)
categories (1) -----> (N) products
```

## Migration Files

### 001_initial_schema.sql
Initial schema with JSONB-based master values (deprecated approach).

### 002_add_product_images.sql
Adds image_url column to products table.

### 003_refactor_to_relational_master_values.sql
Refactors from JSONB to relational structure:
- Creates `master_values` table
- Creates `product_master_values` junction table
- Removes `master_values` JSONB column from products
- Adds helper functions for querying

### 004_complete_schema.sql
Complete schema file that can be run on a fresh database. Includes:
- All tables in proper dependency order
- Indexes for performance
- Row Level Security (RLS) policies
- Helper functions
- Triggers for updated_at timestamps

## Running Migrations

### Option 1: Sequential Migrations (Existing Database)
If you already have data from migration 001:

```bash
# Run migrations in order
supabase db push
```

### Option 2: Fresh Database
For a new database, you can run the complete schema:

```bash
# Reset database (WARNING: destroys all data)
supabase db reset

# Or manually run 004_complete_schema.sql
psql -h your-host -U postgres -d your-db -f supabase/migrations/004_complete_schema.sql
```

## Schema Details

### Categories Table
```sql
- id: UUID (PK)
- name: TEXT (2-100 chars)
- description: TEXT (5-500 chars)
- color: TEXT (hex color)
- icon: TEXT (emoji or icon name)
- created_at, updated_at: TIMESTAMPTZ
```

### Masters Table
```sql
- id: UUID (PK)
- name: TEXT (2-100 chars)
- description: TEXT (5-500 chars)
- color: TEXT
- icon: TEXT
- category_id: UUID (FK -> categories, nullable)
- created_at, updated_at: TIMESTAMPTZ
```

### Master Fields Table
```sql
- id: UUID (PK)
- master_id: UUID (FK -> masters)
- label: TEXT (1-100 chars)
- type: TEXT ('select', 'text', 'number', 'color')
- options: JSONB (array of options for select type)
- unit: TEXT (nullable, e.g., 'mm', 'kg')
- sort_order: INTEGER
- created_at: TIMESTAMPTZ
```

### Master Values Table
```sql
- id: UUID (PK)
- master_field_id: UUID (FK -> master_fields)
- value: TEXT
- created_at: TIMESTAMPTZ
- UNIQUE(master_field_id, value)
```

### Products Table
```sql
- id: UUID (PK)
- name: TEXT (2-200 chars)
- sku: TEXT (3-100 chars, unique)
- description: TEXT (nullable)
- category_id: UUID (FK -> categories)
- status: TEXT ('active', 'inactive', 'draft')
- image_url: TEXT (nullable, max 500 chars)
- created_at, updated_at: TIMESTAMPTZ
```

### Product Master Values Table
```sql
- id: UUID (PK)
- product_id: UUID (FK -> products)
- master_value_id: UUID (FK -> master_values)
- UNIQUE(product_id, master_value_id)
```

## Helper Functions

### get_product_with_values(product_uuid)
Returns a product with all its master values aggregated as JSONB.

### get_master_field_values(field_uuid)
Returns all values for a specific master field.

### search_products_with_values(search_term, category_filter, status_filter)
Searches products with optional filters and returns master values.

### get_category_masters(category_uuid)
Returns all masters for a category with their fields.

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **Public Read**: Everyone can view active products and all categories/masters
- **Authenticated Write**: Only authenticated users can create/update/delete
- **Draft Protection**: Draft products are only visible to authenticated users

## Indexes

Performance indexes are created on:
- Foreign keys (category_id, master_id, etc.)
- Search fields (name, sku)
- Sort fields (created_at, sort_order)
- Junction table lookups (product_id, master_value_id)

## Data Migration Notes

If migrating from the JSONB approach (migration 001) to the relational approach (migration 003):

1. The `master_values` JSONB column in products is removed
2. You'll need to migrate existing data:
   - Extract values from JSONB
   - Create corresponding `master_values` records
   - Link via `product_master_values` table

Example migration script would:
```sql
-- For each product with master_values JSONB
-- 1. Parse the JSONB structure
-- 2. For each field_id and value in the JSONB:
--    a. Create or find master_value record
--    b. Create product_master_values link
```

## TypeScript Integration

The schema is integrated with TypeScript types in:
- `lib/supabase/types.ts` - Database and application types
- `lib/supabase/products.service.ts` - Product and master values services
- `lib/supabase/masters.service.ts` - Masters and fields services

## Storage

Product images are stored in Supabase Storage:
- Bucket: `product-images`
- Public access enabled
- URLs stored in `products.image_url`
