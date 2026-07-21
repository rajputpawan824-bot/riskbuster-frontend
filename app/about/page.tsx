import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MainShell } from "@/components/site/MainShell";

export const metadata: Metadata = {
  title: "About Us — RiskBusters",
  description:
    "Riskbusters.co.in: a knowledge-driven platform for Security Threat and Risk Management — insights, founder background, and what the platform offers.",
};

const careerHighlights = [
  "United Nations Department of Safety and Security (UNDSS), India",
  "Large-scale international infrastructure projects in Bangladesh and Afghanistan",
  "Leading organizations including Nokia India and global joint ventures",
];

const platformTopics: { title: string; description: string }[] = [
  {
    title: "Security Risk Management",
    description:
      "Understanding threats, vulnerabilities, and risk mitigation strategies across industries.",
  },
  {
    title: "Intelligence & Threat Analysis",
    description:
      "Foundations of intelligence gathering, analysis, and situational awareness.",
  },
  {
    title: "Crisis & Disaster Management",
    description:
      "Practical approaches to emergency response, disaster preparedness, and business continuity.",
  },
  {
    title: "Security Systems & Audits",
    description:
      "Insights into physical and electronic security systems, audits, and best practices.",
  },
  {
    title: "Field-Based Learning",
    description: "Lessons drawn from real-world experiences in high-risk and conflict environments.",
  },
  {
    title: "Training & Awareness",
    description:
      "Guidance for building security awareness, preparedness, and resilience at individual and organizational levels.",
  },
];

const philosophy = [
  "Knowledge should be shared, not restricted",
  "Prevention is always better than reaction",
  "Awareness is the first step toward safety",
  "Real-world experience is the most valuable teacher",
];

export default function AboutPage() {
  return (
    <MainShell>
      <article className="mx-auto w-full max-w-6xl pb-8 sm:pb-10 lg:pb-12">
        <header className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-6 p-5 sm:p-7 md:p-8 lg:flex-row lg:items-start lg:gap-10 lg:p-10">
            <div className="mx-auto shrink-0 text-center lg:mx-0 lg:text-left">
              <div className="relative inline-block overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-sm ring-1 ring-black/5">
                <Image
                  src="/about-founder.jpeg"
                  alt="Portrait associated with Riskbusters founder materials"
                  width={213}
                  height={236}
                  className="h-auto w-full max-w-[min(100%,280px)] object-cover sm:max-w-[300px]"
                  sizes="(max-width: 1024px) 100vw, 320px"
                  priority
                />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-[#001f3f] sm:text-3xl md:text-4xl">
                About Us
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-gray-700 sm:text-base">
                Welcome to{" "}
                <a
                  href="https://riskbusters.co.in"
                  className="font-bold text-[#001f3f] underline-offset-2 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Riskbusters.co.in
                </a>{" "}
                — a knowledge-driven platform dedicated to sharing insights, best practices, and
                real-world experience across the full spectrum of{" "}
                <strong className="font-semibold text-[#001f3f]">
                  Security Threat and Risk Management
                </strong>
                .
              </p>
              <p className="mt-4 text-sm leading-relaxed text-gray-700 sm:text-base">
                This initiative has been created with a clear purpose:
                to{" "}
                <strong className="font-semibold text-[#001f3f]">
                  impart practical, experience-based knowledge freely
                </strong>{" "}
                to professionals, students, organizations, and anyone interested in understanding
                and managing security risks in today&apos;s complex world.
              </p>
            </div>
          </div>
        </header>

        <section
          className="mt-6 rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm sm:mt-8 sm:p-7 md:p-8 lg:mt-10"
          aria-labelledby="founder-heading"
        >
          <h2
            id="founder-heading"
            className="text-xl font-bold text-[#001f3f] sm:text-2xl md:text-[1.65rem]"
          >
            Our Founder
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-700 sm:text-base">
            Riskbusters is founded by <strong className="font-semibold text-[#001f3f]">Sureinder Kumar</strong>, a
            former <strong className="font-semibold text-[#001f3f]">United Nations Security Professional</strong>{" "}
            with over{" "}
            <strong className="font-semibold text-[#001f3f]">40 years of distinguished experience</strong> in
            security risk management, intelligence analysis, and administration across national
            and international environments.
          </p>
          <p className="mt-4 text-sm font-medium text-gray-800 sm:text-base">
            His career spans assignments with:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700 marker:text-[#001f3f] sm:text-base">
            {careerHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-gray-700 sm:text-base">
            During his tenure with the United Nations, he maintained a{" "}
            <strong className="font-semibold text-[#001f3f]">
              zero-security-incident record over five consecutive years
            </strong>
            , reflecting a strong foundation in proactive risk management and operational excellence.
          </p>
        </section>

        <section
          className="mt-6 rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm sm:mt-8 sm:p-7 md:p-8 lg:mt-10"
          aria-labelledby="platform-heading"
        >
          <h2
            id="platform-heading"
            className="text-xl font-bold text-[#001f3f] sm:text-2xl md:text-[1.65rem]"
          >
            What This Platform Offers
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-700 sm:text-base">
            Riskbusters.co.in is <strong className="font-semibold text-[#001f3f]">not a commercial venture</strong>.
            It is a <strong className="font-semibold text-[#001f3f]">knowledge-sharing initiative</strong> designed to
            make high-quality security insights accessible to all.
          </p>
          <p className="mt-4 text-sm font-medium text-gray-800 sm:text-base">The platform will cover:</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {platformTopics.map(({ title, description }) => (
              <div
                key={title}
                className="rounded-lg border border-gray-100 bg-[#f8fafc] p-4 sm:p-5"
              >
                <h3 className="text-sm font-bold text-[#001f3f] sm:text-base">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="mt-6 rounded-xl border border-[#001f3f]/15 bg-[#001f3f] p-5 text-white sm:mt-8 sm:p-7 md:p-8 lg:mt-10"
          aria-labelledby="philosophy-heading"
        >
          <h2 id="philosophy-heading" className="text-xl font-bold sm:text-2xl">
            Our Philosophy
          </h2>
          <p className="mt-3 text-sm text-white/90 sm:text-base">We believe that:</p>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed sm:text-base">
            {philosophy.map((line) => (
              <li key={line} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ffcc00]" aria-hidden />
                <span className="text-white/95">
                  <strong className="font-semibold text-white">{line}</strong>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-5 text-center sm:mt-8 sm:flex-row sm:pt-6 sm:text-left">
          <p className="text-xs text-gray-500 sm:text-sm">
            © 2024 RiskBusters — Security Threat and Risk Management.
          </p>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#001f3f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#002a52] sm:min-h-0"
          >
            Back to home
          </Link>
        </footer>
      </article>
    </MainShell>
  );
}
