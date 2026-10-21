import AuthGuard from "@/features/customer/auth/AuthGuard";

export default function Layout({ children }) {
  return <AuthGuard>{children}</AuthGuard>;
}
