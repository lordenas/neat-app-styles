import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Mail, Lock, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CheckCircle2, XCircle } from "lucide-react";

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", password: "", name: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginForm.email, loginForm.password);
    setLoading(false);
    if (error) {
      toast({
        title: "Ошибка входа",
        description: error.message,
        variant: "destructive",
        icon: <XCircle className="h-5 w-5 text-destructive" />,
      });
    } else {
      toast({
        title: "Добро пожаловать!",
        description: "Вы успешно вошли в систему.",
        variant: "success",
        icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />,
      });
      navigate("/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(signupForm.email, signupForm.password, signupForm.name);
    setLoading(false);
    if (error) {
      toast({
        title: "Ошибка регистрации",
        description: error.message,
        variant: "destructive",
        icon: <XCircle className="h-5 w-5 text-destructive" />,
      });
    } else {
      toast({
        title: "Регистрация успешна",
        description: "Проверьте почту для подтверждения аккаунта.",
        variant: "success",
        icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />,
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Вход — CalcHub</title>
        <meta name="description" content="Войдите в CalcHub для сохранения расчётов и доступа к истории." />
      </Helmet>

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
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
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
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
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
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
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
                <form onSubmit={handleSignup} className="space-y-4 mt-4">
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
                        onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
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
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
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
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
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
