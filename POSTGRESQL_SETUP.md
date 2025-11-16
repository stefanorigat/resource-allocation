# PostgreSQL Database Integration - Setup Guide

Your application has been configured to use PostgreSQL! Follow these steps to complete the setup.

## ✅ What's Been Done

1. ✅ Installed Prisma ORM and @prisma/client
2. ✅ Created database schema (prisma/schema.prisma)
3. ✅ Built API routes for all CRUD operations
4. ✅ Updated DataContext to use API calls instead of in-memory storage
5. ✅ Created seed script with sample data

## 🚀 Setup Steps

### Step 1: Configure Database Connection

Create a `.env` file in the root directory:

```bash
# In the project root (/Users/stefanorigat/Documents/Code/resources/)
touch .env
```

Add your PostgreSQL credentials to `.env`:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/resource_inventory?schema=public"
```

**Example with default PostgreSQL credentials:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/resource_inventory?schema=public"
```

**Replace:**
- `YOUR_USERNAME` with your PostgreSQL username
- `YOUR_PASSWORD` with your PostgreSQL password
- `resource_inventory` is the database name (will be created automatically)

### Step 2: Verify PostgreSQL is Running

Check if PostgreSQL is running on port 5432:

```bash
pg_isready -h localhost -p 5432
```

If it's not running, start PostgreSQL:

```bash
# On macOS with Homebrew:
brew services start postgresql@15

# Or check your PostgreSQL installation
```

### Step 3: Create Database and Run Migrations

Run this command to create the database and all tables:

```bash
npm run db:migrate
```

This will:
- Create the `resource_inventory` database (if it doesn't exist)
- Create all tables: resources, pods, projects, resource_allocations, project_pods
- Generate Prisma Client for type-safe database access

When prompted, enter a migration name (e.g., "init"):
```
Enter a name for the new migration: › init
```

### Step 4: Seed the Database with Sample Data

Populate the database with initial data:

```bash
npm run db:seed
```

This will create:
- 5 resources (CPU, Storage, Memory, GPU, Network)
- 3 pods with resource allocations
- 2 projects with pods and resources

### Step 5: Start the Application

```bash
npm run dev
```

Open http://localhost:3000 - Your app now uses PostgreSQL! 🎉

## 📊 Available Database Commands

```bash
# Generate Prisma Client (after schema changes)
npm run db:generate

# Create and run migrations
npm run db:migrate

# Push schema changes without migrations (for dev)
npm run db:push

# Open Prisma Studio (visual database editor)
npm run db:studio

# Seed database with sample data
npm run db:seed
```

## 🗄️ Database Schema

### Tables Created:

**resources**
- id (primary key)
- name, type, capacity, unit, available, status
- createdAt, updatedAt

**pods**
- id (primary key)
- name, description, status
- createdAt, updatedAt

**projects**
- id (primary key)
- name, description, owner, status
- createdAt, updatedAt

**resource_allocations**
- id (primary key)
- resourceId (foreign key → resources)
- podId (nullable, foreign key → pods)
- projectId (nullable, foreign key → projects)
- amount, allocatedAt

**project_pods** (many-to-many relationship)
- projectId (foreign key → projects)
- podId (foreign key → pods)

## 🔍 Viewing Your Data

### Option 1: Prisma Studio (Recommended)

Open a visual database editor:

```bash
npm run db:studio
```

Access at http://localhost:5555

### Option 2: PostgreSQL CLI

```bash
psql -h localhost -p 5432 -U postgres -d resource_inventory
```

Then run SQL queries:
```sql
SELECT * FROM resources;
SELECT * FROM pods;
SELECT * FROM projects;
```

### Option 3: GUI Tools

Use tools like:
- pgAdmin
- DBeaver
- TablePlus
- Postico (macOS)

**Connection details:**
- Host: localhost
- Port: 5432
- Database: resource_inventory
- Username: (your PostgreSQL username)
- Password: (your PostgreSQL password)

## 🔧 Troubleshooting

### Problem: "Connection refused" or "ECONNREFUSED"

**Solution:**
1. Check if PostgreSQL is running:
   ```bash
   pg_isready -h localhost -p 5432
   ```

2. Start PostgreSQL:
   ```bash
   brew services start postgresql@15
   # or
   pg_ctl -D /usr/local/var/postgres start
   ```

### Problem: "Authentication failed"

**Solution:**
1. Verify your credentials in `.env`
2. Try connecting with psql to test:
   ```bash
   psql -h localhost -p 5432 -U postgres
   ```

3. If password is wrong, you may need to reset it:
   ```bash
   # Connect as superuser
   psql postgres
   # Reset password
   ALTER USER postgres PASSWORD 'newpassword';
   ```

### Problem: "Database does not exist"

**Solution:**
The migration will create it automatically, but you can create it manually:

```bash
createdb resource_inventory
# or
psql -U postgres -c "CREATE DATABASE resource_inventory;"
```

### Problem: "Port 5432 already in use"

**Solution:**
Check what's using the port:
```bash
lsof -i :5432
```

If another PostgreSQL instance is running, either:
- Use that instance
- Stop it and use yours
- Change the port in your .env file

### Problem: ".env file not found"

**Solution:**
Make sure `.env` is in the project root:
```bash
cd /Users/stefanorigat/Documents/Code/resources
ls -la .env
```

If it doesn't exist, create it:
```bash
echo 'DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/resource_inventory?schema=public"' > .env
```

## 🔄 Resetting the Database

If you need to start fresh:

```bash
# Drop and recreate the database
psql -U postgres -c "DROP DATABASE resource_inventory;"
psql -U postgres -c "CREATE DATABASE resource_inventory;"

# Run migrations again
npm run db:migrate

# Seed data
npm run db:seed
```

## 📝 Making Schema Changes

When you modify `prisma/schema.prisma`:

1. Create a migration:
   ```bash
   npm run db:migrate
   ```

2. Or push changes directly (dev only):
   ```bash
   npm run db:push
   ```

3. Generate Prisma Client:
   ```bash
   npm run db:generate
   ```

## ✨ What Changed in Your App

### Before (In-Memory Storage)
- Data stored in React state
- Data lost on page refresh
- No persistence

### After (PostgreSQL)
- Data stored in PostgreSQL database
- Persistent across page refreshes and app restarts
- Proper relational database with foreign keys
- Type-safe database queries with Prisma

### API Endpoints Created

**Resources:**
- GET /api/resources - List all
- POST /api/resources - Create new
- GET /api/resources/[id] - Get one
- PATCH /api/resources/[id] - Update
- DELETE /api/resources/[id] - Delete

**Pods:**
- GET /api/pods - List all
- POST /api/pods - Create new
- GET /api/pods/[id] - Get one
- PATCH /api/pods/[id] - Update
- DELETE /api/pods/[id] - Delete

**Projects:**
- GET /api/projects - List all
- POST /api/projects - Create new
- GET /api/projects/[id] - Get one
- PATCH /api/projects/[id] - Update
- DELETE /api/projects/[id] - Delete

## 🎯 Next Steps

1. Complete the setup steps above
2. Test CRUD operations in the UI
3. Check Prisma Studio to see your data
4. (Optional) Customize the seed data in `prisma/seed.ts`
5. (Optional) Add more fields to the schema as needed

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Need help?** Check the troubleshooting section above or refer to `DATABASE_SETUP.md` for more details.

