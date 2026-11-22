'use client';

import {
  Booking,
  Vehicle,
  Route,
  RoutePricing,
  Driver,
  Testimonial,
  FAQ,
  SiteSetting,
  DashboardMetrics,
  BookingStatus,
} from "@/types";
import {
  INITIAL_BOOKINGS,
  INITIAL_VEHICLES,
  INITIAL_ROUTES,
  INITIAL_PRICING,
  INITIAL_DRIVERS,
  INITIAL_TESTIMONIALS,
  INITIAL_FAQS,
  INITIAL_SETTINGS,
} from "./data/initialData";
import { isSupabaseConfigured, supabase } from "./supabase/client";

const STORAGE_KEYS = {
  BOOKINGS: "umrah_admin_bookings_v1",
  VEHICLES: "umrah_admin_vehicles_v1",
  ROUTES: "umrah_admin_routes_v1",
  PRICING: "umrah_admin_pricing_v1",
  DRIVERS: "umrah_admin_drivers_v1",
  TESTIMONIALS: "umrah_admin_testimonials_v1",
  FAQS: "umrah_admin_faqs_v1",
  SETTINGS: "umrah_admin_settings_v1",
  AUTH: "umrah_admin_session_v1",
};

// Safe local storage getter
function getLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return fallback;
  }
}

// Safe local storage setter
function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("storage_updated"));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage`, err);
  }
}

export const dataStore = {
  // Check if live Supabase mode is active
  isLiveMode(): boolean {
    return isSupabaseConfigured();
  },

  // 1. BOOKINGS
  async getBookings(): Promise<Booking[]> {
    if (this.isLiveMode()) {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data && data.length > 0) return data as Booking[];
      } catch (e) {
        console.warn("Supabase fetch failed, falling back to local store", e);
      }
    }
    return getLocalStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  },

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    const bookings = await this.getBookings();
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) return null;

    const updated = { ...bookings[index], ...updates };
    bookings[index] = updated;
    setLocalStorage(STORAGE_KEYS.BOOKINGS, bookings);

    if (this.isLiveMode()) {
      try {
        await supabase.from("bookings").update(updates).eq("id", id);
      } catch (e) {
        console.error("Failed to sync booking update with Supabase", e);
      }
    }

    return updated;
  },

  async addBooking(newBookingData: Omit<Booking, "id" | "created_at" | "booking_reference">): Promise<Booking> {
    const bookings = await this.getBookings();
    const randomRefNum = Math.floor(10000 + Math.random() * 90000);
    const newBooking: Booking = {
      ...newBookingData,
      id: "bk-" + Date.now(),
      created_at: new Date().toISOString(),
      booking_reference: `UTO-${randomRefNum}`,
    };

    const updatedList = [newBooking, ...bookings];
    setLocalStorage(STORAGE_KEYS.BOOKINGS, updatedList);

    if (this.isLiveMode()) {
      try {
        await supabase.from("bookings").insert([newBooking]);
      } catch (e) {
        console.error("Failed to sync new booking with Supabase", e);
      }
    }

    return newBooking;
  },

  async deleteBooking(id: string): Promise<boolean> {
    const bookings = await this.getBookings();
    const filtered = bookings.filter((b) => b.id !== id);
    setLocalStorage(STORAGE_KEYS.BOOKINGS, filtered);

    if (this.isLiveMode()) {
      try {
        await supabase.from("bookings").delete().eq("id", id);
      } catch (e) {
        console.error("Failed to delete booking in Supabase", e);
      }
    }
    return true;
  },

  // 2. VEHICLES
  async getVehicles(): Promise<Vehicle[]> {
    if (this.isLiveMode()) {
      try {
        const { data, error } = await supabase
          .from("vehicles")
          .select("*")
          .order("display_order", { ascending: true });
        if (!error && data && data.length > 0) return data as Vehicle[];
      } catch (e) {
        console.warn("Supabase vehicles fetch failed", e);
      }
    }
    return getLocalStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES);
  },

  async saveVehicle(vehicle: Vehicle): Promise<Vehicle> {
    const list = await this.getVehicles();
    const index = list.findIndex((v) => v.id === vehicle.id);
    let updatedList: Vehicle[];

    if (index >= 0) {
      updatedList = [...list];
      updatedList[index] = vehicle;
    } else {
      updatedList = [...list, vehicle];
    }

    setLocalStorage(STORAGE_KEYS.VEHICLES, updatedList);

    if (this.isLiveMode()) {
      try {
        await supabase.from("vehicles").upsert(vehicle);
      } catch (e) {
        console.error("Supabase vehicle save failed", e);
      }
    }
    return vehicle;
  },

  async deleteVehicle(id: string): Promise<boolean> {
    const list = await this.getVehicles();
    const filtered = list.filter((v) => v.id !== id);
    setLocalStorage(STORAGE_KEYS.VEHICLES, filtered);

    if (this.isLiveMode()) {
      try {
        await supabase.from("vehicles").delete().eq("id", id);
      } catch (e) {
        console.error("Supabase vehicle delete failed", e);
      }
    }
    return true;
  },

  // 3. ROUTES
  async getRoutes(): Promise<Route[]> {
    if (this.isLiveMode()) {
      try {
        const { data, error } = await supabase
          .from("routes")
          .select("*")
          .order("display_order", { ascending: true });
        if (!error && data && data.length > 0) return data as Route[];
      } catch (e) {
        console.warn("Supabase routes fetch failed", e);
      }
    }
    return getLocalStorage<Route[]>(STORAGE_KEYS.ROUTES, INITIAL_ROUTES);
  },

  async saveRoute(route: Route): Promise<Route> {
    const list = await this.getRoutes();
    const index = list.findIndex((r) => r.id === route.id);
    let updatedList: Route[];

    if (index >= 0) {
      updatedList = [...list];
      updatedList[index] = route;
    } else {
      updatedList = [...list, route];
    }

    setLocalStorage(STORAGE_KEYS.ROUTES, updatedList);

    if (this.isLiveMode()) {
      try {
        await supabase.from("routes").upsert(route);
      } catch (e) {
        console.error("Supabase route save failed", e);
      }
    }
    return route;
  },

  async deleteRoute(id: string): Promise<boolean> {
    const list = await this.getRoutes();
    const filtered = list.filter((r) => r.id !== id);
    setLocalStorage(STORAGE_KEYS.ROUTES, filtered);

    if (this.isLiveMode()) {
      try {
        await supabase.from("routes").delete().eq("id", id);
      } catch (e) {
        console.error("Supabase route delete failed", e);
      }
    }
    return true;
  },

  // 4. PRICING MATRIX
  async getPricing(): Promise<RoutePricing[]> {
    if (this.isLiveMode()) {
      try {
        const { data, error } = await supabase.from("route_pricing").select("*");
        if (!error && data && data.length > 0) return data as RoutePricing[];
      } catch (e) {
        console.warn("Supabase pricing fetch failed", e);
      }
    }
    return getLocalStorage<RoutePricing[]>(STORAGE_KEYS.PRICING, INITIAL_PRICING);
  },

  async updatePrice(routeId: string, vehicleId: string, priceSar: number): Promise<void> {
    const pricing = await this.getPricing();
    const existingIndex = pricing.findIndex(
      (p) => p.route_id === routeId && p.vehicle_id === vehicleId
    );

    let updatedList: RoutePricing[];
    if (existingIndex >= 0) {
      updatedList = [...pricing];
      updatedList[existingIndex] = { ...updatedList[existingIndex], price_sar: priceSar };
    } else {
      updatedList = [
        ...pricing,
        { id: `prc-${Date.now()}`, route_id: routeId, vehicle_id: vehicleId, price_sar: priceSar },
      ];
    }

    setLocalStorage(STORAGE_KEYS.PRICING, updatedList);

    if (this.isLiveMode()) {
      try {
        await supabase
          .from("route_pricing")
          .upsert({ route_id: routeId, vehicle_id: vehicleId, price_sar: priceSar }, { onConflict: "route_id,vehicle_id" });
      } catch (e) {
        console.error("Supabase price update failed", e);
      }
    }
  },

  // 5. DRIVERS
  async getDrivers(): Promise<Driver[]> {
    return getLocalStorage<Driver[]>(STORAGE_KEYS.DRIVERS, INITIAL_DRIVERS);
  },

  async saveDriver(driver: Driver): Promise<Driver> {
    const list = await this.getDrivers();
    const index = list.findIndex((d) => d.id === driver.id);
    let updatedList: Driver[];

    if (index >= 0) {
      updatedList = [...list];
      updatedList[index] = driver;
    } else {
      updatedList = [...list, driver];
    }

    setLocalStorage(STORAGE_KEYS.DRIVERS, updatedList);
    return driver;
  },

  async deleteDriver(id: string): Promise<boolean> {
    const list = await this.getDrivers();
    const filtered = list.filter((d) => d.id !== id);
    setLocalStorage(STORAGE_KEYS.DRIVERS, filtered);
    return true;
  },

  // 6. TESTIMONIALS
  async getTestimonials(): Promise<Testimonial[]> {
    if (this.isLiveMode()) {
      try {
        const { data, error } = await supabase.from("testimonials").select("*").order("display_order", { ascending: true });
        if (!error && data && data.length > 0) return data as Testimonial[];
      } catch (e) {
        console.warn("Supabase testimonials fetch failed", e);
      }
    }
    return getLocalStorage<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
  },

  async saveTestimonial(testimonial: Testimonial): Promise<Testimonial> {
    const list = await this.getTestimonials();
    const index = list.findIndex((t) => t.id === testimonial.id);
    let updatedList: Testimonial[];

    if (index >= 0) {
      updatedList = [...list];
      updatedList[index] = testimonial;
    } else {
      updatedList = [...list, testimonial];
    }

    setLocalStorage(STORAGE_KEYS.TESTIMONIALS, updatedList);
    return testimonial;
  },

  async deleteTestimonial(id: string): Promise<boolean> {
    const list = await this.getTestimonials();
    setLocalStorage(STORAGE_KEYS.TESTIMONIALS, list.filter((t) => t.id !== id));
    return true;
  },

  // 7. FAQS
  async getFAQs(): Promise<FAQ[]> {
    if (this.isLiveMode()) {
      try {
        const { data, error } = await supabase.from("faqs").select("*").order("display_order", { ascending: true });
        if (!error && data && data.length > 0) return data as FAQ[];
      } catch (e) {
        console.warn("Supabase faqs fetch failed", e);
      }
    }
    return getLocalStorage<FAQ[]>(STORAGE_KEYS.FAQS, INITIAL_FAQS);
  },

  async saveFAQ(faq: FAQ): Promise<FAQ> {
    const list = await this.getFAQs();
    const index = list.findIndex((f) => f.id === faq.id);
    let updatedList: FAQ[];

    if (index >= 0) {
      updatedList = [...list];
      updatedList[index] = faq;
    } else {
      updatedList = [...list, faq];
    }

    setLocalStorage(STORAGE_KEYS.FAQS, updatedList);
    return faq;
  },

  async deleteFAQ(id: string): Promise<boolean> {
    const list = await this.getFAQs();
    setLocalStorage(STORAGE_KEYS.FAQS, list.filter((f) => f.id !== id));
    return true;
  },

  // 8. SITE SETTINGS
  async getSettings(): Promise<SiteSetting[]> {
    if (this.isLiveMode()) {
      try {
        const { data, error } = await supabase.from("site_settings").select("*");
        if (!error && data && data.length > 0) return data as SiteSetting[];
      } catch (e) {
        console.warn("Supabase settings fetch failed", e);
      }
    }
    return getLocalStorage<SiteSetting[]>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  async updateSetting(key: string, value: string): Promise<void> {
    const settings = await this.getSettings();
    const index = settings.findIndex((s) => s.key === key);
    if (index >= 0) {
      settings[index] = { ...settings[index], value, updated_at: new Date().toISOString() };
    } else {
      settings.push({ id: `set-${Date.now()}`, key, value, label: key, category: "general", updated_at: new Date().toISOString() });
    }
    setLocalStorage(STORAGE_KEYS.SETTINGS, settings);

    if (this.isLiveMode()) {
      // 1. Try update first on matching key
      const { data, error: updateError } = await supabase
        .from("site_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key)
        .select();

      if (updateError) {
        console.error("Supabase settings update failed:", updateError);
        throw new Error(`Supabase RLS/Update Error: ${updateError.message}`);
      }

      // 2. If row did not exist yet, insert it
      if (!data || data.length === 0) {
        const { error: insertError } = await supabase
          .from("site_settings")
          .insert([{ key, value, label: key, category: "general", updated_at: new Date().toISOString() }]);
        if (insertError) {
          console.error("Supabase settings insert failed:", insertError);
          throw new Error(`Supabase Insert Error: ${insertError.message}`);
        }
      }
    }
  },

  // 9. METRICS CALCULATOR
  async getMetrics(): Promise<DashboardMetrics> {
    const bookings = await this.getBookings();
    const todayStr = new Date().toISOString().split("T")[0];

    const pendingCount = bookings.filter((b) => b.status === "pending").length;
    const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
    const dispatchedCount = bookings.filter((b) => b.status === "dispatched").length;
    const completedCount = bookings.filter((b) => b.status === "completed").length;

    const totalRevenueSar = bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + (Number(b.estimated_price_sar) || 0), 0);

    const todayCount = bookings.filter(
      (b) => b.travel_date === todayStr || (b.created_at && b.created_at.startsWith(todayStr))
    ).length;

    return {
      totalBookings: bookings.length,
      pendingCount,
      confirmedCount,
      dispatchedCount,
      completedCount,
      totalRevenueSar,
      todayCount,
    };
  },

  // 10. AUTHENTICATION (Hardcoded Admin Credentials in Supabase with fallback)
  async loginAdmin(username: string, password: string): Promise<{ success: boolean; message?: string }> {
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, message: "Please enter both username and password." };
    }

    // 1. Check live Supabase public.admin_users table if configured
    if (this.isLiveMode()) {
      try {
        const { data, error } = await supabase
          .from("admin_users")
          .select("id, username, role")
          .eq("username", cleanUser)
          .eq("password", cleanPass)
          .maybeSingle();

        if (!error && data) {
          const session = {
            id: data.id,
            username: data.username,
            role: data.role || "admin",
            source: "supabase_db",
            token: "sb-auth-" + Date.now(),
          };
          setLocalStorage(STORAGE_KEYS.AUTH, session);
          return { success: true };
        }
      } catch (err) {
        console.warn("Supabase auth check note:", err);
      }
    }

    // 2. Default hardcoded admin credentials fallback
    if (cleanUser === "admin" && cleanPass === "umrah@admin2026") {
      const session = {
        id: "usr-admin-default",
        username: "admin",
        role: "superadmin",
        source: "system_default",
        token: "def-auth-" + Date.now(),
      };
      setLocalStorage(STORAGE_KEYS.AUTH, session);
      return { success: true };
    }

    return {
      success: false,
      message: "Invalid credentials. Please verify your username and password.",
    };
  },

  getAdminSession(): { username: string; role: string; token: string } | null {
    return getLocalStorage<{ username: string; role: string; token: string } | null>(
      STORAGE_KEYS.AUTH,
      null
    );
  },

  logoutAdmin(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEYS.AUTH);
    window.dispatchEvent(new Event("storage_updated"));
  },

  // Factory Reset
  resetToDefaultSeed(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    window.localStorage.removeItem(STORAGE_KEYS.VEHICLES);
    window.localStorage.removeItem(STORAGE_KEYS.ROUTES);
    window.localStorage.removeItem(STORAGE_KEYS.PRICING);
    window.localStorage.removeItem(STORAGE_KEYS.DRIVERS);
    window.localStorage.removeItem(STORAGE_KEYS.TESTIMONIALS);
    window.localStorage.removeItem(STORAGE_KEYS.FAQS);
    window.localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    window.location.reload();
  },
};
