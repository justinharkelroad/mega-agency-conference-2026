import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarBlank,
  CaretDown,
  Clock,
  Compass,
  List,
  LinkedinLogo,
  MagnifyingGlass,
  MapPin,
  MoonStars,
  Sun,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import directoryData from "./data/directory.json";
import sponsors from "./data/sponsors.json";

const agenda = [
  {
    id: "monday",
    short: "Mon 21",
    label: "Monday, September 21",
    note: "Arrival and introductions",
    sessions: [
      { time: "12:00 pm", title: "Sponsor setup", end: "3:00 pm", type: "Sponsors" },
      { time: "3:00 pm", title: "Registration and sponsor fair", end: "5:00 pm", type: "All attendees" },
      { time: "6:00 pm", title: "Welcome cocktail reception", end: "9:00 pm", type: "Electric Moon and Moon Deck", featured: true },
    ],
  },
  {
    id: "tuesday",
    short: "Tue 22",
    label: "Tuesday, September 22",
    note: "Ideas, peers and the river",
    sessions: [
      { time: "8:00 am", title: "Hosted breakfast buffet", end: "9:00 am", type: "Sponsor room" },
      { time: "9:00 am", title: "Welcome and ground rules", end: "9:15 am", type: "Chris Burke and Robert Varich" },
      { time: "9:15 am", title: "Main stage session", end: "10:45 am", type: "Speaker announcement soon" },
      { time: "10:45 am", title: "Coffee break", end: "11:00 am", type: "Sponsor room" },
      { time: "12:30 pm", title: "Taste of Savannah lunch", end: "2:00 pm", type: "Sponsor fair", featured: true },
      { time: "2:00 pm", title: "Mega survey", end: "2:30 pm", type: "Ryan Dunn, Chris Burke and Ned Loyd" },
      { time: "3:45 pm", title: "Afternoon main stage", end: "4:30 pm", type: "Speaker announcement soon" },
      { time: "6:00 pm", title: "Savannah River Queen dinner cruise", end: "9:00 pm", type: "Sponsor event", featured: true },
    ],
  },
  {
    id: "wednesday",
    short: "Wed 23",
    label: "Wednesday, September 23",
    note: "Take the good stuff home",
    sessions: [
      { time: "8:00 am", title: "Hosted breakfast buffet", end: "9:00 am", type: "Sponsor room" },
      { time: "9:00 am", title: "What is working and what changed", end: "10:30 am", type: "General session", featured: true },
      { time: "10:30 am", title: "Coffee break", end: "10:45 am", type: "Sponsor room" },
      { time: "10:45 am", title: "Closing sessions", end: "12:30 pm", type: "Speaker announcements soon" },
      { time: "12:30 pm", title: "Conference wrap-up", end: "2:00 pm", type: "General session" },
    ],
  },
];

const navItems = [
  { label: "Agenda", href: "#agenda", id: "agenda" },
  { label: "Directory", href: "#directory", id: "directory" },
  { label: "Sponsors", href: "#sponsors", id: "sponsors" },
];

const stateCodes = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID",
  "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO",
  "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA",
  "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

const leadCaptureApiUrl = (import.meta.env.VITE_LEAD_CAPTURE_API_URL || "").replace(/\/$/, "");
const leadCaptureSiteId = import.meta.env.VITE_SITE_ID || "";
const initialWaitlistFields = {
  submission_type: "MEGA 2026 waiting-list request",
  name: "",
  email: "",
  state: "",
  phone: "",
  book_size: "",
  staff_count: "",
  reason_for_attending: "",
  additional_information: "",
};

const reveal = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("mega-theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("mega-theme", theme);
  }, [theme]);

  return [theme, setTheme];
}

function Header({ onJoinWaitlist }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("");
  const [theme, setTheme] = useTheme();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries.find((entry) => entry.isIntersecting);
        if (current) setActive(current.target.id);
      },
      { rootMargin: "-35% 0px -55%", threshold: 0 },
    );
    navItems.forEach((item) => {
      const section = document.getElementById(item.id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Mega Agency Conference home">
        <span className="brand-mark">M</span>
        <span className="brand-name">MEGA<span> / 26</span></span>
      </a>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item.id} href={item.href} className={active === item.id ? "active" : ""}>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="header-actions">
        <button
          className="theme-toggle"
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? <Sun size={18} /> : <MoonStars size={18} />}
        </button>
        <button className="nav-register" type="button" onClick={onJoinWaitlist}>Join the waiting list</button>
        <button
          className="menu-toggle"
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="mobile-nav"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => (
              <a key={item.id} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
            ))}
            <button type="button" onClick={() => { setMenuOpen(false); onJoinWaitlist(); }}>Join the waiting list</button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function Hero({ onJoinWaitlist }) {
  const heroRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", reduceMotion ? "0%" : "12%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, reduceMotion ? 1 : 1.07]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 72]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.78], [1, 0]);

  return (
    <section className="hero" id="top" ref={heroRef}>
      <motion.img
        className="hero-image"
        src="/images/savannah-hero.webp"
        alt="Savannah riverfront and the illuminated historic power plant at blue hour"
        style={{ y: imageY, scale: imageScale }}
        fetchPriority="high"
      />
      <div className="hero-scrim" />
      <motion.div className="hero-content page-shell" style={{ y: contentY, opacity: contentOpacity }}>
        <motion.div className="hero-eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <span className="hero-status">Sold out</span>
          <span>September 21–23 · Savannah, Georgia</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          2026 Mega Agency Conference
        </motion.h1>
        <motion.p
          className="hero-tagline"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
        >
          Built on Excellence, Focused on the Future.
        </motion.p>
        <motion.p
          className="hero-summary"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Three days of candid ideas, shared experience, and time with the agents and partners who understand the work.
        </motion.p>
        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32 }}
        >
          <button className="primary-button" type="button" onClick={onJoinWaitlist}>
            Join the waiting list <ArrowRight size={18} weight="bold" />
          </button>
          <a className="text-link light" href="#agenda">See agenda <CaretDown size={16} /></a>
        </motion.div>
      </motion.div>
      <div className="hero-details page-shell">
        <div><CalendarBlank size={20} /><span><strong>September 21-23</strong>2026</span></div>
        <div><MapPin size={20} /><span><strong>Plant Riverside District</strong>Savannah, Georgia</span></div>
        <div><Compass size={20} /><span><strong>For agents</strong>Useful by design</span></div>
      </div>
    </section>
  );
}

function Intro() {
  return (
    <section className="intro-section page-shell" aria-labelledby="intro-heading">
      <motion.div
        className="intro-statement"
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="intro-index">Savannah, GA</p>
        <h2 id="intro-heading">This is a room worth being in.</h2>
      </motion.div>
      <motion.div
        className="intro-copy"
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <p>Mega brings agents, peers, and trusted partners together for practical conversations, shared perspective, and relationships that continue long after Savannah.</p>
        <div className="intro-stat"><strong>3</strong><span>days in Savannah</span></div>
        <div className="intro-stat"><strong>1</strong><span>high-value community</span></div>
      </motion.div>
    </section>
  );
}

function Agenda() {
  const [activeDay, setActiveDay] = useState(0);
  const current = agenda[activeDay];

  return (
    <section className="agenda-section" id="agenda" aria-labelledby="agenda-heading">
      <div className="page-shell agenda-layout">
        <div className="agenda-sidebar">
          <h2 id="agenda-heading">Three days, one useful conversation.</h2>
          <p>Move through the schedule without digging through a PDF.</p>
          <div className="day-tabs" role="tablist" aria-label="Conference days">
            {agenda.map((day, index) => (
              <button
                key={day.id}
                role="tab"
                aria-selected={activeDay === index}
                aria-controls="agenda-panel"
                onClick={() => setActiveDay(index)}
                className={activeDay === index ? "selected" : ""}
                type="button"
              >
                {activeDay === index && <motion.span className="tab-indicator" layoutId="agenda-tab" />}
                <span>{day.short}</span>
                <small>{day.note}</small>
              </button>
            ))}
          </div>
        </div>
        <div className="agenda-panel" id="agenda-panel" role="tabpanel" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="agenda-panel-header">
                <span>{current.label}</span>
                <small>Salzburg Ballroom II/III</small>
              </div>
              <div className="session-list">
                {current.sessions.map((session) => (
                  <article className={session.featured ? "session featured" : "session"} key={`${session.time}-${session.title}`}>
                    <div className="session-time"><Clock size={17} /><span>{session.time}<small>to {session.end}</small></span></div>
                    <div className="session-title"><h3>{session.title}</h3><p>{session.type}</p></div>
                    {session.featured && <ArrowUpRight size={20} aria-hidden="true" />}
                  </article>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function SavannahMoment() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="moment-section page-shell" aria-labelledby="moment-heading">
      <motion.figure
        className="moment-image-wrap"
        initial={reduceMotion ? false : { opacity: 0.86, scale: 1.015 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <img
          src="/images/riverboat-evening.webp"
          alt="Conference guests talking on a Savannah riverboat at blue hour"
          loading="eager"
          fetchPriority="low"
          decoding="async"
        />
      </motion.figure>
      <motion.div
        className="moment-copy"
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7 }}
      >
        <h2 id="moment-heading">Savannah after the sessions.</h2>
        <p>The best conversations rarely happen behind a podium. Tuesday ends on the water aboard the Savannah River Queen.</p>
        <div className="moment-detail">
          <span>Tuesday evening</span>
          <strong>Riverboat dinner cruise</strong>
          <span>6:00 pm to 9:00 pm</span>
          <span className="moment-sponsor-credit">Sponsored by Agency For Sale, All Recruiting, Wintrust, and EverQuote.</span>
        </div>
      </motion.div>
    </section>
  );
}

const directoryGroups = [
  { value: "all", label: "Everyone" },
  { value: "Home Office Guests", label: "Home Office" },
  { value: "Sponsors", label: "Sponsors" },
  { value: "Attendees", label: "Attendees" },
  { value: "Hosts", label: "Hosts" },
];

const baseDirectoryNames = new Set(directoryData.profiles.map((profile) => profile.name.toLowerCase()));
const sponsorDirectoryProfiles = sponsors.flatMap((sponsor) =>
  (sponsor.representatives ?? [])
    .filter((representative) => !baseDirectoryNames.has(representative.name.toLowerCase()))
    .map((representative) => ({
      id: `sponsor-${sponsor.name}-${representative.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: representative.name,
      group: "Sponsors",
      company: sponsor.name,
      state: "",
      image: representative.image,
      linkedinUrl: null,
      sourceImageUrl: null,
    })),
);
const directoryProfiles = [...directoryData.profiles, ...sponsorDirectoryProfiles];

function ProfileImage({ profile }) {
  const [failed, setFailed] = useState(false);
  const initials = profile.name.split(" ").map((part) => part[0]).slice(0, 2).join("");

  if (failed || !profile.image) {
    return <div className="profile-fallback" aria-label={`${profile.name} photo unavailable`}>{initials}</div>;
  }

  return (
    <img
      src={profile.image}
      alt={profile.company
        ? `${profile.name}, sponsor with ${profile.company}`
        : `${profile.name}, ${profile.group.toLowerCase()} from ${profile.state}`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

function Directory() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("Hosts");
  const [state, setState] = useState("all");
  const [letter, setLetter] = useState("all");
  const [visibleLimit, setVisibleLimit] = useState(24);

  const states = useMemo(
    () => [...new Set(directoryProfiles
      .map((profile) => profile.state)
      .filter((stateCode) => /^[A-Z]{2}$/.test(stateCode)))].sort(),
    [],
  );
  const letters = useMemo(
    () => [...new Set(directoryProfiles.map((profile) => profile.name[0].toUpperCase()))].sort(),
    [],
  );
  const groupCount = (value) => value === "all"
    ? directoryProfiles.length
    : directoryProfiles.filter((profile) => profile.group === value).length;

  const filteredProfiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return directoryProfiles.filter((profile) => {
      const matchesQuery = !normalizedQuery || profile.name.toLowerCase().includes(normalizedQuery);
      const matchesGroup = group === "all" || profile.group === group;
      const matchesState = state === "all" || profile.state === state;
      const matchesLetter = letter === "all" || profile.name.startsWith(letter);
      return matchesQuery && matchesGroup && matchesState && matchesLetter;
    });
  }, [group, letter, query, state]);

  useEffect(() => {
    setVisibleLimit(24);
  }, [group, letter, query, state]);

  const visibleProfiles = filteredProfiles.slice(0, visibleLimit);
  const hasFilters = query || group !== "Hosts" || state !== "all" || letter !== "all";
  const clearFilters = () => {
    setQuery("");
    setGroup("Hosts");
    setState("all");
    setLetter("all");
  };

  return (
    <section className="directory-section" id="directory" aria-labelledby="directory-heading">
      <div className="page-shell">
        <motion.header
          className="directory-heading"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div>
            <h2 id="directory-heading">Find your people.</h2>
            <p>Every 2026 attendee, host, sponsor, and Home Office guest in one searchable directory.</p>
          </div>
          <div className="directory-totals" aria-label="Directory totals">
            <span><strong>{directoryProfiles.length}</strong> people</span>
            <span><strong>{states.length}</strong> states</span>
          </div>
        </motion.header>

        <div className="directory-controls" aria-label="Directory filters">
          <label className="directory-search-field">
            <span>Search by name</span>
            <div><MagnifyingGlass size={20} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “Burke”" autoComplete="off" /></div>
          </label>
          <label className="directory-state-field">
            <span>State (2-letter code)</span>
            <select value={state} onChange={(event) => setState(event.target.value)}>
              <option value="all">All states</option>
              {states.map((stateCode) => <option key={stateCode} value={stateCode}>{stateCode}</option>)}
            </select>
          </label>
        </div>

        <div className="directory-group-filters" aria-label="Filter by attendee type">
          {directoryGroups.map((option) => (
            <button key={option.value} type="button" aria-pressed={group === option.value} onClick={() => setGroup(option.value)}>
              <span>{option.label}</span><small>{groupCount(option.value)}</small>
            </button>
          ))}
        </div>

        <div className="directory-alpha" aria-label="Filter by first letter">
          <button type="button" aria-pressed={letter === "all"} onClick={() => setLetter("all")}>All</button>
          {letters.map((character) => (
            <button key={character} type="button" aria-pressed={letter === character} onClick={() => setLetter(character)}>{character}</button>
          ))}
        </div>

        <div className="directory-results-meta" aria-live="polite">
          <p>Showing <strong>{Math.min(visibleProfiles.length, filteredProfiles.length)}</strong> of <strong>{filteredProfiles.length}</strong></p>
          {hasFilters && <button type="button" onClick={clearFilters}>Reset filters</button>}
        </div>

        {visibleProfiles.length ? (
          <div className="profile-grid">
            {visibleProfiles.map((profile, index) => (
              <motion.article
                className="profile-card"
                key={profile.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.035 }}
              >
                <div className="profile-photo"><ProfileImage profile={profile} /></div>
                <div className="profile-card-body">
                  <div>
                    <h3>{profile.name}</h3>
                    <p className={profile.title ? "profile-title" : ""}>{profile.company ? `Sponsor · ${profile.company}` : profile.title || profile.group}</p>
                  </div>
                  <div className="profile-card-actions">
                    {profile.state && <span><MapPin size={14} weight="fill" />{profile.state}</span>}
                    {profile.linkedinUrl && (
                      <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" aria-label={`Open ${profile.name} on LinkedIn`}>
                        <LinkedinLogo size={18} weight="fill" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="directory-empty">
            <UsersThree size={34} />
            <h3>No one matches those filters.</h3>
            <p>Try another name, state or attendee type.</p>
            <button type="button" onClick={clearFilters}>Reset filters</button>
          </div>
        )}

        {visibleProfiles.length < filteredProfiles.length && (
          <div className="directory-more">
            <button type="button" onClick={() => setVisibleLimit((limit) => limit + 24)}>
              Show more <span>{filteredProfiles.length - visibleProfiles.length} remaining</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Sponsors() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => sponsors.filter((sponsor) => {
      const representativeNames = sponsor.representatives?.map((representative) => representative.name).join(" ") ?? "";
      return `${sponsor.name} ${sponsor.level} ${sponsor.domain} ${representativeNames}`
        .toLowerCase()
        .includes(query.toLowerCase());
    }),
    [query],
  );

  return (
    <section className="sponsor-section page-shell" id="sponsors" aria-labelledby="sponsor-heading">
      <div className="sponsor-heading">
        <h2 id="sponsor-heading">Partners worth knowing.</h2>
        <p>Meet the companies supporting the conversations, connections and ideas behind Mega 2026.</p>
      </div>
      <div className="sponsor-toolbar">
        <p><strong>{filtered.length}</strong> {filtered.length === 1 ? "partner" : "partners"}</p>
        <label className="sponsor-search">
          <span className="sr-only">Search sponsors</span>
          <MagnifyingGlass size={20} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search sponsors"
          />
        </label>
      </div>
      {filtered.length ? (
        <motion.div className="sponsor-grid" layout>
          <AnimatePresence>
            {filtered.map((sponsor) => (
              <motion.a
                className={`sponsor-card${sponsor.featured ? " flagship" : ""}${sponsor.priority ? " priority" : ""}`}
                href={sponsor.url}
                target="_blank"
                rel="noreferrer"
                key={sponsor.name}
                aria-label={`Visit ${sponsor.name} website`}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
              >
                <div className={`sponsor-logo-stage${sponsor.logos.length > 1 ? " paired" : ""}${sponsor.logos.length === 0 ? " wordmark-only" : ""}`}>
                  {sponsor.logos.length ? sponsor.logos.map((logo) => (
                    <img
                      src={logo}
                      alt={`${sponsor.name} logo`}
                      loading="lazy"
                      key={logo}
                      style={{ "--logo-scale": sponsor.logoScale ?? 1 }}
                    />
                  )) : (
                    <span>{sponsor.name}</span>
                  )}
                </div>
                {sponsor.representatives?.length ? (
                  <div className="sponsor-representatives" aria-label={`${sponsor.name} representatives`}>
                    {sponsor.representatives.map((representative) => (
                      <figure className="sponsor-representative" key={representative.name}>
                        <SponsorRepresentativePhoto representative={representative} />
                        <figcaption>{representative.name}</figcaption>
                      </figure>
                    ))}
                  </div>
                ) : null}
                <div className="sponsor-card-meta">
                  <div><small>{sponsor.level}</small><h3>{sponsor.name}</h3><p>{sponsor.domain}</p></div>
                  <span className="sponsor-arrow" aria-hidden="true"><ArrowUpRight size={20} /></span>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="sponsor-empty">
          <p>No sponsors match “{query}”.</p>
          <button type="button" onClick={() => setQuery("")}>Clear search</button>
        </div>
      )}
    </section>
  );
}

function SponsorRepresentativePhoto({ representative }) {
  const [failed, setFailed] = useState(false);
  const initials = representative.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  if (failed || !representative.image) {
    return (
      <span className="sponsor-representative-fallback" aria-label={`${representative.name} photo unavailable`}>
        {initials}
      </span>
    );
  }

  return <img src={representative.image} alt="" loading="lazy" onError={() => setFailed(true)} />;
}

function Registration({ onJoinWaitlist }) {
  return (
    <section className="registration-section" id="registration" aria-labelledby="registration-heading">
      <div className="registration-image" aria-hidden="true" />
      <div className="registration-scrim" />
      <motion.div
        className="registration-content page-shell"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.75 }}
      >
        <p>Sold out · September 21–23, 2026</p>
        <h2 id="registration-heading">The room is full. The waiting list is open.</h2>
        <span className="registration-note">If a place becomes available, the MEGA team will review the waiting list and reach out directly.</span>
        <button className="primary-button" type="button" onClick={onJoinWaitlist}>Join the waiting list <ArrowRight size={18} weight="bold" /></button>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer page-shell">
      <a className="brand footer-brand" href="#top"><span className="brand-mark">M</span><span className="brand-name">MEGA<span> / 26</span></span></a>
      <div className="footer-meta">
        <span>JW Marriott Plant Riverside District</span>
        <span>Savannah, Georgia</span>
      </div>
      <div className="footer-links">
        <a href="#agenda">Agenda</a>
        <a href="#directory">Directory</a>
        <a href="#sponsors">Sponsors</a>
      </div>
      <p className="copyright">© 2026 Mega Agency Conference</p>
    </footer>
  );
}

function WaitlistModal({ open, onClose }) {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [fields, setFields] = useState(initialWaitlistFields);
  const sessionTokenRef = useRef("");
  const autosaveTimerRef = useRef(null);
  const honeypotRef = useRef(null);

  const callSave = useCallback(async (nextFields, retryClosedSession = true) => {
    if (!leadCaptureApiUrl || !leadCaptureSiteId) {
      throw new Error("The waiting list is being connected. Please try again shortly.");
    }

    const response = await fetch(`${leadCaptureApiUrl}/hosted-site-lead-save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteId: leadCaptureSiteId,
        sessionToken: sessionTokenRef.current || undefined,
        fields: nextFields,
        honeypot: honeypotRef.current?.value || "",
      }),
    });
    const result = await response.json().catch(() => ({}));

    if (response.status === 409 && retryClosedSession) {
      sessionTokenRef.current = "";
      return callSave(nextFields, false);
    }
    if (!response.ok) {
      throw new Error(result.message || "We could not save the form. Please try again.");
    }
    if (result.session_token) sessionTokenRef.current = result.session_token;
    return result.session_token || sessionTokenRef.current;
  }, []);

  useEffect(() => {
    if (!open || status === "success" || status === "submitting") return undefined;
    window.clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = window.setTimeout(() => {
      callSave(fields).catch(() => {
        // Autosave is best-effort. Final submit surfaces a useful error.
      });
    }, 500);
    return () => window.clearTimeout(autosaveTimerRef.current);
  }, [callSave, fields, open, status]);

  useEffect(() => {
    if (!open && status === "success") {
      setStatus("idle");
      setMessage("");
    }
  }, [open, status]);

  const handleClose = useCallback(() => {
    window.clearTimeout(autosaveTimerRef.current);
    if (status !== "success" && Object.values(fields).some((value) => String(value).trim())) {
      callSave(fields).catch(() => {});
    }
    onClose();
  }, [callSave, fields, onClose, status]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handleClose, open]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    window.clearTimeout(autosaveTimerRef.current);
    setStatus("submitting");
    setMessage("");

    try {
      const sessionToken = await callSave(fields);
      if (!sessionToken) throw new Error("Please enter a valid email or phone number and try again.");

      const response = await fetch(`${leadCaptureApiUrl}/hosted-site-lead-submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: leadCaptureSiteId, sessionToken }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "We could not submit the form. Please try again.");
      setFields(initialWaitlistFields);
      sessionTokenRef.current = "";
      if (honeypotRef.current) honeypotRef.current.value = "";
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "We could not submit the form. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={handleClose}>
          <motion.div
            className="registration-modal waitlist-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="modal-close" type="button" onClick={handleClose} aria-label="Close waiting list"><X size={22} /></button>
            {status === "success" ? (
              <div className="waitlist-success" role="status">
                <p className="modal-label">Waiting list received</p>
                <h2 id="modal-title">Thank you for raising your hand.</h2>
                <p>The MEGA team will review your information and reach out directly if a place becomes available.</p>
                <button className="primary-button wide" type="button" onClick={handleClose}>Close</button>
              </div>
            ) : (
              <>
                <p className="modal-label">2026 conference · Sold out</p>
                <h2 id="modal-title">Join the waiting list.</h2>
                <p>Tell us a little about you and your agency. Tara’s MEGA team will review every submission.</p>
                <form className="waitlist-form" onSubmit={handleSubmit}>
                  <label>
                    <span>Name</span>
                    <input name="name" type="text" autoComplete="name" value={fields.name} onChange={handleFieldChange} required />
                  </label>
                  <label>
                    <span>Email</span>
                    <input name="email" type="email" autoComplete="email" value={fields.email} onChange={handleFieldChange} required />
                  </label>
                  <label>
                    <span>State</span>
                    <select name="state" value={fields.state} onChange={handleFieldChange} required>
                      <option value="" disabled>Select state</option>
                      {stateCodes.map((stateCode) => <option value={stateCode} key={stateCode}>{stateCode}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Phone number</span>
                    <input name="phone" type="tel" autoComplete="tel" value={fields.phone} onChange={handleFieldChange} required />
                  </label>
                  <label>
                    <span>Book size</span>
                    <input name="book_size" type="text" inputMode="decimal" placeholder="Example: $5.2M" value={fields.book_size} onChange={handleFieldChange} required />
                  </label>
                  <label>
                    <span>Number of staff</span>
                    <input name="staff_count" type="number" min="0" max="10000" inputMode="numeric" value={fields.staff_count} onChange={handleFieldChange} required />
                  </label>
                  <label className="waitlist-full">
                    <span>Why do you want to be part of the Mega Agency Conference?</span>
                    <textarea name="reason_for_attending" rows="4" value={fields.reason_for_attending} onChange={handleFieldChange} required />
                  </label>
                  <label className="waitlist-full">
                    <span>Anything else we should know about you or your agency? <small>Optional</small></span>
                    <textarea name="additional_information" rows="3" value={fields.additional_information} onChange={handleFieldChange} />
                  </label>
                  <label className="waitlist-honeypot" aria-hidden="true">
                    <span>Website</span>
                    <input ref={honeypotRef} name="company_website" type="text" tabIndex="-1" autoComplete="off" />
                  </label>
                  {status === "error" && <p className="waitlist-error" role="alert">{message}</p>}
                  <button className="primary-button wide waitlist-submit" type="submit" disabled={status === "submitting"}>
                    {status === "submitting" ? "Sending…" : "Submit waiting-list request"}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const openWaitlist = () => setWaitlistOpen(true);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header onJoinWaitlist={openWaitlist} />
      <main id="main">
        <Hero onJoinWaitlist={openWaitlist} />
        <Intro />
        <Agenda />
        <SavannahMoment />
        <Directory />
        <Sponsors />
        <Registration onJoinWaitlist={openWaitlist} />
      </main>
      <Footer />
      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
    </>
  );
}
