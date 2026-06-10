"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface FormData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const e = await res.json();
      setError(e.error ?? "Ошибка регистрации");
      return;
    }

    await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🐬</div>
          <h1 className="text-2xl font-bold text-gray-900">Регистрация</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Имя"
            placeholder="Иван Иванов"
            error={errors.name?.message}
            {...register("name", { required: "Введите имя", minLength: { value: 2, message: "Минимум 2 символа" } })}
          />
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
            {...register("password", { required: "Введите пароль", minLength: { value: 6, message: "Минимум 6 символов" } })}
          />
          <Input
            label="Телефон (необязательно)"
            placeholder="+7 (999) 123-45-67"
            {...register("phone")}
          />
          <Input
            label="Город (необязательно)"
            placeholder="Москва"
            {...register("city")}
          />

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Создать аккаунт
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-brand-600 hover:underline font-medium">Войти</Link>
        </p>
      </div>
    </div>
  );
}
