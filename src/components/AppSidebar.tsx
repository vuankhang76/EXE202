import * as React from "react"
import {
  UserRound,
  ClipboardList,
  UserCog,
  MessageCirclePlus,
  CalendarDays,
  Home,
  Settings,
  Building2,
  Users,
  DollarSign,
  Receipt,
  TrendingUp
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

import { NavMain } from "@/components/NavMain"
import { NavUser } from "@/components/NavUser"
import { Profile } from "@/components/Profile"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter, 
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/Sidebar"

const navigationData = {
  navMain: [
    {
      title: "Lịch hẹn và tái khám",
      url: "/clinic/appointments",
      icon: CalendarDays,
    },
    {
      title: "Đơn dịch vụ và thanh toán",
      url: "/clinic/orders",
      icon: ClipboardList,
    },
    {
      title: "Bệnh án",
      url: "/clinic/patients",
      icon: UserRound,
    },
    {
      title: "Giao tiếp và tư vấn từ xa",
      url: "/clinic/consultations",
      icon: MessageCirclePlus,
    },
  ],
  
  navServices: [
    {
      title: "Tổng quan",
      url: "/clinic/dashboard",
      icon: Home,
    },
    {
      title: "Quản lý tài khoản",
      url: "/clinic/accounts",
      icon: UserCog,
    },
    {
      title: "Tài chính",
      icon: DollarSign,
      items: [
        {
          title: "Giao dịch",
          url: "/clinic/finance/transactions",
          icon: Receipt,
        },
        {
          title: "Doanh thu",
          url: "/clinic/finance/revenue",
          icon: TrendingUp,
        },
      ],
    },
    {
      title: "Cài đặt phòng khám",
      url: "/clinic/settings",
      icon: Settings,
    },
  ],

  superAdminNav: [
    {
      title: "Dashboard",
      url: "/super-admin",
      icon: Home,
    },
    {
      title: "Quản lý phòng khám",
      url: "/super-admin/tenants",
      icon: Building2,
    },
    {
      title: "Quản lý Admin",
      url: "/super-admin/admins",
      icon: Users,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { currentUser } = useAuth();
  const isSystemAdmin = currentUser?.role === 'SystemAdmin';
  const isFinanceRole = currentUser?.role === 'Finance';

  const financeOnlyNav = [
    {
      title: "Tài chính",
      icon: DollarSign,
      items: [
        {
          title: "Giao dịch",
          url: "/clinic/finance/transactions",
          icon: Receipt,
        },
        {
          title: "Doanh thu",
          url: "/clinic/finance/revenue",
          icon: TrendingUp,
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Profile />
      </SidebarHeader>
      <SidebarContent>
        {isSystemAdmin ? (
          <NavMain label="Quản trị hệ thống" items={navigationData.superAdminNav} />
        ) : isFinanceRole ? (
          <NavMain label="Tài chính" items={financeOnlyNav} />
        ) : (
          <>
            <NavMain label="Dịch vụ chăm sóc" items={navigationData.navMain} />
            <NavMain label="Quản trị hệ thống" items={navigationData.navServices} />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
