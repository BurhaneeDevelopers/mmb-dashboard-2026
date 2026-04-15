# FastenersPro System Overview

## Database Structure

### Tables
1. **categories** - Product categories (Die Springs, Ejector Pins, etc.)
2. **masters** - Attribute types linked to categories (Size, Load, Material, etc.)
3. **master_fields** - Fields for each master (one field per master in current design)
4. **master_values** - Individual values for fields (M6, M8, Light, Heavy, etc.)
5. **products** - Products in the catalog
6. **product_master_values** - Junction table linking products to their attribute values

### Relationships
```
categories (1) -----> (N) masters
masters (1) -----> (N) master_fields
master_fields (1) -----> (N) master_values
products (N) <-----> (N) master_values (via product_master_values)
categories (1) -----> (N) products
```

## How It Works

### 1. Creating a Category
- User creates a category (e.g., "Die Springs")
- Category has name, description, color, and icon

### 2. Creating a Master
- User creates a master linked to a category (e.g., "Size" for "Die Springs")
- Master has fields with values (e.g., Size field with values: M6, M8, M10)
- Values are stored in `master_values` table

### 3. Creating a Product
- User selects a category
- Form shows all masters for that category
- User can select multiple values from each master
- Selected values are linked via `product_master_values` table

### 4. Editing a Product
- Form loads existing product data
- Shows all available values from `master_values`
- Pre-selects the values assigned to the product
- User can change selections

### 5. Editing/Deleting Master Values
- When a master value is edited, it updates everywhere (CASCADE)
- When a master value is deleted, it's removed from products (CASCADE)
- This ensures data consistency

## Key Features

### Automatic Updates
- Delete a master value → automatically removed from all products
- Edit a master value → automatically updated in all products
- This is handled by database CASCADE constraints

### Form Behavior
- Product form converts between two formats:
  - **Form format**: `masterValues` = `{ fieldId: [value1, value2] }`
  - **Database format**: `masterValueIds` = `[id1, id2, id3]`
- Conversion happens in `productsService.convertMasterValuesToIds()`

### Data Flow

#### Creating a Product:
1. User selects values in form → stored as `masterValues` object
2. On submit → converted to `masterValueIds` array
3. Saved to database via `product_master_values` table

#### Loading a Product:
1. Database query joins `product_master_values` and `master_values`
2. `transformProduct()` converts to `masterValues` object
3. Form displays with pre-selected values

## Testing the System

### 1. Run Migrations
```bash
supabase db reset
# or
supabase db push
```

### 2. Verify Data
- 3 categories created
- 8 masters created (3 for Die Springs, 3 for Ejector Pins, 2 for Guide Posts)
- 43 master values created
- 6 products created with linked values

### 3. Test Workflow
1. Go to Products → should see 6 products
2. Click Edit on any product → should see values pre-selected
3. Go to Masters → edit a value → check product reflects change
4. Create new product → should see all available values

## Component Structure

### Product Form Components
- `ProductForm.tsx` - Main form with validation
- `ProductFormWrapper.tsx` - Loads product data for editing
- `AttributesSection.tsx` - Shows masters and their values
- `BasicInfoSection.tsx` - Name, SKU, status fields
- `CategorySection.tsx` - Category selection

### Services
- `products.service.ts` - Product CRUD + value conversion
- `masters.service.ts` - Master CRUD + value management
- `categories.service.ts` - Category CRUD

### Key Functions
- `transformProduct()` - Converts DB format to app format
- `convertMasterValuesToIds()` - Converts form format to DB format
- `transformMasterField()` - Populates field options from master_values

## Troubleshooting

### Values not showing in form?
- Check `masters.service.ts` includes `master_values` in query
- Check `transformMasterField()` extracts values correctly

### Values not saving?
- Check `convertMasterValuesToIds()` is called before save
- Check `product_master_values` table has entries

### Values not pre-selected when editing?
- Check `transformProduct()` builds `masterValues` object correctly
- Check form receives `initialData` with `masterValues`

## Database Queries for Debugging

```sql
-- View all master values
SELECT 
  c.name as category,
  m.name as master,
  mf.label as field,
  mv.value
FROM master_values mv
JOIN master_fields mf ON mv.master_field_id = mf.id
JOIN masters m ON mf.master_id = m.id
JOIN categories c ON m.category_id = c.id
ORDER BY c.name, m.name, mv.value;

-- View product with values
SELECT 
  p.name as product,
  m.name as master,
  mv.value
FROM products p
JOIN product_master_values pmv ON p.id = pmv.product_id
JOIN master_values mv ON pmv.master_value_id = mv.id
JOIN master_fields mf ON mv.master_field_id = mf.id
JOIN masters m ON mf.master_id = m.id
WHERE p.sku = 'DS-M6-L-25';
```
