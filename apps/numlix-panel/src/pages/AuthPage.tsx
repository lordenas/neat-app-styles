import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LogIn, UserPlus, Mail, Lock, User } from "lucide-react";

export interface AuthPageProps {
  loginForm: { email: string; password: string };
  signupForm: { email: string; password: string; name: string };
  onLoginFormChange: (field: keyof AuthPageProps["loginForm"], value: string) => void;
  onSignupFormChange: (field: keyof AuthPageProps["signupForm"], value: string) => void;
  onLogin: (e: React.FormEvent) => void;
  onSignup: (e: React.FormEvent) => void;
  loading: boolean;
}

export function AuthPage({
  loginForm,
  signupForm,
  onLoginFormChange,
  onSignupFormChange,
  onLogin,
  onSignup,
  loading,
}: AuthPageProps) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Личный кабинет</CardTitle>
            <CardDescription>Сохраняйте расчёты и отслеживайте историю</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  Вход
                </TabsTrigger>
                <TabsTrigger value="signup" className="gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  Регистрация
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={onLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        required
                        placeholder="email@example.com"
                        className="pl-9"
                        value={loginForm.email}
                        onChange={(e) => onLoginFormChange("email", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Пароль</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        required
                        placeholder="••••••••"
                        className="pl-9"
                        value={loginForm.password}
                        onChange={(e) => onLoginFormChange("password", e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    <LogIn className="h-4 w-4" />
                    {loading ? "Вход..." : "Войти"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={onSignup} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Имя</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        required
                        placeholder="Ваше имя"
                        className="pl-9"
                        value={signupForm.name}
                        onChange={(e) => onSignupFormChange("name", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        required
                        placeholder="email@example.com"
                        className="pl-9"
                        value={signupForm.email}
                        onChange={(e) => onSignupFormChange("email", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Пароль</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        required
                        minLength={6}
                        placeholder="Минимум 6 символов"
                        className="pl-9"
                        value={signupForm.password}
                        onChange={(e) => onSignupFormChange("password", e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    <UserPlus className="h-4 w-4" />
                    {loading ? "Регистрация..." : "Зарегистрироваться"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
