import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AdminForbidden() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 text-center space-y-3">
        <h1 className="text-lg font-semibold text-foreground">403 - Нет доступа</h1>
        <p className="text-sm text-muted-foreground">
          У вашей учетной записи недостаточно прав для просмотра админ-раздела.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/login">Войти под другой учетной записью</Link>
          </Button>
          <Button asChild>
            <Link to="/">На главную</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
