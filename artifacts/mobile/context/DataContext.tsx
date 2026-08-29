import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Vertical {
  id: string;
  name: string;
  icon: string;
  color: string;
  revenue: number;
  revenueChange: number;
  employees: number;
  alerts: number;
  tasks: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  vertical: string;
  score: number;
  attendance: "present" | "absent" | "late";
  checkInTime?: string;
  location?: string;
  fines: number;
  bonus: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  vertical: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_progress" | "completed" | "overdue";
  dueDate: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  type: "fixed" | "movable" | "consumable";
  category: string;
  location: string;
  status: "operational" | "maintenance" | "retired" | "available";
  lastMaintenance: string;
  nextMaintenance: string;
  value: number;
  vertical: string;
  photo?: string;
}

export interface FinanceEntry {
  id: string;
  description: string;
  amount: number;
  type: "revenue" | "expense";
  category: string;
  vertical: string;
  date: string;
  photo?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  reportedBy: string;
  vertical: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved";
  date: string;
}

interface DataContextType {
  verticals: Vertical[];
  employees: Employee[];
  tasks: Task[];
  assets: Asset[];
  finance: FinanceEntry[];
  incidents: Incident[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTaskStatus: (id: string, status: Task["status"]) => Promise<void>;
  addFinanceEntry: (entry: Omit<FinanceEntry, "id">) => Promise<void>;
  addIncident: (incident: Omit<Incident, "id" | "date">) => Promise<void>;
  checkIn: (employeeId: string) => Promise<void>;
  totalRevenue: number;
  totalExpenses: number;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

const VERTICALS: Vertical[] = [
  { id: "healthcare", name: "Healthcare", icon: "heart", color: "#FF6B6B", revenue: 1240000, revenueChange: 12.4, employees: 84, alerts: 2, tasks: 14 },
  { id: "petroleum", name: "Petroleum", icon: "droplet", color: "#4ECDC4", revenue: 3800000, revenueChange: -3.2, employees: 56, alerts: 5, tasks: 8 },
  { id: "agriculture", name: "Agriculture", icon: "feather", color: "#45B7D1", revenue: 890000, revenueChange: 8.7, employees: 120, alerts: 1, tasks: 22 },
  { id: "mining", name: "Mining", icon: "layers", color: "#96CEB4", revenue: 2100000, revenueChange: 5.1, employees: 200, alerts: 8, tasks: 31 },
  { id: "hospitality", name: "Hospitality", icon: "home", color: "#FFEAA7", revenue: 650000, revenueChange: 18.3, employees: 95, alerts: 0, tasks: 18 },
  { id: "ngo", name: "NGO", icon: "users", color: "#DDA0DD", revenue: 420000, revenueChange: 2.1, employees: 43, alerts: 0, tasks: 9 },
  { id: "corporate", name: "Corporate", icon: "briefcase", color: "#87CEEB", revenue: 1890000, revenueChange: 7.8, employees: 67, alerts: 3, tasks: 25 },
  { id: "realestate", name: "Real Estate", icon: "map-pin", color: "#F0A500", revenue: 3200000, revenueChange: 15.6, employees: 38, alerts: 1, tasks: 12 },
  { id: "technology", name: "Technology", icon: "cpu", color: "#98FB98", revenue: 2750000, revenueChange: 22.4, employees: 89, alerts: 0, tasks: 41 },
];

const EMPLOYEES: Employee[] = [
  { id: "e1", name: "Arjun Sharma", role: "Senior Nurse", department: "ICU", vertical: "healthcare", score: 92, attendance: "present", checkInTime: "08:02", location: "Main Hospital", fines: 0, bonus: 500 },
  { id: "e2", name: "Priya Nair", role: "Field Engineer", department: "Drilling", vertical: "petroleum", score: 78, attendance: "late", checkInTime: "09:15", location: "Site B", fines: 200, bonus: 0 },
  { id: "e3", name: "Rahul Gupta", role: "Farm Manager", department: "Operations", vertical: "agriculture", score: 88, attendance: "present", checkInTime: "07:45", location: "Farm North", fines: 0, bonus: 300 },
  { id: "e4", name: "Sneha Patel", role: "Safety Officer", department: "Mining Ops", vertical: "mining", score: 95, attendance: "present", checkInTime: "08:00", location: "Shaft 3", fines: 0, bonus: 800 },
  { id: "e5", name: "Vikram Reddy", role: "Chef de Cuisine", department: "F&B", vertical: "hospitality", score: 71, attendance: "absent", fines: 500, bonus: 0 },
  { id: "e6", name: "Ananya Singh", role: "Project Lead", department: "Development", vertical: "ngo", score: 84, attendance: "present", checkInTime: "09:00", location: "HQ", fines: 0, bonus: 200 },
  { id: "e7", name: "Rohan Mehta", role: "Sales Manager", department: "Business Dev", vertical: "corporate", score: 89, attendance: "present", checkInTime: "08:30", location: "Office Tower", fines: 0, bonus: 1200 },
  { id: "e8", name: "Kavitha Iyer", role: "Property Manager", department: "Leasing", vertical: "realestate", score: 76, attendance: "present", checkInTime: "09:05", location: "Downtown Office", fines: 100, bonus: 0 },
  { id: "e9", name: "Deepak Joshi", role: "Lead Developer", department: "Engineering", vertical: "technology", score: 97, attendance: "present", checkInTime: "08:55", location: "Tech Hub", fines: 0, bonus: 2000 },
  { id: "e10", name: "Meena Krishnan", role: "Accountant", department: "Finance", vertical: "corporate", score: 91, attendance: "present", checkInTime: "08:10", location: "Finance Wing", fines: 0, bonus: 600 },
];

const TASKS: Task[] = [
  { id: "t1", title: "Equipment maintenance check", description: "Monthly check on all ICU equipment", assigneeId: "e1", assigneeName: "Arjun Sharma", vertical: "healthcare", priority: "high", status: "in_progress", dueDate: "2026-05-03", createdAt: "2026-04-28" },
  { id: "t2", title: "Safety inspection report", description: "Submit Q2 safety inspection for shaft 3", assigneeId: "e4", assigneeName: "Sneha Patel", vertical: "mining", priority: "critical", status: "pending", dueDate: "2026-05-04", createdAt: "2026-04-29" },
  { id: "t3", title: "Crop yield assessment", description: "Document yield from north farm sector", assigneeId: "e3", assigneeName: "Rahul Gupta", vertical: "agriculture", priority: "medium", status: "in_progress", dueDate: "2026-05-05", createdAt: "2026-04-27" },
  { id: "t4", title: "Client presentation prep", description: "Prepare Q2 report for key clients", assigneeId: "e7", assigneeName: "Rohan Mehta", vertical: "corporate", priority: "high", status: "pending", dueDate: "2026-05-06", createdAt: "2026-04-30" },
  { id: "t5", title: "Lease renewal follow-ups", description: "Follow up on 8 expiring leases", assigneeId: "e8", assigneeName: "Kavitha Iyer", vertical: "realestate", priority: "medium", status: "completed", dueDate: "2026-05-01", createdAt: "2026-04-25" },
  { id: "t6", title: "Pipeline pressure review", description: "Inspect pressure readings on pipeline B", assigneeId: "e2", assigneeName: "Priya Nair", vertical: "petroleum", priority: "critical", status: "overdue", dueDate: "2026-05-01", createdAt: "2026-04-26" },
  { id: "t7", title: "Feature deployment", description: "Deploy v2.3 to production environment", assigneeId: "e9", assigneeName: "Deepak Joshi", vertical: "technology", priority: "high", status: "in_progress", dueDate: "2026-05-07", createdAt: "2026-04-30" },
  { id: "t8", title: "Menu revision", description: "Update seasonal menu items", assigneeId: "e5", assigneeName: "Vikram Reddy", vertical: "hospitality", priority: "low", status: "pending", dueDate: "2026-05-10", createdAt: "2026-05-01" },
];

const ASSETS: Asset[] = [
  { id: "a1", name: "MRI Machine Unit 1", type: "fixed", category: "Medical Equipment", location: "Radiology Dept", status: "operational", lastMaintenance: "2026-03-15", nextMaintenance: "2026-06-15", value: 1800000, vertical: "healthcare" },
  { id: "a2", name: "Drilling Rig Alpha", type: "fixed", category: "Drilling Equipment", location: "Site B", status: "maintenance", lastMaintenance: "2026-04-01", nextMaintenance: "2026-05-01", value: 5200000, vertical: "petroleum" },
  { id: "a3", name: "Harvester HD-500", type: "movable", category: "Agricultural Machinery", location: "Farm North", status: "operational", lastMaintenance: "2026-04-20", nextMaintenance: "2026-07-20", value: 380000, vertical: "agriculture" },
  { id: "a4", name: "Excavator CAT 395", type: "movable", category: "Mining Equipment", location: "Shaft 3", status: "operational", lastMaintenance: "2026-04-10", nextMaintenance: "2026-05-10", value: 2100000, vertical: "mining" },
  { id: "a5", name: "Hotel Van Fleet #3", type: "movable", category: "Vehicles", location: "Hospitality HQ", status: "available", lastMaintenance: "2026-04-25", nextMaintenance: "2026-07-25", value: 85000, vertical: "hospitality" },
  { id: "a6", name: "Server Rack Cluster A", type: "fixed", category: "IT Infrastructure", location: "Data Center", status: "operational", lastMaintenance: "2026-04-15", nextMaintenance: "2026-07-15", value: 450000, vertical: "technology" },
];

const FINANCE: FinanceEntry[] = [
  { id: "f1", description: "Patient services revenue", amount: 420000, type: "revenue", category: "Services", vertical: "healthcare", date: "2026-05-01" },
  { id: "f2", description: "Crude oil export", amount: 1200000, type: "revenue", category: "Exports", vertical: "petroleum", date: "2026-05-01" },
  { id: "f3", description: "Equipment maintenance", amount: 85000, type: "expense", category: "Maintenance", vertical: "petroleum", date: "2026-04-30" },
  { id: "f4", description: "Harvest sales - Q2", amount: 310000, type: "revenue", category: "Produce", vertical: "agriculture", date: "2026-05-01" },
  { id: "f5", description: "Staff salaries", amount: 680000, type: "expense", category: "Payroll", vertical: "corporate", date: "2026-04-30" },
  { id: "f6", description: "Hotel occupancy revenue", amount: 215000, type: "revenue", category: "Occupancy", vertical: "hospitality", date: "2026-05-01" },
  { id: "f7", description: "Software licenses", amount: 42000, type: "expense", category: "Software", vertical: "technology", date: "2026-04-29" },
  { id: "f8", description: "Property leasing income", amount: 890000, type: "revenue", category: "Leasing", vertical: "realestate", date: "2026-05-01" },
];

const INCIDENTS: Incident[] = [
  { id: "i1", title: "Pressure anomaly detected", description: "Unusual pressure spike in pipeline section B4", reportedBy: "Priya Nair", vertical: "petroleum", severity: "high", status: "investigating", date: "2026-05-01" },
  { id: "i2", title: "Unauthorized access attempt", description: "Badge scan denied at restricted area twice", reportedBy: "Sneha Patel", vertical: "mining", severity: "medium", status: "investigating", date: "2026-04-30" },
  { id: "i3", title: "HVAC malfunction", description: "HVAC unit in ward 3 showing error codes", reportedBy: "Arjun Sharma", vertical: "healthcare", severity: "medium", status: "open", date: "2026-05-02" },
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [finance, setFinance] = useState<FinanceEntry[]>(FINANCE);
  const [incidents, setIncidents] = useState<Incident[]>(INCIDENTS);
  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES);

  const addTask = async (task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = { ...task, id: Date.now().toString(), createdAt: new Date().toISOString().split("T")[0] };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTaskStatus = async (id: string, status: Task["status"]) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const addFinanceEntry = async (entry: Omit<FinanceEntry, "id">) => {
    const newEntry: FinanceEntry = { ...entry, id: Date.now().toString() };
    setFinance((prev) => [newEntry, ...prev]);
  };

  const addIncident = async (incident: Omit<Incident, "id" | "date">) => {
    const newIncident: Incident = { ...incident, id: Date.now().toString(), date: new Date().toISOString().split("T")[0] };
    setIncidents((prev) => [newIncident, ...prev]);
  };

  const checkIn = async (employeeId: string) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === employeeId ? { ...e, attendance: "present", checkInTime: time } : e
      )
    );
  };

  const totalRevenue = finance.filter((f) => f.type === "revenue").reduce((sum, f) => sum + f.amount, 0);
  const totalExpenses = finance.filter((f) => f.type === "expense").reduce((sum, f) => sum + f.amount, 0);

  return (
    <DataContext.Provider
      value={{
        verticals: VERTICALS,
        employees,
        tasks,
        assets: ASSETS,
        finance,
        incidents,
        addTask,
        updateTaskStatus,
        addFinanceEntry,
        addIncident,
        checkIn,
        totalRevenue,
        totalExpenses,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
