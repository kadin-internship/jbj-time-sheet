import type { MetadataRoute } from "next";
import { BRAND_COLORS } from "@/lib/constants/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "JBJ Time Sheet",
    short_name: "JBJ Time",
    description: "JBJ employee time sheet portal",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: BRAND_COLORS.white,
    theme_color: BRAND_COLORS.maroon,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
