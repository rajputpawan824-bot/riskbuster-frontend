import { HomeWorkspace } from "@/components/site/HomeWorkspace";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeWorkspace />
    </Suspense>
  );
}
