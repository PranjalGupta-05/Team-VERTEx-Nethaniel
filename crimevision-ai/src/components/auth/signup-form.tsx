"use client";

import React, { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { AnimatedInput } from "./animated-input";
import { MagneticButton } from "./magnetic-button";
import { PasswordStrengthMeter } from "./password-strength";
import { ForensicSecurityBadge } from "./forensic-security-badge";
import { supabase } from "@/lib/supabase";

interface SignupFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
  themeColor?: string;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  onSwitchToLogin,
  themeColor = "#54e7da",
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email) newErrors.email = "Email address is required";
    else if (!email.includes("@")) newErrors.email = "Please enter a valid email address";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters";

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!acceptTerms) {
      newErrors.terms = "You must accept the terms of service";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user_name", name);
        localStorage.setItem("auth_user_email", email);
      }

      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Step 1: Register in Supabase Auth
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        // Ignore email confirmation error if user created
        if (signUpError && !signUpError.message.toLowerCase().includes("confirm")) {
          setErrors({ email: signUpError.message });
          setIsLoading(false);
          return;
        }

        // Step 2: Directly insert/upsert into public.profiles table
        if (signUpData?.user) {
          const { error: profileError } = await (supabase as any).from("profiles").upsert(
            {
              id: signUpData.user.id,
              full_name: name,
              email: email,
              role: "investigator",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

          if (profileError) {
            console.warn("Profile upsert warning:", profileError.message);
          }
        }
      } else {
        // Demo fallback delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: unknown) {
      setIsLoading(false);
      setErrors({ email: err instanceof Error ? err.message : "Signup failed" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      {/* Formal Forensic Security Badge Header */}
      <ForensicSecurityBadge
        isPasswordVisible={showPassword}
        isPasswordFocused={isPasswordFocused}
        passwordLength={password.length}
        isSuccess={isSuccess}
        hasError={Object.keys(errors).length > 0}
        themeColor={themeColor}
      />

      {/* Name Input */}
      <AnimatedInput
        label="Full Name"
        type="text"
        icon={<User className="w-4 h-4" />}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        isValid={name.length >= 3}
        themeColor={themeColor}
      />

      {/* Email Input */}
      <AnimatedInput
        label="Email Address"
        type="email"
        icon={<Mail className="w-4 h-4" />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        isValid={email.includes("@") && email.length > 5}
        themeColor={themeColor}
      />

      {/* Password Input */}
      <AnimatedInput
        label="Create Password"
        type={showPassword ? "text" : "password"}
        icon={<Lock className="w-4 h-4" />}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onFocus={() => setIsPasswordFocused(true)}
        onBlur={() => setIsPasswordFocused(false)}
        error={errors.password}
        isValid={password.length >= 8}
        themeColor={themeColor}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-cyan-400" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        }
      />

      {/* Password Strength Meter */}
      <PasswordStrengthMeter password={password} />

      {/* Confirm Password Input */}
      <AnimatedInput
        label="Confirm Password"
        type={showPassword ? "text" : "password"}
        icon={<Lock className="w-4 h-4" />}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        isValid={confirmPassword.length >= 8 && confirmPassword === password}
        themeColor={themeColor}
      />

      {/* Terms Checkbox */}
      <div className="py-1">
        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-0 cursor-pointer"
          />
          <span className="leading-snug">
            I agree to the{" "}
            <a href="#terms" className="text-cyan-400 underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#privacy" className="text-cyan-400 underline">
              Privacy Policy
            </a>
          </span>
        </label>
        {errors.terms && (
          <p className="text-xs text-rose-400 mt-1 font-mono font-medium">
            • {errors.terms}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <MagneticButton
        type="submit"
        isLoading={isLoading}
        isSuccess={isSuccess}
        themeColor={themeColor}
      >
        <span>Register Investigator Profile</span>
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
      </MagneticButton>

      {/* Switch to Login */}
      <div className="pt-2 text-center text-xs text-slate-400 font-mono">
        Already registered?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-cyan-400 font-semibold hover:text-cyan-300 underline underline-offset-4"
        >
          Sign in here
        </button>
      </div>
    </form>
  );
};
