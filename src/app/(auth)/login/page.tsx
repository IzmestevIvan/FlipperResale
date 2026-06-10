"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface FormData { email: string; password: string }

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    setError("");
    const res = await signIn("credentials", { ...data, redirect: false });
    if (res?.error) { setError("Неверный email или пароль"); return; }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🐬</div>
          <h1 className="text-2xl font-bold text-gray-900">Вход</h1>
          <p className="text-sm text-gray-500 mt-1">FlipperMarket</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email", { required: "Введите email" })}
          />
          <Input
            label="Пароль"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password", { required: "Введите пароль" })}
          />

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <Button type="submit" className="w-full" loading={isSubmitting}>Войти</Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-brand-600 hover:underline font-medium">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
