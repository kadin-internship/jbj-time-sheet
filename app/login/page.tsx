import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; passwordChanged?: string }>;
}) {
  const { callbackUrl, passwordChanged } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center bg-brand-white px-4">
      <div className="w-full max-w-sm rounded-lg border border-brand-rose/40 p-8 shadow-sm">
        <h1 className="mb-1 text-center text-3xl font-bold text-brand-maroon">
          JBJ Time Sheet
        </h1>
        <p className="mb-6 text-center text-brand-gray">Sign in to continue</p>
        {passwordChanged && (
          <p className="mb-4 rounded-md bg-brand-rose/20 p-3 text-center text-base text-brand-gray">
            Password updated. Sign in with your new password.
          </p>
        )}
        <LoginForm callbackUrl={callbackUrl ?? "/"} />
      </div>
    </div>
  );
}
