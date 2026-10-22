"use client";

import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import BackLink from "@/components/molecules/BackLink";
import MobileActionBar from "@/components/molecules/MobileActionBar";
import HoursSection from "@/features/customer/salon/components/HoursSection";
import PortfolioGallery from "@/features/customer/salon/components/PortfolioGallery";
import ReviewsSection from "@/features/customer/salon/components/ReviewsSection";
import SalonGate from "@/features/customer/salon/components/SalonGate";
import SalonProfileHeader from "@/features/customer/salon/components/SalonProfileHeader";
import { useSalonReviews } from "@/features/customer/salon/hooks/useSalon";
import SalonSectionNav from "@/features/customer/salon/components/SalonSectionNav";
import ServicesSection from "@/features/customer/salon/components/ServicesSection";
import { TODAY } from "@/lib/clock";
import { getDateParts } from "@/lib/date";
import { formatPrice } from "@/lib/format";
import { toWorkingHours } from "@/lib/schedule";

export default function SalonDetailPage({ salonId }) {
  return <SalonGate salonId={salonId}>{(salon) => <SalonDetail salon={salon} />}</SalonGate>;
}

function SalonDetail({ salon }) {
  const reviewsQuery = useSalonReviews(salon.id);
  const hours = toWorkingHours(salon.workingHours);
  const bookingHref = `/kuaforler/${salon.id}/randevu`;
  const galleryItems = salon.portfolio.map((item) => ({
    id: item.id,
    image: item.image,
    title: item.customerName || item.title || salon.name,
    subtitle: item.customerName ? item.title : item.description,
    rating: item.rating,
  }));

  return (
    <div className="page-container pt-6">
      <BackLink href="/kuaforler">Kuaförler</BackLink>
      <SalonProfileHeader salon={salon} hours={hours} closedDays={salon.blockedDates} />
      <SalonSectionNav />
      <ServicesSection salonId={salon.id} services={salon.services} />
      <PortfolioGallery items={galleryItems} />
      <ReviewsSection query={reviewsQuery} />
      <HoursSection hours={hours} todayWeekday={getDateParts(TODAY).weekdayIndex} />

      <MobileActionBar
        kicker="Başlangıç"
        value={salon.startingPrice === null ? "—" : formatPrice(salon.startingPrice)}
      >
        <Button variant="primary" href={bookingHref} className="h-12 gap-2.5 px-[18px]">
          Randevu Al
          <Icon name="arrowRight" />
        </Button>
      </MobileActionBar>
    </div>
  );
}
