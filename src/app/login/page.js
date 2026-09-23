"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, Eye, EyeOff, Info } from "lucide-react";
import { signIn, clearError, DEMO_CREDENTIALS } from "@/store/slices/authSlice";
import { toast } from "@/store/slices/uiSlice";
import { useI18n } from "@/i18n/I18nProvider";
import AuthLayout from "@/components/layout/AuthLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Checkbox from "@/components/ui/Checkbox";
import Alert from "@/components/ui/Alert";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useI18n();
  const { status, error } = useSelector((s) => s.auth);

  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(
    () => () => {
      dispatch(clearError());
    },
    [dispatch],
  );

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email.trim()) errs.email = t("auth.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t("auth.emailInvalid");
    if (!password) errs.password = t("auth.passwordRequired");
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    const result = await dispatch(signIn({ email, password }));
    if (signIn.fulfilled.match(result)) {
      dispatch(toast.success(t("authExtra.welcomeBack", { name: result.payload.name.split(" ")[0] })));
      /* Full page navigation (not router.push): in production, Next prefetches
         "/" before sign-in and the middleware's 307 to /login gets cached in
         the Router Cache — router.push would replay that stale redirect and
         bounce back to /login. A document navigation always hits the
         middleware with the fresh auth cookie. */
      window.location.assign("/");
    }
  };

  return (
    <AuthLayout
      title={t("auth.welcome")}
      description={t("auth.signInHint")}
      footer={
        <p className="text-center text-body-sm text-ink-2">
          {t("auth.noAccount")}{" "}
          <Link href="/login" className="font-medium text-brand-text underline-offset-4 hover:underline">
            {t("auth.contactAdmin")}
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {error && (
          <Alert tone="danger" title={t("auth.failTitle")}>
            {error}
          </Alert>
        )}

        <Input
          label={t("auth.email")}
          type="email"
          required
          autoComplete="email"
          icon={Mail}
          placeholder="you@nexora.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFieldErrors((f) => ({ ...f, email: undefined }));
          }}
          error={fieldErrors.email}
        />

        <Input
          label={t("auth.password")}
          type={showPassword ? "text" : "password"}
          required
          autoComplete="current-password"
          icon={Lock}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setFieldErrors((f) => ({ ...f, password: undefined }));
          }}
          error={fieldErrors.password}
          className="pr-10"
          action={
            <Link href="/forgot-password" className="text-caption font-medium text-brand-text underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
              {t("auth.forgot")}
            </Link>
          }
        />

        <div className="-mt-2 flex items-center justify-between">
          <Checkbox label={t("auth.remember")} checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <button type="button" onClick={() => setShowPassword((v) => !v)} className="inline-flex items-center gap-1.5 rounded text-caption font-medium text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
            {showPassword ? <EyeOff aria-hidden className="h-3.5 w-3.5" /> : <Eye aria-hidden className="h-3.5 w-3.5" />}
            {showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
          </button>
        </div>

        <Button type="submit" variant="primary" size="lg" loading={status === "loading"} className="mt-1 w-full">
          {status === "loading" ? t("authExtra.signingIn") : t("authExtra.signIn")}
        </Button>

        <Alert tone="info" icon={Info} className="mt-2">
          <span className="block">{t("auth.demo", { email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password })}</span>
        </Alert>
      </form>
    </AuthLayout>
  );
}
