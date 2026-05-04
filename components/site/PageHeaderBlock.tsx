import { BrandLogo } from "./BrandLogo";

export function PageHeaderBlock() {
  return (
    <div className="bg-[#f3f4f6] py-3 max-lg:hidden">
      <div className="mx-auto px-4">
        <div className="flex items-center gap-4">
          <BrandLogo />
          <p className="pl-4 mt-2 text-xs font-semibold tracking-[0.2em] text-[#001f3f] border-l-2 border-[#001f3f]">
            SECURITY THREAT AND RISK MANAGEMENT
          </p>
        </div>
      </div>
    </div>
  );
}
