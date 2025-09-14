import AdminLayout from "@/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Plus, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/Input"

export default function Patients() {
  return (
    <AdminLayout breadcrumbTitle="Quản lý bệnh nhân">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý bệnh nhân</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin hồ sơ bệnh nhân
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm bệnh nhân mới
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm bệnh nhân..." className="pl-8" />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Lọc
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách bệnh nhân</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Chưa có dữ liệu bệnh nhân
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
