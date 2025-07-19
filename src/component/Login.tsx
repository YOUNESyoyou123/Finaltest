// @ts-nocheck

import React, { useState } from "react";
import loginAnimation from "../assets/Wallet animation.json";
import * as LucideIcons from "lucide-react";
import { HelpCircle } from "lucide-react";
import Lottie from "lottie-react";
import { Link, useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
// ✅ Translation dictionary
const translations = {
  en: {
    title: "Sougi Platforme ",
    subtitle: "Secure access for healthcare professionals",
    email: "Full Name", // Changed from "Email Address" to "Full Name"
    password: "Password",
    remember: "Remember me",
    forgot: "Forgot password?",
    signin: "Sign In",
    security:
      "Protected by enterprise-grade security.\nHIPAA compliant authentication.",
    authError: "Authentication Error",
    invalid: "Invalid name or password.",
    tooMany: "Too many attempts. Try again later.",
    attempts: (n: number) => `${n} attempt${n !== 1 ? "s" : ""} remaining" `,
  },
  ar: {
    title: "سوقي",
    subtitle: "الفضاء الالكتروني",
    email: "الاسم الكامل", // Changed from "البريد الإلكتروني" to "الاسم الكامل"
    password: "كلمة المرور",
    remember: "تذكرني",
    forgot: "نسيت كلمة المرور؟",
    signin: "تسجيل الدخول",
    security: "محمي بأعلى معايير الأمان.\nمصادقة متوافقة مع HIPAA.",
    authError: "خطأ في المصادقة",
    invalid: "اسم مستخدم أو كلمة مرور غير صحيحة.",
    tooMany: "محاولات كثيرة. حاول لاحقًا.",
    attempts: (n: number) => `متبقي ${n} محاولة`,
  },
};

type IconProps = {
  name: keyof typeof LucideIcons;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  [key: string]: any;
};

function Icon({
  name,
  size = 20,
  color = "currentColor",
  strokeWidth = 2,
  className = "",
  ...props
}: IconProps) {
  const IconComponent = LucideIcons[name];
  if (!IconComponent) {
    return (
      <HelpCircle
        size={size}
        color="gray"
        strokeWidth={strokeWidth}
        className={className}
        {...props}
      />
    );
  }

  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      {...props}
    />
  );
}

const Login = () => {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const t = translations[lang];

  const [formData, setFormData] = useState({
    email: "", // This field now represents FullName
    password: "",
    rememberMe: false,
  });

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const isFormValid = formData.email !== "" && formData.password !== "";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setFieldErrors({});
    setSubmitAttempts((prev) => prev + 1);

    if (submitAttempts >= 2) {
      setIsLocked(true);
      setAuthError(t.tooMany);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/loginclient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          FullName: formData.email, // Using email field for FullName
          Password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.invalid);
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/Market");
      // Show success message
      // alert(lang === "en" ? "Login successful!" : "تم تسجيل الدخول بنجاح!");

      // Here you could redirect to another page
      // navigate('/dashboard');
    } catch (error) {
      console.error("Login error:", error);
      setAuthError(error.message || t.invalid);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 ${
        lang === "ar" ? "direction-rtl" : ""
      }`}
    >
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl px-8 py-10">
          {/* Language button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleLang}
              className="text-sm text-blue-600 hover:underline"
            >
              {lang === "en" ? "🇸🇦 عربي" : "🇬🇧 English"}
            </button>
          </div>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-40 h-40 bg-blue-600 rounded-full shadow-md mx-auto mb-4">
              <Lottie
                animationData={loginAnimation}
                loop={true}
                className="w-64"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
            <p className="text-sm text-gray-500">{t.subtitle}</p>
          </div>

          {/* Auth Error */}
          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6 flex gap-3">
              <Icon name="AlertCircle" size={20} />
              <div>
                <strong className="block font-medium">{t.authError}</strong>
                <span>{authError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name (previously Email) */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                {t.email}
              </label>
              <div className="relative mt-1">
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none focus:ring-blue-300 ${
                    fieldErrors.email
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder={
                    lang === "en" ? "Your full name" : "الاسم الكامل"
                  }
                  disabled={isLoading}
                />
                <Icon
                  name="User"
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                {t.password}
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none ${
                    fieldErrors.password
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-blue-300"
                  }`}
                  placeholder={
                    lang === "en" ? "Enter your password" : "أدخل كلمة المرور"
                  }
                  disabled={isLoading}
                />
                <Icon
                  name="Lock"
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  aria-label={
                    passwordVisible
                      ? lang === "en"
                        ? "Hide password"
                        : "إخفاء كلمة المرور"
                      : lang === "en"
                      ? "Show password"
                      : "إظهار كلمة المرور"
                  }
                >
                  <Icon name={passwordVisible ? "EyeOff" : "Eye"} size={18} />
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                {t.remember}
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
              >
                {t.forgot}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading || isLocked}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg shadow-md flex items-center justify-center gap-2 transition duration-200"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  {lang === "en" ? "Authenticating..." : "جاري التحقق..."}
                </>
              ) : (
                <>
                  <Icon name="LogIn" size={18} />
                  {t.signin}
                </>
              )}
            </button>

            <Link
              to="/registerclient"
              className="block w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded-lg shadow-sm text-center flex items-center justify-center gap-2 transition duration-200"
            >
              <Icon name="UserPlus" size={18} />
              {lang === "en" ? "Create an Account" : "إنشاء حساب جديد"}
            </Link>

            {/* Security Notice */}
            <p className="text-center text-xs text-gray-400 mt-4 whitespace-pre-line">
              {t.security}
            </p>
          </form>

          {/* Attempt Counter */}
          {submitAttempts > 0 && submitAttempts < 3 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-yellow-600">
                {t.attempts(3 - submitAttempts)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
