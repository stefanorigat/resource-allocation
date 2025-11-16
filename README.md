# Resource Inventory Management System

A modern web-based resource inventory system built with Next.js 15, TypeScript, Tailwind CSS, and PostgreSQL. This application helps you manage infrastructure resources and allocate them to pods and projects with persistent database storage.

## Features

### 📊 Dashboard
- Real-time overview of active resources, running pods, and active projects
- Resource utilization tracking with color-coded indicators
- Visual allocation charts showing resource usage by type
- Recent projects overview with status tracking

### 💾 Resource Management
- Create, read, update, and delete infrastructure resources
- Support for multiple resource types:
  - **Compute**: CPU cores and processing power
  - **Storage**: Disk space and storage capacity
  - **Memory**: RAM and memory allocation
  - **Network**: Bandwidth and network capacity
  - **GPU**: Graphics processing units
- Track capacity, availability, and utilization rates
- Monitor resource status (active, maintenance, offline)

### 🎯 Pod Management
- Manage containerized workloads (pods)
- Allocate resources to individual pods
- Track pod status (running, stopped, pending)
- View resource allocations per pod
- Card-based interface for easy pod management

### 📁 Project Management
- Create and manage projects with detailed information
- Assign multiple pods to projects
- Allocate resources directly to projects
- Track project status (active, on-hold, completed)
- View comprehensive project details including:
  - Assigned pods with their current status
  - Resource allocations by type
  - Creation and update timestamps

### 📈 Allocation Tracking
- Interactive allocation charts with visual progress bars
- Resource grouping by type
- Real-time capacity vs. allocated vs. available tracking
- Color-coded utilization indicators (green < 60%, orange < 80%, red ≥ 80%)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **State Management**: React Context API with API Routes
- **Icons**: Heroicons (via inline SVG)

## Project Structure

```
resources/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Dashboard page
│   ├── resources/           # Resources management page
│   ├── pods/                # Pods management page
│   └── projects/            # Projects management page
├── components/              # Reusable React components
│   ├── Navigation.tsx       # Top navigation bar
│   ├── StatCard.tsx         # Statistics card component
│   ├── AllocationChart.tsx  # Resource allocation visualization
│   ├── ResourceModal.tsx    # Resource create/edit modal
│   ├── PodModal.tsx         # Pod create/edit modal
│   └── ProjectModal.tsx     # Project create/edit modal
├── context/                 # React Context providers
│   └── DataContext.tsx      # Global state management
├── lib/                     # Utility functions and data
│   └── data.ts             # Initial mock data
├── types/                   # TypeScript type definitions
│   └── index.ts            # All interface definitions
└── public/                  # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+ running on localhost:5432
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd /Users/stefanorigat/Documents/Code/resources
```

2. Install dependencies (already installed):
```bash
npm install
```

3. **Set up PostgreSQL database** (REQUIRED):

   **Quick setup (3 steps):**
   ```bash
   # Step 1: Create .env file with your PostgreSQL credentials
   echo 'DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/resource_inventory?schema=public"' > .env
   
   # Step 2: Run migrations to create database tables
   npm run db:migrate
   
   # Step 3: Seed database with sample data
   npm run db:seed
   ```
   
   **Or use the automated setup script:**
   ```bash
   ./setup-database.sh
   ```
   
   📚 **See detailed setup guide:** [QUICK_START_DATABASE.md](./QUICK_START_DATABASE.md)

4. Run the development server:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

### Available Scripts

**Development:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Database:**
- `npm run db:migrate` - Create and run migrations
- `npm run db:push` - Push schema changes (dev only)
- `npm run db:generate` - Generate Prisma Client
- `npm run db:studio` - Open Prisma Studio (visual database editor)
- `npm run db:seed` - Seed database with sample data

## Usage Guide

### Managing Resources

1. Navigate to the **Resources** page
2. Click **Add Resource** to create a new resource
3. Fill in the details:
   - Name (e.g., "CPU Cluster 1")
   - Type (compute, storage, memory, network, gpu)
   - Capacity and unit
   - Available amount
   - Status
4. Click **Save** to create the resource
5. Use **Edit** or **Delete** buttons to modify existing resources

### Creating Pods

1. Navigate to the **Pods** page
2. Click **Add Pod**
3. Enter pod information:
   - Name and description
   - Status
4. Add resource allocations:
   - Select a resource from the dropdown
   - Enter the amount to allocate
   - Click **Add**
5. Click **Save** to create the pod

### Managing Projects

1. Navigate to the **Projects** page
2. Click **Add Project**
3. Fill in project details:
   - Name, description, and owner
   - Status
4. Assign pods to the project:
   - Select pods from the dropdown
   - Click **Add**
5. Allocate resources:
   - Select resource and amount
   - Click **Add**
6. Click **Save** to create the project

## Data Model

### Resource
```typescript
{
  id: string
  name: string
  type: 'compute' | 'storage' | 'memory' | 'network' | 'gpu'
  capacity: number
  unit: string
  available: number
  status: 'active' | 'maintenance' | 'offline'
  createdAt: Date
  updatedAt: Date
}
```

### Pod
```typescript
{
  id: string
  name: string
  description: string
  status: 'running' | 'stopped' | 'pending'
  allocatedResources: ResourceAllocation[]
  createdAt: Date
  updatedAt: Date
}
```

### Project
```typescript
{
  id: string
  name: string
  description: string
  owner: string
  status: 'active' | 'completed' | 'on-hold'
  pods: string[]
  allocatedResources: ResourceAllocation[]
  createdAt: Date
  updatedAt: Date
}
```

## Features to Extend

This project is designed to be easily extensible. Here are some ideas:

1. **Backend Integration**: Replace the Context API with a real backend (e.g., Node.js + PostgreSQL)
2. **User Authentication**: Add user login and role-based access control
3. **Real-time Updates**: Implement WebSocket connections for live updates
4. **Export/Import**: Add CSV/JSON export and import functionality
5. **Advanced Filtering**: Add search and filtering capabilities
6. **History Tracking**: Implement audit logs and change history
7. **Notifications**: Add alerts for resource capacity warnings
8. **Multi-tenancy**: Support for multiple organizations/teams
9. **Advanced Visualizations**: Add more charts (pie charts, time series, etc.)
10. **Resource Scheduling**: Implement resource booking and scheduling

## Database & Data Persistence

- ✅ **PostgreSQL database** for persistent storage
- ✅ Data survives page refreshes and server restarts
- ✅ **Prisma ORM** for type-safe database queries
- ✅ RESTful API routes for all CRUD operations
- ✅ Relational data model with foreign keys
- ✅ **Prisma Studio** available for visual database management

## Best Practices

- Resource allocations are tracked in the database
- Modal forms include validation for resource availability
- Responsive design works on mobile, tablet, and desktop
- Color-coded status indicators for quick visual feedback
- Type-safe API routes with TypeScript
- Database migrations for schema version control

## Contributing

To contribute to this project:

1. Create a new feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is created for educational and demonstration purposes.
