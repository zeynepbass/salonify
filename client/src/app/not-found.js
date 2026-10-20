import Button from "@/components/atoms/Button";
import Logo from "@/components/atoms/Logo";
import StateMessage from "@/components/molecules/StateMessage";

export const metadata = { title: "Sayfa bulunamadı" };

export default function NotFound() {
  return (
    <main className="page-container flex min-h-screen max-w-[720px] flex-col justify-center gap-8 py-16">
      <Logo />
      <StateMessage
        icon="search"
        title="Aradığın sayfa bulunamadı."
        description="Bağlantı hatalı olabilir ya da sayfa kaldırılmış olabilir."
      >
        <Button variant="primary" href="/">
          Ana sayfaya dön
        </Button>
      </StateMessage>
    </main>
  );
}
