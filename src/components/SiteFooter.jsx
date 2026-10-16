const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Competitions", href: "/#upcoming-panels" },
  { label: "Teams", href: "/teams/artificial-intelligence" },
  { label: "Schedule", href: "/#upcoming-panels" },
  { label: "About Us", href: "/" },
  { label: "Sponsors", href: "/" },
  { label: "Job Orbit", href: "/" },
  { label: "Workshops", href: "/" },
  { label: "Contact", href: "/teams/artificial-intelligence#team-leadership" },
];
const competitions = [
  { label: "Computer Science", href: "/#upcoming-panels" },
  { label: "Artificial Intelligence", href: "/teams/artificial-intelligence" },
  { label: "Engineering", href: "/#upcoming-panels" },
  { label: "Business", href: "/#upcoming-panels" },
  { label: "Gaming", href: "/#upcoming-panels" },
];

function FooterColumn({ title, links }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <h2 className="font-pixel text-[11px] leading-[14px] tracking-[1.98px] text-ink">
        {title}
      </h2>
      {links.map((link) => (
        <a
          className="text-[14px] leading-5.5 text-ink-muted transition-colors hover:text-violet-200"
          href={typeof link === "string" ? "#top" : link.href}
          key={typeof link === "string" ? link : link.label}
        >
          {typeof link === "string" ? link : link.label}
        </a>
      ))}
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-line-subtle bg-bg-100 px-6 pb-8 pt-12 md:px-16 md:pt-16">
      <div className="mx-auto flex w-full max-w-300 flex-col gap-12">
        <div className="flex flex-col items-start gap-10 lg:flex-row lg:gap-16">
          <div className="flex w-full flex-col items-start gap-4 lg:w-90 lg:shrink-0">
            <p className="font-stat text-[28px] leading-9 text-ink">
              PROCOM’27
            </p>
            <p className="max-w-90 text-[14px] leading-5.5 text-ink-muted">
              The flagship student tech event of FAST-NUCES Karachi.
              Competitions, workshops, talks and communities.
            </p>
          </div>
          <div className="grid w-full grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-3 md:gap-x-12 md:gap-y-0 lg:min-w-0 lg:flex-1">
            <FooterColumn title="QUICK LINKS" links={quickLinks} />
            <FooterColumn title="COMPETITIONS" links={competitions} />
            <FooterColumn
              title="CONTACT"
              links={["[Email]", "[Phone]", "[Campus address]"]}
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t border-line-subtle pt-6 text-[12px] leading-4 text-ink-muted md:flex-row md:items-center md:justify-between">
          <p>© PROCOM’27. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="#top">Privacy Policy</a>
            <a href="#top">Terms &amp; Conditions</a>
            <a href="#top">Return &amp; Refund Policy</a>
            <a href="#top">Shipping Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
