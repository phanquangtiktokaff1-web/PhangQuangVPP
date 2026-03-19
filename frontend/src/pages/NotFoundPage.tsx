import { Link } from 'react-router';
import { HomeIcon, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="text-[120px] font-extrabold leading-none text-primary/20 select-none mb-2">404</div>
        <h1 className="text-3xl font-bold mb-3">Trang không tồn tại</h1>
        <p className="text-muted-foreground mb-8">
          Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không truy cập được.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button className="gap-2 w-full sm:w-auto">
              <HomeIcon className="h-4 w-4" /> Về trang chủ
            </Button>
          </Link>
          <Button variant="outline" className="gap-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Button>
          <Link to="/search">
            <Button variant="ghost" className="gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4" /> Tìm kiếm
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
