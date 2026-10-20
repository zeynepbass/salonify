"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/atoms/Icon";
import { myReviews } from "@/data/mock/reviews";
import { currentUser } from "@/data/mock/users";
import AccountSection from "@/features/profile/components/AccountSection";
import MyReviewsSection from "@/features/profile/components/MyReviewsSection";
import NotificationPreferences from "@/features/profile/components/NotificationPreferences";
import SettingsSection from "@/features/profile/components/SettingsSection";
import { cn } from "@/lib/cn";

const SECTIONS = [
  { key: "account", label: "Hesap bilgilerim", icon: "user" },
  { key: "appointments", label: "Randevularım", icon: "calendar", href: "/randevularim" },
  { key: "reviews", label: "Değerlendirmelerim", icon: "star" },
  { key: "notifications", label: "Bildirimler", icon: "bell" },
  { key: "settings", label: "Ayarlar", icon: "sliders" },
];

const ITEM = "flex items-center gap-2.5 border-b border-line px-3 py-3.5 text-left text-[14px] font-semibold whitespace-nowrap transition-colors hover:bg-neutral-200";

export default function ProfilePage() {
  const [active, setActive] = useState("account");

  return (
    <div className="page-container max-w-[1080px] pt-8">
      <h1 className="mb-6 text-[clamp(30px,3.6vw,44px)]">Profil</h1>
      <div className="flex flex-wrap items-start gap-x-10 gap-y-8">
        <nav
          aria-label="Profil bölümleri"
          className="flex w-full border-t-2 border-ink max-md:overflow-x-auto md:max-w-[280px] md:flex-[1_1_220px] md:flex-col"
        >
          {SECTIONS.map((section) =>
            section.href ? (
              <Link key={section.key} href={section.href} className={ITEM}>
                <Icon name={section.icon} />
                {section.label}
              </Link>
            ) : (
              <button
                key={section.key}
                type="button"
                aria-current={active === section.key ? "page" : undefined}
                onClick={() => setActive(section.key)}
                className={cn(ITEM, active === section.key && "bg-surface text-accent")}
              >
                <Icon name={section.icon} />
                {section.label}
              </button>
            ),
          )}
        </nav>
        <div className="min-w-0 flex-[3_1_480px]">
          {active === "account" && <AccountSection user={currentUser} />}
          {active === "reviews" && <MyReviewsSection reviews={myReviews} />}
          {active === "notifications" && (
            <NotificationPreferences initialPreferences={currentUser.notificationPreferences} />
          )}
          {active === "settings" && <SettingsSection />}
        </div>
      </div>
    </div>
  );
}
