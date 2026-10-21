"use client";

import { useEffect, useState } from "react";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import Spinner from "@/components/atoms/Spinner";
import BackLink from "@/components/molecules/BackLink";
import MobileActionBar from "@/components/molecules/MobileActionBar";
import HoursSection from "@/features/customer/salon/components/HoursSection";
import PortfolioGallery from "@/features/customer/salon/components/PortfolioGallery";
import ReviewsSection from "@/features/customer/salon/components/ReviewsSection";
import SalonProfileHeader from "@/features/customer/salon/components/SalonProfileHeader";
import SalonSectionNav from "@/features/customer/salon/components/SalonSectionNav";
import ServicesSection from "@/features/customer/salon/components/ServicesSection";
import SalonNotFound from "@/features/customer/salon/SalonNotFound";
import { api, getErrorMessage, isNotFound } from "@/lib/api";
import { TODAY } from "@/lib/clock";
import { getDateParts } from "@/lib/date";
import { formatPrice } from "@/lib/format";
import { toWorkingHours } from "@/lib/schedule";

const REVIEW_LIMIT = 20;

export default function SalonDetailPage({ salonId }) {
  const [state, setState] = useState({ status: "loading", salon: null, reviews: null, error: null });

  useEffect(() => {
    let ignore = false;

    Promise.all([
      api.get(`/salons/${salonId}`),
      api.get(`/salons/${salonId}/reviews`, { params: { limit: REVIEW_LIMIT } }),
    ])
      .then(([salon, reviews]) => {
        if (!ignore) setState({ status: "success", salon, reviews, error: null });
      })
      .catch((error) => {
        if (ignore) return;
        setState({ status: isNotFound(error) ? "not-found" : "error", salon: null, reviews: null, error: getErrorMessage(error) });
      });

    return () => {
      ignore = true;
    };
  }, [salonId]);

  if (state.status === "loading") {
    return (
      <div aria-busy="true" className="grid min-h-[50vh] place-items-center">
        <Spinner />
      </div>
    );
  }

  if (state.status === "not-found") return <SalonNotFound />;
  if (state.status === "error") return <SalonNotFound description={state.error} />;

  const { salon, reviews } = state;
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
      <ReviewsSection summary={reviews.summary} reviews={reviews.items} />
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
