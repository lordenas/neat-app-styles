import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useLoginMutation, useRegisterMutation } from "@/services/api/authApi";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle } from "lucide-react";
import { AuthPage } from "./AuthPage";

export default function AuthScreen() {
  const navigate = useNavigate();
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", password: "", name: "" });

  const loading = loginLoading || registerLoading;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email: loginForm.email, password: loginForm.password }).unwrap();
      toast({
        title: "Добро пожаловать!",
        description: "Вы успешно вошли в систему.",
        variant: "success",
        icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />,
      });
      navigate("/dashboard");
    } catch (err) {
      const message = err && typeof err === "object" && "data" in err && typeof (err as { data?: unknown }).data === "object"
        ? String((err as { data: { message?: string } }).data?.message ?? "Ошибка входа")
        : "Ошибка входа";
      toast({
        title: "Ошибка входа",
        description: message,
        variant: "destructive",
        icon: <XCircle className="h-5 w-5 text-destructive" />,
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        email: signupForm.email,
        password: signupForm.password,
        fullName: signupForm.name || undefined,
      }).unwrap();
      toast({
        title: "Регистрация успешна",
        description: "Проверьте почту для подтверждения аккаунта.",
        variant: "success",
        icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />,
      });
    } catch (err) {
      const message = err && typeof err === "object" && "data" in err && typeof (err as { data?: unknown }).data === "object"
        ? String((err as { data: { message?: string } }).data?.message ?? "Ошибка регистрации")
        : "Ошибка регистрации";
      toast({
        title: "Ошибка регистрации",
        description: message,
        variant: "destructive",
        icon: <XCircle className="h-5 w-5 text-destructive" />,
      });
    }
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
