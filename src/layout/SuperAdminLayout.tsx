import { AppSidebar } from "@/components/AppSidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/Breadcrumb"
import { Separator } from "@/components/ui/Separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/Sidebar"
import { type ReactNode } from "react"

interface SuperAdminLayoutProps {
  children: ReactNode
  breadcrumbTitle: string
  breadcrumbItems?: Array<{
    title: string
    href?: string
  }>
  actions?: ReactNode
}

export default function SuperAdminLayout({ 
  children, 
  breadcrumbTitle, 
  breadcrumbItems = [],
  actions,
}: SuperAdminLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden custom-scrollbar-thin">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                  <BreadcrumbItem key={index} className="hidden md:block">
                    <BreadcrumbLink href={item.href || "#"}>
                      {item.title}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                ))}
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#" className="font-medium">
                    {breadcrumbTitle}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-2">
              {actions}
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
