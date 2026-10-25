import { Suspense } from "react";
import { AuthCard, LoginForm } from "@/components/admin/AuthForms";

export const metadata = { title: "Sign in" };

async function LoginBody({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  return <LoginForm next={sp.next} linkError={sp.error === "link"} />;
}

// Private admin page: waits for the session by design.
export const instant = false;

export default function LoginPage(props: { searchParams: Promise<{ next?: string; error?: string }> }) {
  return (
    <AuthCard title="Welcome back" intro="Sign in to manage your website, bookings and reviews.">
      <Suspense fallback={<div className="h-52" />}>
        <LoginBody searchParams={props.searchParams} />
      </Suspense>
    </AuthCard>
  );
}
