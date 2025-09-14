import AdminLayout from "@/layout/AdminLayout"

export default function Dashboard() {
  return (
    <AdminLayout breadcrumbTitle="Tổng quan">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <h3 className="text-lg font-semibold text-muted-foreground">Tổng số bệnh nhân</h3>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <h3 className="text-lg font-semibold text-muted-foreground">Lịch hẹn hôm nay</h3>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <h3 className="text-lg font-semibold text-muted-foreground">Doanh thu tháng</h3>
        </div>
      </div>
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min flex items-center justify-center">
        <h3 className="text-xl font-semibold text-muted-foreground">Biểu đồ thống kê</h3>
      </div>
    </AdminLayout>
  )
}
