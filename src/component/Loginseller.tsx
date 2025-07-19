// @ts-nocheck

import React, { useState } from "react";
import loginAnimation from "../assets/Wallet animation.json";
import * as LucideIcons from "lucide-react";
import { HelpCircle } from "lucide-react";
import Lottie from "lottie-react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/loginseller"; // ✅ ton backend

// ✅ Dictionnaire de traduction
const translations = {
  en: {
    title: "Sougi Platforme ",
    subtitle: "Secure access for healthcare professionals",
    email: "Full Name",
    password: "Password",
    remember: "Remember me",
    forgot: "Forgot password?",
    signin: "Sign In",
    security:
      "Protected by enterprise-grade security.\nHIPAA compliant authentication.",
    authError: "Authentication Error",
    invalid: "Invalid name or password.",
    success: "✅ Login successful! Redirecting...",
  },
  ar: {
    title: "سوقي",
    subtitle: "الفضاء الالكتروني",
    email: "الاسم الكامل",
    password: "كلمة المرور",
    remember: "تذكرني",
    forgot: "نسيت كلمة المرور؟",
    signin: "تسجيل الدخول",
    security: "محمي بأعلى معايير الأمان.\nمصادقة متوافقة مع HIPAA.",
    authError: "خطأ في المصادقة",
    invalid: "اسم أو كلمة مرور غير صحيحة.",
    success: "✅ تم تسجيل الدخول بنجاح! جاري التحويل...",
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

const Loginseller = () => {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const t = translations[lang];
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    FullName: "",
    Password: "",
    rememberMe: false,
  });

  const [fieldErrors, setFieldErrors] = useState<{
    FullName?: string;
    Password?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const isFormValid = formData.FullName !== "" && formData.Password !== "";

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

  // ✅ NOUVEAU handleSubmit qui appelle le backend et sauvegarde token
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setSuccessMsg("");

    if (!isFormValid) {
      setAuthError(t.invalid);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          FullName: formData.FullName,
          Password: formData.Password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || t.invalid);
      } else {
        // ✅ Sauvegarde token et infos
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setSuccessMsg(t.success);

        // ✅ Redirection après 1s
        setTimeout(() => navigate("/Market"), 1000);
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      setAuthError("Cannot connect to server");
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
          {/* Bouton langue */}
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
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 flex gap-3">
              <Icon name="AlertCircle" size={20} />
              <div>
                <strong className="block font-medium">{t.authError}</strong>
                <span>{authError}</span>
              </div>
            </div>
          )}

          {/* ✅ Success message */}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4 flex gap-3">
              <Icon name="CheckCircle" size={20} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* FullName */}
            <div>
              <label
                htmlFor="FullName"
                className="block text-sm font-medium text-gray-700"
              >
                {t.email}
              </label>
              <div className="relative mt-1">
                <input
                  id="FullName"
                  name="FullName"
                  type="text"
                  required
                  value={formData.FullName}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none focus:ring-blue-300 ${
                    fieldErrors.FullName
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder={lang === "en" ? "Enter your name" : "أدخل اسمك"}
                  disabled={isLoading}
                />
                <Icon
                  name="User"
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="Password"
                className="block text-sm font-medium text-gray-700"
              >
                {t.password}
              </label>
              <div className="relative mt-1">
                <input
                  id="Password"
                  name="Password"
                  type={passwordVisible ? "text" : "password"}
                  required
                  value={formData.Password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none ${
                    fieldErrors.Password
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
                >
                  <Icon name={passwordVisible ? "EyeOff" : "Eye"} size={18} />
                </button>
              </div>
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
              disabled={!isFormValid || isLoading}
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
              to="/registerseller"
              className="block w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded-lg shadow-sm text-center flex items-center justify-center gap-2 transition duration-200"
            >
              <Icon name="UserPlus" size={18} />
              {lang === "en" ? "Create an Account" : "إنشاء حساب جديد"}
            </Link>

            <p className="text-center text-xs text-gray-400 mt-4 whitespace-pre-line">
              {t.security}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Loginseller;
