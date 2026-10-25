import { AuthCard, ResetForm } from "@/components/admin/AuthForms";

export const metadata = { title: "Choose a new password" };

// Private admin page: waits for the session by design.
export const instant = false;

export default function ResetPage() {
  return (
    <AuthCard title="Choose a new password" intro="Use at least 10 characters. A passphrase works well.">
      <ResetForm />
    </AuthCard>
  );
}
