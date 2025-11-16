# 🚀 START HERE - PostgreSQL Database Setup

Your Resource Inventory application now uses **PostgreSQL** for persistent data storage!

## 📋 I Need Your PostgreSQL Credentials

To complete the setup, I need your PostgreSQL connection details:

### Required Information:
- **Host:** localhost
- **Port:** 5432
- **Username:** _____  (e.g., `postgres`)
- **Password:** _____  (your PostgreSQL password)
- **Database:** resource_inventory (will be created automatically)

## ⚡ Quick Setup (Copy & Paste These Commands)

### Step 1: Create .env File

Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your actual PostgreSQL credentials:

```bash
echo 'DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/resource_inventory?schema=public"' > .env
```

**Example if your username is `postgres` and password is `mypassword`:**
```bash
echo 'DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/resource_inventory?schema=public"' > .env
```

### Step 2: Run Setup

**Option A - Automated (Recommended):**
```bash
./setup-database.sh
```

**Option B - Manual:**
```bash
npm run db:migrate     # Creates database tables
npm run db:seed        # Adds sample data
npm run dev            # Starts the app
```

### Step 3: Access Your App

Visit: **http://localhost:3000**

## ✅ Verify It's Working

### Test 1: Check API
```bash
curl http://localhost:3000/api/resources
```
Should return JSON with resources data.

### Test 2: View Database
```bash
npm run db:studio
```
Opens visual editor at http://localhost:5555

### Test 3: Use the UI
1. Go to http://localhost:3000
2. Create a new resource
3. Refresh the page
4. ✅ If the resource is still there, it's working!

## 📚 Documentation

- **Quick Start:** [QUICK_START_DATABASE.md](./QUICK_START_DATABASE.md)
- **Full Guide:** [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)
- **What Changed:** [POSTGRESQL_INTEGRATION_SUMMARY.md](./POSTGRESQL_INTEGRATION_SUMMARY.md)

## ❓ Need Help?

### PostgreSQL Not Running?
```bash
# Check if it's running
pg_isready -h localhost -p 5432

# Start it (macOS with Homebrew)
brew services start postgresql@15
```

### Wrong Password?
- Double-check your .env file
- Test with: `psql -U postgres`

### Connection String Examples

**Default local setup:**
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/resource_inventory?schema=public"
```

**Custom username:**
```
DATABASE_URL="postgresql://myuser:mypass@localhost:5432/resource_inventory?schema=public"
```

**Different port:**
```
DATABASE_URL="postgresql://postgres:mypass@localhost:5433/resource_inventory?schema=public"
```

## 🎉 What You'll Get

After setup, your application will have:
- ✅ Persistent data storage (no data loss on refresh)
- ✅ 5 sample resources
- ✅ 3 sample pods
- ✅ 2 sample projects
- ✅ Full CRUD API
- ✅ Visual database editor (Prisma Studio)

## 🆘 Still Stuck?

Please provide:
1. Your PostgreSQL username
2. The output of: `pg_isready -h localhost -p 5432`
3. Any error messages you see

---

**Once you provide your credentials or run the setup, you're ready to go!**

