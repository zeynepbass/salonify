import AuthGuard from "@/features/shared/auth/AuthGuard";

export default function Layout({ children }) {
  return <AuthGuard>{children}</AuthGuard>;
}
