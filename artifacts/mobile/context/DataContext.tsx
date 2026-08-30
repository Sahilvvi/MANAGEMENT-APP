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

export interface Business {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Worker {
  id: string;
  name: string;
  jobType: string;
  phone: string;
  business: string;
  salary: number;
  joinDate: string;
  address: string;
  attendance: "present" | "absent" | "late";
  managerId?: string;
  avatar?: string;
}

export interface Manager {
  id: string;
  name: string;
  phone: string;
  business: string;
  salary: number;
  joinDate: string;
  address: string;
  attendance: "present" | "absent" | "late";
  avatar?: string;
}

export type TaskRecurrence = "once" | "daily" | "weekly" | "monthly";
export type TaskStatus = "pending" | "in_progress" | "completed" | "overdue";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  business: string;
  priority: TaskPriority;
  status: TaskStatus;
  recurrence: TaskRecurrence;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  completionPhoto?: string;
  assignedBy?: string;
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

export interface Issue {
  id: string;
  title: string;
  description: string;
  cost: number;
  reportedBy: string;
  status: "open" | "approved" | "rejected" | "resolved";
  business: string;
  date: string;
  photo?: string;
}

interface DataContextType {
  // legacy
  verticals: Vertical[];
  employees: Employee[];
  assets: Asset[];
  finance: FinanceEntry[];
  incidents: Incident[];
  addFinanceEntry: (entry: Omit<FinanceEntry, "id">) => Promise<void>;
  addIncident: (incident: Omit<Incident, "id" | "date">) => Promise<void>;
  checkIn: (employeeId: string) => Promise<void>;
  totalRevenue: number;
  totalExpenses: number;

  // lawn
  businesses: Business[];
  workers: Worker[];
  managers: Manager[];
  tasks: Task[];
  issues: Issue[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTaskStatus: (id: string, status: Task["status"]) => Promise<void>;
  completeTask: (id: string, photoBase64?: string) => Promise<void>;
  addIssue: (issue: Omit<Issue, "id" | "date">) => Promise<void>;
  updateIssueStatus: (id: string, status: Issue["status"]) => Promise<void>;
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

const BUSINESSES: Business[] = [
  { id: "lawn", name: "Lawn Care", icon: "scissors", color: "#10B981" },
];

const WORKERS: Worker[] = [
  { id: "lawn-w1", name: "Raju", jobType: "Sweeper", phone: "9876543201", business: "lawn", salary: 12000, joinDate: "2023-04-15", address: "Village Green, Near Main Gate, Lucknow", attendance: "present", managerId: "lawn-m1" },
  { id: "lawn-w2", name: "Lakhan", jobType: "Cook", phone: "9876543202", business: "lawn", salary: 15000, joinDate: "2023-05-10", address: "Plot 12, Staff Quarters, Lucknow", attendance: "present", managerId: "lawn-m1" },
  { id: "lawn-w3", name: "Prem", jobType: "Cleaner A", phone: "9876543203", business: "lawn", salary: 13000, joinDate: "2023-06-01", address: "House 4, Green Park Colony, Lucknow", attendance: "late", managerId: "lawn-m1" },
  { id: "lawn-w4", name: "Kishan", jobType: "Multitasker", phone: "9876543204", business: "lawn", salary: 14000, joinDate: "2023-07-20", address: "Sector 7, Workers Lane, Lucknow", attendance: "present", managerId: "lawn-m1" },
  { id: "lawn-w5", name: "Suresh", jobType: "Cleaner B", phone: "9876543205", business: "lawn", salary: 12500, joinDate: "2024-01-08", address: "Near Workshop, Lawn Campus, Lucknow", attendance: "present", managerId: "lawn-m1" },
];

const MANAGERS: Manager[] = [
  { id: "lawn-m1", name: "Sunita Devi", phone: "9876543200", business: "lawn", salary: 28000, joinDate: "2022-11-20", address: "Manager Residence, Lawn Care Office, Lucknow", attendance: "present" },
];

function isoDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

const today = isoDate(0);
const yesterday = isoDate(-1);

const TASK_TEMPLATES: Record<string, [string, string]> = {
  "lawn-w1": ["Sweep all pathways", "Pre-shift pathway check"],
  "lawn-w2": ["Prepare team lunch", "Clean kitchen area"],
  "lawn-w3": ["Mop pavilion floor", "Dust outdoor furniture"],
  "lawn-w4": ["Collect garden waste", "Assist equipment move"],
  "lawn-w5": ["Clean washrooms", "Refill supplies"],
};

function generateLawnTasks(): Task[] {
  const tasks: Task[] = [];
  let idCounter = 1;

  WORKERS.forEach((worker) => {
    const [primaryTask, secondaryTask] = TASK_TEMPLATES[worker.id];
    for (let dayOffset = -29; dayOffset < 0; dayOffset++) {
      const date = isoDate(dayOffset);
      const seed = worker.id.length + dayOffset;
      const completed1 = seed % 5 !== 0;
      const completed2 = (seed + 1) % 5 !== 0;

      tasks.push({
        id: `lt${idCounter++}`,
        title: primaryTask,
        description: `Daily ${worker.jobType.toLowerCase()} work for ${date}.`,
        assigneeId: worker.id,
        assigneeName: worker.name,
        business: "lawn",
        priority: "high",
        status: completed1 ? "completed" : "pending",
        recurrence: "daily",
        dueDate: date,
        createdAt: date,
        completedAt: completed1 ? date : undefined,
        assignedBy: "Sunita Devi",
      });

      tasks.push({
        id: `lt${idCounter++}`,
        title: secondaryTask,
        description: `Secondary ${worker.jobType.toLowerCase()} task for ${date}.`,
        assigneeId: worker.id,
        assigneeName: worker.name,
        business: "lawn",
        priority: "medium",
        status: completed2 ? "completed" : "pending",
        recurrence: "daily",
        dueDate: date,
        createdAt: date,
        completedAt: completed2 ? date : undefined,
        assignedBy: "Sunita Devi",
      });
    }
  });

  WORKERS.forEach((worker) => {
    const [primaryTask, secondaryTask] = TASK_TEMPLATES[worker.id];
    tasks.push({
      id: `lt${idCounter++}`,
      title: primaryTask,
      description: `Daily ${worker.jobType.toLowerCase()} work for today.`,
      assigneeId: worker.id,
      assigneeName: worker.name,
      business: "lawn",
      priority: "high",
      status: "pending",
      recurrence: "daily",
      dueDate: today,
      createdAt: yesterday,
      assignedBy: "Sunita Devi",
    });
    tasks.push({
      id: `lt${idCounter++}`,
      title: secondaryTask,
      description: `Secondary ${worker.jobType.toLowerCase()} task for today.`,
      assigneeId: worker.id,
      assigneeName: worker.name,
      business: "lawn",
      priority: "medium",
      status: "completed",
      recurrence: "daily",
      dueDate: today,
      createdAt: yesterday,
      completedAt: today,
      assignedBy: "Sunita Devi",
    });
  });

  return tasks;
}

const LAWN_TASKS: Task[] = generateLawnTasks();

const ISSUES: Issue[] = [
  { id: "iss1", title: "Broken sprinkler", description: "South lawn sprinkler head is leaking and needs replacement.", cost: 450, reportedBy: "Sunita Devi", status: "open", business: "lawn", date: yesterday },
];

const STORAGE_KEY = "@lawn_data";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(LAWN_TASKS);
  const [finance, setFinance] = useState<FinanceEntry[]>(FINANCE);
  const [incidents, setIncidents] = useState<Incident[]>(INCIDENTS);
  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES);
  const [issues, setIssues] = useState<Issue[]>(ISSUES);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.tasks) setTasks(parsed.tasks);
          if (parsed.issues) setIssues(parsed.issues);
        } catch {}
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, issues }));
  }, [tasks, issues]);

  const addTask = async (task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...task,
      id: `lt${Date.now()}`,
      createdAt: isoDate(0),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTaskStatus = async (id: string, status: Task["status"]) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const completeTask = async (id: string, photoBase64?: string) => {
    const now = isoDate(0);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: "completed", completedAt: now, completionPhoto: photoBase64 }
          : t
      )
    );
  };

  const addIssue = async (issue: Omit<Issue, "id" | "date">) => {
    const newIssue: Issue = { ...issue, id: `iss${Date.now()}`, date: isoDate(0) };
    setIssues((prev) => [newIssue, ...prev]);
  };

  const updateIssueStatus = async (id: string, status: Issue["status"]) => {
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const addFinanceEntry = async (entry: Omit<FinanceEntry, "id">) => {
    const newEntry: FinanceEntry = { ...entry, id: Date.now().toString() };
    setFinance((prev) => [newEntry, ...prev]);
  };

  const addIncident = async (incident: Omit<Incident, "id" | "date">) => {
    const newIncident: Incident = { ...incident, id: Date.now().toString(), date: isoDate(0) };
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
        assets: ASSETS,
        finance,
        incidents,
        addFinanceEntry,
        addIncident,
        checkIn,
        totalRevenue,
        totalExpenses,

        businesses: BUSINESSES,
        workers: WORKERS,
        managers: MANAGERS,
        tasks,
        issues,
        addTask,
        updateTaskStatus,
        completeTask,
        addIssue,
        updateIssueStatus,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
