import { PageHeaderBlock } from "./PageHeaderBlock";
import { TopNav } from "./TopNav";
import { SiteFooter } from "./SiteFooter";

export function MainShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col bg-[#eceff3]">
      <PageHeaderBlock />
      <TopNav />
      <div className="w-full flex-1 px-4 py-3">{children}</div>
      <SiteFooter />
    </div>
  );
}
