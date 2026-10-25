import { AuthCard, ForgotForm } from "@/components/admin/AuthForms";

export const metadata = { title: "Reset password" };

// Private admin page: waits for the session by design.
export const instant = false;

export default function ForgotPage() {
  return (
    <AuthCard title="Reset your password" intro="Enter your admin email and we will send you a secure link.">
      <ForgotForm />
    </AuthCard>
  );
}
