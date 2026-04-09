import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle } from "lucide-react";
import { AuthPage } from "./AuthPage";
import { useAuth } from "@/hooks/useAuth";

export default function AuthScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, loading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", password: "", name: "" });
  const loading = authLoading || submitting;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(loginForm.email, loginForm.password);
    setSubmitting(false);
    if (!error) {
      toast({
        title: "Добро пожаловать!",
        description: "Вы успешно вошли в систему.",
        variant: "success",
        icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />,
      });
      const redirectTarget = searchParams.get("redirect");
      navigate(redirectTarget || "/dashboard");
      return;
    }
    toast({
      title: "Ошибка входа",
      description: error?.message ?? "Ошибка входа",
      variant: "destructive",
      icon: <XCircle className="h-5 w-5 text-destructive" />,
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signUp(
      signupForm.email,
      signupForm.password,
      signupForm.name || undefined,
    );
    setSubmitting(false);
    if (!error) {
      toast({
        title: "Регистрация успешна",
        description: "Проверьте почту для подтверждения аккаунта.",
        variant: "success",
        icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />,
      });
      return;
    }
    toast({
      title: "Ошибка регистрации",
      description: error?.message ?? "Ошибка регистрации",
      variant: "destructive",
      icon: <XCircle className="h-5 w-5 text-destructive" />,
    });
  };

  return (
    <>
      <Helmet>
        <title>Вход — CalcHub</title>
        <meta name="description" content="Войдите в CalcHub для сохранения расчётов и доступа к истории." />
      </Helmet>
      <AuthPage
        loginForm={loginForm}
        signupForm={signupForm}
        onLoginFormChange={(field, value) => setLoginForm((prev) => ({ ...prev, [field]: value }))}
        onSignupFormChange={(field, value) => setSignupForm((prev) => ({ ...prev, [field]: value }))}
        onLogin={handleLogin}
        onSignup={handleSignup}
        loading={loading}
      />
    </>
  );
}
