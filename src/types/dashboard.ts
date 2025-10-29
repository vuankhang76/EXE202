// Dashboard Types based on DashboardController & DashboardDTOs

export interface DashboardOverview {
  // Basic Stats
  totalPatients: number;
  totalDoctors: number;
  totalStaff: number;
  
  // Today's Activity
  todayAppointments: number;
  upcomingReminders: number;
  overdueReminders: number;
  unreadNotifications: number;
  
  // Period Stats
  totalConsultations: number;
  totalNotifications: number;
  notificationReadRate: number;
  
  // Business KPIs
  totalRevenue: number;
  newPatientsThisMonth: number;
  totalServiceOrders: number;
  patientReturnRate: number;
  overduePaymentAmount: number;
  
  // Revenue Trends
  revenueByMonth: Record<string, number>;
  revenueByDay: Record<string, number>;
  
  // Service Usage
  topServices: Record<string, number>;
  serviceRevenue: Record<string, number>;
  
  // Charts Data
  consultationsByDay: Record<string, number>;
  topDiagnosis: Record<string, number>;
  notificationsByChannel: Record<string, number>;
  
  // Date Range
  fromDate: string;
  toDate: string;
  lastUpdated: string;
}

export interface DashboardCharts {
  chartType: string;
  groupBy: string;
  fromDate: string;
  toDate: string;
  
  // Appointment Charts
  appointmentsByDay: Record<string, number>;
  appointmentsByStatus: Record<string, number>;
  appointmentsByType: Record<string, number>;
  
  // Consultation Charts
  consultationsByDay: Record<string, number>;
  topDiagnosis: Record<string, number>;
  
  // Measurement Charts
  measurementsByType: Record<string, number>;
  measurementTrends: Record<string, number>;
  
  // Notification Charts
  notificationsByDay: Record<string, number>;
  notificationsByChannel: Record<string, number>;
  
  // Care Plan Charts
  carePlansByStatus: Record<string, number>;
  carePlanProgress: Record<string, number>;
}

export interface RevenueAnalytics {
  // KPI Cards
  totalRevenue: number;
  revenueGrowth: number;
  
  newPatients: number;
  patientGrowth: number;
  
  totalServiceOrders: number;
  orderGrowth: number;
  
  patientReturnRate: number;
  returnRateChange: number;
  
  overduePaymentAmount: number;
  overdueChange: number;
  
  // Charts Data
  revenueByMonth: Record<string, number>;
  topServices: Record<string, number>;
  serviceRevenueDistribution: Record<string, number>;
  
  fromDate: string;
  toDate: string;
  lastUpdated: string;
}

export interface RecentOrder {
  orderId: string;
  customerName: string;
  doctorName: string;
  serviceType: string;
  status: string;
  appointmentTime: string;
}

export interface DashboardWidget {
  title: string;
  value: string;
  icon: string;
  color: string;
  trend: 'up' | 'down' | 'stable';
  description?: string;
  link?: string;
}
