import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Beef Court",
    short_name: "Beef Court",
    description: "Settle it. For good. Independent AI validators rule on GenLayer.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F4F1",
    theme_color: "#150A0E",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
  };
}
