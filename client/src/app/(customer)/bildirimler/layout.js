import AuthGuard from "@/features/auth/AuthGuard";

export default function Layout({ children }) {
  return <AuthGuard>{children}</AuthGuard>;
}
