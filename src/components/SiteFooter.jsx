const quickLinks = [
  "Home",
  "Competitions",
  "Teams",
  "Schedule",
  "About Us",
  "Sponsors",
  "Job Orbit",
  "Workshops",
  "Contact",
];
const competitions = [
  "Computer Science",
  "Artificial Intelligence",
  "Engineering",
  "Business",
  "Gaming",
];

function FooterColumn({ title, links }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <h2 className="mb-1 font-pixel text-[10px] leading-3.5 tracking-[1.8px] text-ink">
        {title}
      </h2>
      {links.map((link) => (
        <a
          className="text-[14px] leading-5.5 text-ink-muted transition-colors hover:text-violet-200"
          href={link === "Schedule" ? "#upcoming-panels" : "#top"}
          key={link}
        >
          {link}
        </a>
      ))}
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-line-subtle bg-bg-100 px-6 pb-8 pt-12 md:px-16 md:pt-16">
      <div className="mx-auto flex w-full max-w-300 flex-col gap-12">
        <div className="grid grid-cols-2 items-start gap-10 md:grid-cols-4 md:gap-12 lg:grid-cols-[360px_1fr_1fr_1fr] lg:gap-16">
          <div className="col-span-2 flex flex-col items-start gap-4 md:col-span-1">
            <p className="font-stat text-[20px] leading-7 text-ink">
              PROCOM’27
            </p>
            <p className="max-w-90 text-[14px] leading-5.5 text-ink-muted">
              The flagship student tech event of FAST-NUCES Karachi.
              Competitions, workshops, talks and communities.
            </p>
          </div>
          <FooterColumn title="QUICK LINKS" links={quickLinks} />
          <FooterColumn title="COMPETITIONS" links={competitions} />
          <FooterColumn
            title="CONTACT"
            links={["[Email]", "[Phone]", "[Campus address]"]}
          />
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
