import * as React from "react"
import {
  AudioWaveform,
  UserRound,
  ClipboardList,
  Command,
  HeartHandshake,
  GalleryVerticalEnd,
  UserCog,
  TicketCheck,
  MessageCirclePlus,
  CalendarDays,
  Search,
  Home
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

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
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
        <Profile teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Dịch vụ chăm sóc" items={data.navMain} />
        <NavMain label="Quản trị hệ thống" items={data.navServices} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
