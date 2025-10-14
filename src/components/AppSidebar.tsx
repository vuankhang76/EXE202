import * as React from "react"
import {
  UserRound,
  ClipboardList,
  UserCog,
  MessageCirclePlus,
  CalendarDays,
  Home,
  Settings
} from "lucide-react"

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
      url: "/appointments",
      icon: CalendarDays,
    },
    {
      title: "Đơn dịch vụ và thanh toán",
      url: "/orders",
      icon: ClipboardList,
    },
    {
      title: "Quản lý hồ sơ bệnh nhân",
      url: "/patients",
      icon: UserRound,
    },
    {
      title: "Giao tiếp và tư vấn từ xa",
      url: "/consultations",
      icon: MessageCirclePlus,
    },
  ],
  
  navServices: [
    {
      title: "Tổng quan",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Cài đặt phòng khám",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Tài khoản",
      url: "/accounts",
      icon: UserCog,
    },
    {
      title: "Báo cáo & Thống kê",
      url: "/reports",
      icon: UserCog,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Profile />
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Dịch vụ chăm sóc" items={navigationData.navMain} />
        <NavMain label="Quản trị hệ thống" items={navigationData.navServices} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
