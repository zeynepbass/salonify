import Button from "@/components/atoms/Button";
import { Select } from "@/components/atoms/Input";
import Field from "@/components/molecules/Field";

export default function SettingsSection() {
  return (
    <section>
      <h2 className="mb-4 text-[20px]">Ayarlar</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-4">
        <Field label="Dil" htmlFor="settings-language">
          <Select id="settings-language" defaultValue="tr">
            <option value="tr">Türkçe</option>
            <option value="en">İngilizce</option>
          </Select>
        </Field>
        <Field label="Şifre">
          <Button align="start" className="min-h-10 w-full">
            Şifreyi değiştir
          </Button>
        </Field>
      </div>
      <div className="mt-8 border-t-2 border-line pt-5">
        <div className="font-bold">Hesabı sil</div>
        <p className="mt-1 mb-3 text-[13px] text-neutral-700">
          Tüm randevu geçmişin ve değerlendirmelerin kalıcı olarak silinir.
        </p>
        <Button variant="danger">Hesabımı sil</Button>
      </div>
    </section>
  );
}
