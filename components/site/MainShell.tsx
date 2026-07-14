import { PageHeaderBlock } from "./PageHeaderBlock";
import { TopNav } from "./TopNav";
import { SiteFooter } from "./SiteFooter";

type Props = {
  children: React.ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
  showFooter?: boolean;
};

export function MainShell({
  children,
  showHeader = true,
  showNav = true,
  showFooter = true,
}: Props) {
  return (
    <div className="min-h-full flex flex-col bg-[#eceff3]">
      {showHeader && <PageHeaderBlock />}
      {showNav && <TopNav />}
      <div className="w-full flex-1 px-4 py-3">{children}</div>
      {showFooter && <SiteFooter />}
    </div>
  );
}
