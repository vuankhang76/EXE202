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
  Search
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
} from "@/components/ui/sidebar"

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
      url: "#",
      icon: CalendarDays,
    },
    {
      title: "Đơn dịch vụ và thanh toán",
      url: "#",
      icon: ClipboardList,
    },
    {
      title: "Quản lý hồ sơ bệnh nhân",
      url: "#",
      icon: UserRound,
    },
    {
      title: "Giao tiếp và tư vấn từ xa",
      url: "#",
      icon: MessageCirclePlus,
    },
  ],
  
  navServices: [
    {
      title: "CMR y tế",
      url: "#",
      icon: HeartHandshake,
    },
    {
      title: "Ưu đãi",
      url: "#",
      icon: TicketCheck,
    },
    {
      title: "Tài khoản",
      url: "#",
      icon: UserCog,
    },
    {
      title: "Báo cáo & Thống kê",
      url: "#",
      icon: UserCog,
    },
  ],

  navAdvanced: [
    {
      title: "Tìm kiếm nâng cao",
      url: "#",
      icon: Search,
    }
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
        <NavMain label="Tính năng hỗ trợ" items={data.navAdvanced} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
