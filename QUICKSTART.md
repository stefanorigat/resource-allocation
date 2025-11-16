# Quick Start Guide 🚀

## Start the Development Server

Run this command to start the application:

```bash
npm run dev
```

Then open your browser to: **http://localhost:3000**

## What You'll See

### 🏠 Dashboard (Home Page)
- **4 Statistics Cards**: Active resources, running pods, active projects, and utilization rate
- **Allocation Chart**: Visual representation of resource usage by type (compute, storage, memory, GPU, network)
- **Resources by Type**: Individual resource utilization bars
- **Recent Projects**: Quick overview of your projects

### 💾 Resources Page (`/resources`)
Click "Resources" in the navigation to:
- View all infrastructure resources in a table
- See capacity, availability, and utilization percentages
- Add new resources (CPU, Storage, Memory, GPU, Network)
- Edit or delete existing resources
- Color-coded status indicators

### 🎯 Pods Page (`/pods`)
Click "Pods" in the navigation to:
- View all pods in a card layout
- See allocated resources for each pod
- Create new pods and assign resources to them
- Edit pod configurations
- Track pod status (running, stopped, pending)

### 📁 Projects Page (`/projects`)
Click "Projects" in the navigation to:
- View detailed project cards
- See assigned pods and their status
- View resource allocations per project
- Assign multiple pods to a project
- Track project status and ownership

## Sample Data Included

The application comes with pre-populated sample data:

**Resources:**
- CPU Cluster 1 (100 cores)
- Storage Pool A (1000 TB)
- Memory Bank 1 (512 GB)
- GPU Array Alpha (16 units)
- Network Fabric 1 (10 Gbps)

**Pods:**
- web-frontend-pod
- api-backend-pod
- ml-training-pod

**Projects:**
- E-Commerce Platform
- AI Research Project

## Try These Actions

1. **Create a New Resource**
   - Go to Resources → Click "Add Resource"
   - Name: "GPU Cluster Beta"
   - Type: GPU
   - Capacity: 32 units
   - Available: 32 units
   - Status: Active

2. **Create a New Pod**
   - Go to Pods → Click "Add Pod"
   - Name: "data-processing-pod"
   - Description: "Data processing workload"
   - Status: Running
   - Allocate some resources from the dropdown

3. **Create a New Project**
   - Go to Projects → Click "Add Project"
   - Name: "Analytics Platform"
   - Owner: Your name
   - Status: Active
   - Add your newly created pod
   - Allocate resources

4. **Watch the Dashboard Update**
   - Return to the Dashboard
   - See your utilization metrics change
   - View updated allocation charts

## Key Features to Explore

✅ **Drag-free Modal Forms**: Click outside or press Cancel to close
✅ **Resource Validation**: Prevents over-allocation of resources
✅ **Color-coded Indicators**: Quick visual feedback on status and utilization
✅ **Responsive Design**: Works on mobile, tablet, and desktop
✅ **Real-time Updates**: Changes reflect immediately across all pages
✅ **TypeScript**: Full type safety throughout the application

## Important Notes

⚠️ **Data Persistence**: Currently, data is stored in memory (React Context). Refreshing the page will reset to the initial sample data.

⚠️ **Resource Tracking**: The system tracks allocations but doesn't automatically deduct from available resources. This allows you to experiment freely.

## Next Steps

Want to extend this application? Check out the README.md for ideas like:
- Adding a real database backend
- Implementing user authentication
- Adding real-time WebSocket updates
- Exporting data to CSV/JSON
- Adding notification alerts
- Implementing resource scheduling

## Need Help?

Check the full **README.md** for:
- Complete feature documentation
- Detailed data model
- Project structure
- Architecture overview
- Extension ideas

---

**Enjoy managing your resources! 🎉**

