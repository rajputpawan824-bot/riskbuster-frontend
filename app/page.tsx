import { MainShell } from "@/components/site/MainShell";
import { OngoingDashboard } from "@/components/dashboard/OngoingDashboard";

export default function Home() {
  return (
    <MainShell>
      <OngoingDashboard />
    </MainShell>
  );
}
