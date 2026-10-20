import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import BackLink from "@/components/molecules/BackLink";
import MobileActionBar from "@/components/molecules/MobileActionBar";
import { TODAY } from "@/data/mock/clock";
import { portfolioItems } from "@/data/mock/portfolio";
import { ratingDistribution, salonReviews } from "@/data/mock/reviews";
import { services } from "@/data/mock/services";
import { workingHours } from "@/data/mock/workingHours";
import HoursSection from "@/features/salon/components/HoursSection";
import PortfolioGallery from "@/features/salon/components/PortfolioGallery";
import ReviewsSection from "@/features/salon/components/ReviewsSection";
import SalonProfileHeader from "@/features/salon/components/SalonProfileHeader";
import SalonSectionNav from "@/features/salon/components/SalonSectionNav";
import ServicesSection from "@/features/salon/components/ServicesSection";
import { getServiceName } from "@/lib/catalog";
import { getDateParts } from "@/lib/date";
import { formatPrice } from "@/lib/format";

const galleryItems = portfolioItems
  .filter((item) => item.published)
  .map((item) => ({ id: item.id, title: item.customer, subtitle: getServiceName(item.serviceId), rating: item.rating }));

const activeServices = services.filter((service) => service.active);

export default function SalonDetailPage({ salon }) {
  const bookingHref = `/kuaforler/${salon.id}/randevu`;

  return (
    <div className="page-container pt-6">
      <BackLink href="/kuaforler">Kuaförler</BackLink>
      <SalonProfileHeader salon={salon} />
      <SalonSectionNav />
      <ServicesSection salonId={salon.id} services={activeServices} />
      <PortfolioGallery items={galleryItems} />
      <ReviewsSection
        rating={salon.rating}
        reviewCount={salon.reviewCount}
        reviews={salonReviews}
        distribution={ratingDistribution}
      />
      <HoursSection hours={workingHours} todayWeekday={getDateParts(TODAY).weekdayIndex} />

      <MobileActionBar kicker="Başlangıç" value={formatPrice(salon.startingPrice)}>
        <Button variant="primary" href={bookingHref} className="h-12 gap-2.5 px-[18px]">
          Randevu Al
          <Icon name="arrowRight" />
        </Button>
      </MobileActionBar>
    </div>
  );
}
