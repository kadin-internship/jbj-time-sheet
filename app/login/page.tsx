import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center bg-brand-white px-4">
      <div className="w-full max-w-sm rounded-lg border border-brand-rose/40 p-8 shadow-sm">
        <h1 className="mb-1 text-center text-3xl font-bold text-brand-maroon">
          JBJ Time Sheet
        </h1>
        <p className="mb-6 text-center text-brand-gray">Sign in to continue</p>
        <LoginForm callbackUrl={callbackUrl ?? "/"} />
      </div>
    </div>
  );
}
