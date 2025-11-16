#!/bin/bash

# Resource Inventory - PostgreSQL Setup Script
# This script helps you set up the PostgreSQL database

echo "🗄️  Resource Inventory - Database Setup"
echo "========================================"
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ Found .env file"
else
    echo "❌ .env file not found!"
    echo ""
    echo "Please create a .env file with your PostgreSQL credentials:"
    echo 'DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/resource_inventory?schema=public"'
    echo ""
    echo "Example:"
    echo 'DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/resource_inventory?schema=public"'
    echo ""
    read -p "Press Enter to create .env file now, or Ctrl+C to exit..."
    
    read -p "Enter PostgreSQL username (default: postgres): " DB_USER
    DB_USER=${DB_USER:-postgres}
    
    read -sp "Enter PostgreSQL password: " DB_PASS
    echo ""
    
    echo "DATABASE_URL=\"postgresql://${DB_USER}:${DB_PASS}@localhost:5432/resource_inventory?schema=public\"" > .env
    echo "✅ Created .env file"
    echo ""
fi

# Check if PostgreSQL is running
echo "📡 Checking PostgreSQL connection..."
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL is not running on localhost:5432"
    echo ""
    echo "Please start PostgreSQL and try again."
    echo "Example: brew services start postgresql@15"
    exit 1
fi

echo ""
echo "🔨 Running database migrations..."
npm run db:migrate -- --name init

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
else
    echo "❌ Migration failed. Please check the error above."
    exit 1
fi

echo ""
echo "🌱 Seeding database with sample data..."
npm run db:seed

if [ $? -eq 0 ]; then
    echo "✅ Database seeded successfully"
else
    echo "❌ Seeding failed. Please check the error above."
    exit 1
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "📊 View your data:"
echo "   - Prisma Studio: npm run db:studio"
echo "   - psql: psql -U postgres -d resource_inventory"
echo ""
echo "🚀 Start the app:"
echo "   npm run dev"
echo ""
echo "Visit: http://localhost:3000"

