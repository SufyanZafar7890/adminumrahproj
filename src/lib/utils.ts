import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BookingStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencySAR(amount: number): string {
  return `${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} SAR`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateTimeString?: string): string {
  if (!dateTimeString) return "N/A";
  try {
    const d = new Date(dateTimeString);
    if (isNaN(d.getTime())) return dateTimeString;
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateTimeString;
  }
}

export function getStatusBadgeClass(status: BookingStatus): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case "pending":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-500",
        border: "border-amber-500/20",
        dot: "bg-amber-500 animate-pulse",
      };
    case "confirmed":
      return {
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        border: "border-blue-500/20",
        dot: "bg-blue-500",
      };
    case "dispatched":
      return {
        bg: "bg-purple-500/10",
        text: "text-purple-400",
        border: "border-purple-500/20",
        dot: "bg-purple-500 animate-pulse",
      };
    case "completed":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
        dot: "bg-emerald-500",
      };
    case "cancelled":
      return {
        bg: "bg-rose-500/10",
        text: "text-rose-400",
        border: "border-rose-500/20",
        dot: "bg-rose-500",
      };
    default:
      return {
        bg: "bg-slate-500/10",
        text: "text-slate-400",
        border: "border-slate-500/20",
        dot: "bg-slate-500",
      };
  }
}

export function createWhatsAppChatUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function buildCustomerConfirmationMessage(booking: {
  booking_reference: string;
  customer_name: string;
  route_title: string;
  travel_date: string;
  pickup_time?: string;
  flight_number?: string;
  vehicle_name: string;
  estimated_price_sar: number;
  assigned_driver_name?: string;
  assigned_driver_phone?: string;
}): string {
  return `*Assalam o Alaikum ${booking.customer_name},*
Your Umrah Taxi Booking is *CONFIRMED*!

📌 *Booking Ref:* ${booking.booking_reference}
🕋 *Route:* ${booking.route_title}
📅 *Date:* ${booking.travel_date} ${booking.pickup_time ? `at ${booking.pickup_time}` : ""}
${booking.flight_number ? `✈️ *Flight:* ${booking.flight_number}\n` : ""}🚗 *Vehicle:* ${booking.vehicle_name}
💰 *Total Fare:* ${booking.estimated_price_sar} SAR (Pay on Arrival in Cash/Transfer)
${booking.assigned_driver_name ? `👨‍✈️ *Chauffeur:* ${booking.assigned_driver_name} (${booking.assigned_driver_phone || "Contact via Dispatch"})\n` : ""}
✅ *Includes:* Tolls, parking, airport luggage meet & greet, and complimentary Miqat prayer stop.

Our chauffeur will meet you at the terminal/lobby. Jazakallah Khair!`;
}

export function buildDriverDispatchMessage(booking: {
  booking_reference: string;
  customer_name: string;
  customer_phone: string;
  route_title: string;
  travel_date: string;
  pickup_time?: string;
  flight_number?: string;
  vehicle_name: string;
  passengers: number;
  luggage: number;
  estimated_price_sar: number;
  pickup_address?: string;
  dropoff_hotel?: string;
  notes?: string;
}): string {
  return `*🚨 NEW TRIP DISPATCH ASSIGNMENT*
*Booking Ref:* ${booking.booking_reference}

👤 *Customer:* ${booking.customer_name}
📞 *Customer Phone:* ${booking.customer_phone}
📍 *Route:* ${booking.route_title}
📅 *Date & Time:* ${booking.travel_date} ${booking.pickup_time ? `at ${booking.pickup_time}` : ""}
${booking.flight_number ? `✈️ *Flight No:* ${booking.flight_number}\n` : ""}👥 *Pax:* ${booking.passengers} | 🧳 *Bags:* ${booking.luggage}
🚗 *Vehicle Tier:* ${booking.vehicle_name}
${booking.pickup_address ? `🏢 *Pickup:* ${booking.pickup_address}\n` : ""}${booking.dropoff_hotel ? `🏨 *Destination:* ${booking.dropoff_hotel}\n` : ""}💵 *FARE TO COLLECT ON ARRIVAL:* ${booking.estimated_price_sar} SAR
${booking.notes ? `📝 *Notes:* ${booking.notes}\n` : ""}
Please confirm receipt and acknowledge when heading to pickup.`;
}
