import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.riskbusters.co.in";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/login", "/register", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
