# 🚀 Quick Start - PostgreSQL Integration

## Your Credentials Needed

Please provide or confirm your PostgreSQL connection details:

- **Host:** localhost
- **Port:** 5432
- **Username:** (e.g., `postgres`)
- **Password:** (your PostgreSQL password)
- **Database Name:** `resource_inventory` (will be created automatically)

## ⚡ Quick Setup (3 Steps)

### 1. Create `.env` file

```bash
echo 'DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/resource_inventory?schema=public"' > .env
```

**Replace `USERNAME` and `PASSWORD` with your PostgreSQL credentials!**

Example:
```bash
echo 'DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/resource_inventory?schema=public"' > .env
```

### 2. Run Migration

```bash
npm run db:migrate
```

When prompted for migration name, type: `init`

### 3. Seed Database

```bash
npm run db:seed
```

### 4. Start App

```bash
npm run dev
```

Visit http://localhost:3000 - You're done! 🎉

## 📝 What You Need to Know

Your application now:
- ✅ Stores data in PostgreSQL (persistent storage)
- ✅ Has full CRUD API endpoints
- ✅ Includes sample data (5 resources, 3 pods, 2 projects)
- ✅ Data survives page refreshes and app restarts

## 🎯 Common Connection Strings

**Default local PostgreSQL:**
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/resource_inventory?schema=public"
```

**If you use a different username:**
```
DATABASE_URL="postgresql://yourusername:yourpassword@localhost:5432/resource_inventory?schema=public"
```

**If PostgreSQL is on a different port:**
```
DATABASE_URL="postgresql://postgres:password@localhost:5433/resource_inventory?schema=public"
```

## ❌ If Something Goes Wrong

**Can't connect?**
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# If not running, start it
brew services start postgresql@15
```

**Authentication failed?**
- Double-check your username and password in `.env`
- Try connecting with: `psql -U postgres`

**Need to start over?**
```bash
# Reset everything
psql -U postgres -c "DROP DATABASE IF EXISTS resource_inventory;"
npm run db:migrate
npm run db:seed
```

## 📊 View Your Data

**Option 1 - Prisma Studio (Easiest):**
```bash
npm run db:studio
```
Opens visual editor at http://localhost:5555

**Option 2 - PostgreSQL CLI:**
```bash
psql -U postgres -d resource_inventory
```

Then run:
```sql
SELECT * FROM resources;
SELECT * FROM pods;
SELECT * FROM projects;
```

---

**Full documentation:** See `POSTGRESQL_SETUP.md` for complete details and troubleshooting.

