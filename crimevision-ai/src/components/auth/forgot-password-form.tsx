"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, KeyRound, ArrowLeft, ArrowRight, ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";
import { AnimatedInput } from "./animated-input";
import { MagneticButton } from "./magnetic-button";
import { OTPInput } from "./otp-input";

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
  themeColor?: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToLogin,
  themeColor = "#54e7da",
}) => {
  const [step, setStep] = useState<"request" | "verify" | "reset" | "completed">("request");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("verify");
    }, 1200);
  };

  const handleOTPComplete = (code: string) => {
    setOtpCode(code);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("reset");
    }, 1000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newPassword || newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("completed");
    }, 1400);
  };

  return (
    <div className="space-y-4">
      {/* Header Back Button */}
      <button
        type="button"
        onClick={onBackToLogin}
        className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors mb-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Login</span>
      </button>

      {step === "request" && (
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <div className="text-left space-y-1">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-cyan-400" />
              <span>Password Recovery</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your registered email address. We will dispatch an emergency 6-digit verification code.
            </p>
          </div>

          <AnimatedInput
            label="Recovery Email Address"
            type="email"
            icon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error || undefined}
            isValid={email.includes("@") && email.length > 5}
            themeColor={themeColor}
          />

          <MagneticButton type="submit" isLoading={isLoading} themeColor={themeColor}>
            <span>Dispatch Recovery Code</span>
            <ArrowRight className="w-4 h-4" />
          </MagneticButton>
        </form>
      )}

      {step === "verify" && (
        <div className="space-y-4 text-center">
          <div className="text-left space-y-1">
            <h3 className="text-lg font-bold text-white tracking-tight">Verify 6-Digit Passcode</h3>
            <p className="text-xs text-slate-400">
              Code sent to <span className="text-cyan-300 font-mono">{email}</span>
            </p>
          </div>

          <OTPInput onComplete={handleOTPComplete} themeColor={themeColor} />
        </div>
      )}

      {step === "reset" && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="text-left space-y-1">
            <h3 className="text-lg font-bold text-white tracking-tight">Set New Password</h3>
            <p className="text-xs text-slate-400">
              Create a strong new password for your account.
            </p>
          </div>

          <AnimatedInput
            label="New Password"
            type={showPassword ? "text" : "password"}
            icon={<Lock className="w-4 h-4" />}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={error || undefined}
            isValid={newPassword.length >= 8}
            themeColor={themeColor}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-white p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <AnimatedInput
            label="Confirm New Password"
            type={showPassword ? "text" : "password"}
            icon={<Lock className="w-4 h-4" />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            isValid={confirmPassword.length >= 8 && confirmPassword === newPassword}
            themeColor={themeColor}
          />

          <MagneticButton type="submit" isLoading={isLoading} themeColor={themeColor}>
            <span>Update Credentials</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </MagneticButton>
        </form>
      )}

      {step === "completed" && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-6 space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Credentials Reset Complete</h3>
            <p className="text-xs text-slate-400">
              Your password has been securely updated. You may now log in with your new password.
            </p>
          </div>

          <MagneticButton onClick={onBackToLogin} themeColor={themeColor}>
            <span>Proceed to Login</span>
            <ArrowRight className="w-4 h-4" />
          </MagneticButton>
        </motion.div>
      )}
    </div>
  );
};
