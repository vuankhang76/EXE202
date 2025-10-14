import { useEffect } from "react"
import { Building2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import tenantService from "@/services/tenantService"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/Sidebar"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/Avatar"

export function Profile() {
  const { currentUser, tenantCoverImage, setTenantCoverImage, tenantInfo, setTenantInfo } = useAuth()

  useEffect(() => {
    const fetchTenantInfo = async () => {
      if (!currentUser?.tenantId) {
        return
      }

      if (tenantInfo) {
        return
      }

      try {
        const response = await tenantService.getTenantById(Number(currentUser.tenantId))
        if (response.success && response.data) {
          setTenantInfo(response.data)
          if (response.data.thumbnailUrl) {
            setTenantCoverImage(response.data.thumbnailUrl)
          }
        }
      } catch (error) {
      }
    }

    fetchTenantInfo()
  }, [currentUser?.tenantId, tenantInfo, setTenantInfo, setTenantCoverImage])

  if (!currentUser?.tenantId) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Building2 className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Chưa có phòng khám</span>
              <span className="truncate text-xs text-muted-foreground">Chưa xác định</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const tenantName = tenantInfo?.name || currentUser.tenantName || 'Chưa có tên'
  const tenantCode = tenantInfo?.code || 'N/A'
  const thumbnailImage = tenantCoverImage || tenantInfo?.thumbnailUrl

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          {thumbnailImage ? (
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage className="object-cover" src={thumbnailImage} alt={tenantName} />
              <AvatarFallback className="rounded-lg">
                <Building2 className="size-4" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Building2 className="size-4" />
            </div>
          )}
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{tenantName}</span>
            <span className="truncate text-xs text-muted-foreground">
              Mã: {tenantCode}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
