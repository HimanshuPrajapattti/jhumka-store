import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-maroon-deep via-maroon to-[#3a0c17] px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-display text-4xl font-semibold tracking-[0.4em] text-gold">
            AVRANI
          </p>
          <p className="label-caps mt-3 text-cream/70">Studio admin</p>
        </div>

        <div className="rounded-3xl border border-cream/15 bg-ivory p-8 shadow-2xl">
          <h1 className="font-display text-3xl font-semibold text-maroon-deep">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-ash">
            Sign in to manage products, orders and analytics.
          </p>

          <div className="mt-7">
            <LoginForm />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-cream/60">
          Credentials are configured in <code>.env.local</code>
        </p>
      </div>
    </div>
  );
}
