export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-2 max-lg:py-2">
      <div className="relative shrink-0">
         <img
            src="/riskBuster-logo.png"
            alt="RiskBusters logo"
            className="h-8 sm:h-10 lg:h-12 w-auto"
          />
        </div>
      {!compact && (
        <div className="text-left">
          <p className="text-base sm:text-xl lg:text-2xl font-bold leading-tight">
            <span className="text-white lg:text-[#001f3f]">Risk</span>
            <span className="text-[#ffcc00]">Busters</span>
          </p>
        </div>
      )}
    </div>
  );
}
