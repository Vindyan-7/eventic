import { signOut } from "@/services/auth";

export function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-lg border px-4 py-2"
      >
        Logout
      </button>
    </form>
  );
}