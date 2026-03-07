# Supabase Database Setup

This directory contains the database schema and migrations for the FastenersPro application.

## Database Schema Overview

### Tables

1. **categories** - Product categories (e.g., "Die Springs", "Ejector Pins")
2. **masters** - Attribute types (e.g., "Size", "Length", "Material")
3. **master_fields** - Specific fields for each master with their options
4. **products** - Actual products in the catalog

### Hierarchy

```
Categories (Product Types)
├── Die Springs
│   ├── Master: Size (M6, M8, M10, M12, M16)
│   └── Master: Load (Light, Medium, Heavy, Extra Heavy)
└── Ejector Pins
    ├── Master: Length (50mm, 75mm, 100mm, 150mm, 200mm)
    └── Master: Material (SKD61, SKH51, Nitrided Steel, Stainless Steel)

Products
└── Each product belongs to ONE category and has values from that category's masters
```

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be provisioned

### 2. Run the Migration

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `migrations/001_initial_schema.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl+Enter`

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Get your Supabase credentials from the project settings:
   - Go to **Settings** → **API**
   - Copy the **Project URL** and **anon/public key**
3. Update `.env.local` with your credentials

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Verify Setup

After running the migration, verify that:

1. All 4 tables are created (categories, masters, master_fields, products)
2. RLS policies are enabled
3. Seed data is inserted (2 categories, 4 masters, 4 master fields)

You can check this in the Supabase dashboard:
- **Table Editor** - View tables and data
- **Authentication** → **Policies** - View RLS policies

## Row Level Security (RLS) Policies

### Public Access (Ecommerce Site)

✅ **READ access for everyone:**
- Categories (all)
- Masters (all)
- Master Fields (all)
- Products (only `status = 'active'`)

### Admin Access (Dashboard)

✅ **Full CRUD access for authenticated users:**
- Categories (create, read, update, delete)
- Masters (create, read, update, delete)
- Master Fields (create, read, update, delete)
- Products (create, read, update, delete - including drafts and inactive)

### Security Notes

- Public users can only see **active** products
- Authenticated admin users can see all products (active, inactive, draft)
- All write operations require authentication
- Products with `status = 'draft'` or `status = 'inactive'` are hidden from public

## Helper Functions

The migration includes useful helper functions:

### `get_category_masters(category_uuid)`

Get all masters and their fields for a specific category.

```sql
SELECT * FROM get_category_masters('cat-1');
```

### `search_products(search_term, category_filter, status_filter)`

Search products with optional filters.

```sql
-- Search all active products
SELECT * FROM search_products('spring', NULL, 'active');

-- Search products in a specific category
SELECT * FROM search_products('', 'cat-1', 'active');
```

## Data Model

### Categories Table

```typescript
{
  id: UUID
  name: string (2-100 chars)
  description: string (5-500 chars)
  color: string (hex color)
  icon: string (emoji)
  created_at: timestamp
  updated_at: timestamp
}
```

### Masters Table

```typescript
{
  id: UUID
  name: string (2-100 chars)
  description: string (5-500 chars)
  color: string (hex color)
  icon: string (emoji)
  category_id: UUID (nullable, references categories)
  created_at: timestamp
  updated_at: timestamp
}
```

### Master Fields Table

```typescript
{
  id: UUID
  master_id: UUID (references masters)
  label: string (1-100 chars)
  type: 'select' | 'text' | 'number' | 'color'
  options: JSON array of strings
  unit: string (nullable, e.g., "mm", "kg")
  sort_order: integer
  created_at: timestamp
}
```

### Products Table

```typescript
{
  id: UUID
  name: string (2-200 chars)
  sku: string (3-100 chars, unique)
  description: string (nullable)
  category_id: UUID (references categories)
  status: 'active' | 'inactive' | 'draft'
  master_values: JSONB { "field_id": ["value1", "value2"] }
  created_at: timestamp
  updated_at: timestamp
}
```

## Indexes

The schema includes optimized indexes for:
- Fast category/master/product lookups
- Efficient filtering by status
- Quick SKU searches
- JSONB queries on master_values
- Sorted listings by creation date

## Troubleshooting

### Migration Fails

- Check if you have the correct permissions
- Ensure the `uuid-ossp` extension is enabled
- Verify no existing tables with the same names

### RLS Policies Not Working

- Ensure RLS is enabled on all tables
- Check if you're using the correct Supabase client (anon key for public, authenticated for admin)
- Verify authentication is working correctly

### Can't See Products on Ecommerce Site

- Check if products have `status = 'active'`
- Verify RLS policies are correctly applied
- Check browser console for errors

## Next Steps

After setting up the database:

1. Install Supabase client: `npm install @supabase/supabase-js`
2. Create Supabase client utility in your Next.js app
3. Replace the local store with Supabase queries
4. Implement authentication for admin dashboard
5. Set up Tanstack Query for data fetching
