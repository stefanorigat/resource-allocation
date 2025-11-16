# Database Setup Instructions

## Step 1: Create .env File

Create a `.env` file in the root directory with your PostgreSQL credentials:

```bash
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/resource_inventory?schema=public"
```

**Replace the placeholders:**
- `USERNAME`: Your PostgreSQL username (default: `postgres`)
- `PASSWORD`: Your PostgreSQL password
- `resource_inventory`: The database name (will be created automatically)

**Example:**
```bash
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/resource_inventory?schema=public"
```

## Step 2: Create the Database

The database will be created automatically when you run the migration, or you can create it manually:

```sql
CREATE DATABASE resource_inventory;
```

## Step 3: Run Database Migrations

Run the following command to create all database tables:

```bash
npx prisma migrate dev --name init
```

This will:
- Create the `resource_inventory` database (if it doesn't exist)
- Create all tables (resources, pods, projects, etc.)
- Generate the Prisma Client

## Step 4: Seed the Database (Optional)

To populate the database with initial sample data:

```bash
npm run seed
```

## Step 5: View Your Database (Optional)

To open Prisma Studio and view/edit your data:

```bash
npx prisma studio
```

This will open a web interface at http://localhost:5555

## Database Schema

The following tables will be created:

### resources
- id, name, type, capacity, unit, available, status
- Types: compute, storage, memory, network, gpu
- Status: active, maintenance, offline

### pods
- id, name, description, status
- Status: running, stopped, pending

### projects
- id, name, description, owner, status
- Status: active, completed, on-hold

### resource_allocations
- Tracks resource allocations to pods or projects
- id, resourceId, amount, podId, projectId, allocatedAt

### project_pods
- Many-to-many relationship between projects and pods
- projectId, podId

## Troubleshooting

### Connection Issues

If you get connection errors:

1. **Check PostgreSQL is running:**
   ```bash
   pg_isready -h localhost -p 5432
   ```

2. **Verify credentials:**
   - Try connecting with psql:
   ```bash
   psql -h localhost -p 5432 -U postgres
   ```

3. **Check .env file location:**
   - Must be in the root directory
   - Filename is exactly `.env` (not `.env.txt`)

### Permission Issues

If you get permission errors:

```sql
GRANT ALL PRIVILEGES ON DATABASE resource_inventory TO your_username;
```

### Port Already in Use

If port 5432 is in use, check if PostgreSQL is already running:

```bash
lsof -i :5432
```

## Next Steps

After setup is complete, start the development server:

```bash
npm run dev
```

The application will now use PostgreSQL instead of in-memory storage!

