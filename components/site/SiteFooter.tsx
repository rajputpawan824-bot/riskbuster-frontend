import { BrandLogo } from "./BrandLogo";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[#001f3f] py-5 text-center text-sm text-white/90 footer group">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-4 sm:flex-row sm:gap-3">
        <BrandLogo compact />
        <p>© 2024 RiskBusters - Security Threat and Risk Management. All rights reserved.</p>
      </div>
    </footer>
  );
}
