import AdminLayout from "@/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Search, Filter, Calendar, User } from "lucide-react"

export default function AdvancedSearch() {
  return (
    <AdminLayout breadcrumbTitle="Tìm kiếm nâng cao">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tìm kiếm nâng cao</h1>
          <p className="text-muted-foreground">
            Tìm kiếm thông tin chi tiết với nhiều tiêu chí
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm theo tên</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Nhập tên bệnh nhân..." className="pl-8" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Loại tìm kiếm</label>
              <div className="relative">
                <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Chọn loại..." className="pl-8" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Từ ngày</label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="date" className="pl-8" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Đến ngày</label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="date" className="pl-8" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button>
              <Search className="mr-2 h-4 w-4" />
              Tìm kiếm
            </Button>
            <Button variant="outline">
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kết quả tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nhập từ khóa để bắt đầu tìm kiếm
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
