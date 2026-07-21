import React, { useEffect, useMemo, useRef, useState } from "react";
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

function Header({ onRegister }) {
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
        <button className="nav-register" type="button" onClick={onRegister}>Register</button>
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
            <button type="button" onClick={() => { setMenuOpen(false); onRegister(); }}>Register</button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function Hero({ onRegister }) {
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
        <motion.p className="hero-kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          2026 Mega Agency Conference
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          Built on Excellence,<br />Focused on the Future.
        </motion.h1>
        <motion.p
          className="hero-summary"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Three days of candid ideas, trusted partners, and the agents shaping what comes next.
        </motion.p>
        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32 }}
        >
          <button className="primary-button" type="button" onClick={onRegister}>
            Register <ArrowRight size={18} weight="bold" />
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
        <p>Fewer sales pitches. Better conversations. Mega brings agents and the partners they trust into one focused room.</p>
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
          <span className="moment-sponsor-credit">Sponsored by Agency for Sale, All Recruiting, Wintrust &amp; EverQuote</span>
        </div>
      </motion.div>
    </section>
  );
}

const directoryGroups = [
  { value: "Hosts", label: "Hosts" },
  { value: "Attendees", label: "Attendees" },
  { value: "Vendors", label: "Vendors" },
  { value: "Home Office Guests", label: "Home Office" },
  { value: "all", label: "Everyone" },
];

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
        ? `${profile.name}, vendor with ${profile.company}`
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
    () => [...new Set(directoryData.profiles
      .map((profile) => profile.state)
      .filter((stateCode) => /^[A-Z]{2}$/.test(stateCode)))].sort(),
    [],
  );
  const letters = useMemo(
    () => [...new Set(directoryData.profiles.map((profile) => profile.name[0].toUpperCase()))].sort(),
    [],
  );
  const groupCount = (value) => value === "all"
    ? directoryData.profiles.length
    : directoryData.profiles.filter((profile) => profile.group === value).length;

  const filteredProfiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return directoryData.profiles.filter((profile) => {
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
            <p>Every 2026 attendee, host and guest in one fast, searchable directory.</p>
          </div>
          <div className="directory-totals" aria-label="Directory totals">
            <span><strong>{directoryData.counts.total}</strong> people</span>
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
                  <div><h3>{profile.name}</h3><p>{profile.company ? `Vendor · ${profile.company}` : profile.group}</p></div>
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
    () => sponsors.filter((sponsor) => `${sponsor.name} ${sponsor.level} ${sponsor.domain}`.toLowerCase().includes(query.toLowerCase())),
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
                className={sponsor.featured ? "sponsor-card flagship" : "sponsor-card"}
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
                <div className={`sponsor-logo-stage${sponsor.logos.length > 1 ? " paired" : ""}`}>
                  {sponsor.logos.map((logo) => (
                    <img src={logo} alt={`${sponsor.name} logo`} loading="lazy" key={logo} />
                  ))}
                </div>
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

function Registration({ onRegister }) {
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
        <p>September 21-23, 2026</p>
        <h2 id="registration-heading">See you on the river.</h2>
        <button className="primary-button" type="button" onClick={onRegister}>Register <ArrowRight size={18} weight="bold" /></button>
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
        <a href="https://megaagencyconference.com/" target="_blank" rel="noreferrer">Current site</a>
      </div>
      <p className="copyright">© 2026 Mega Agency Conference</p>
    </footer>
  );
}

function RegistrationModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div
            className="registration-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="modal-close" type="button" onClick={onClose} aria-label="Close registration"><X size={22} /></button>
            <p className="modal-label">Registration handoff</p>
            <h2 id="modal-title">Your Stripe checkout drops in here.</h2>
            <p>This concept keeps payment outside the website. Replace the button below with the final Stripe Payment Link and registration is ready.</p>
            <div className="checkout-preview">
              <span>2026 conference registration</span>
              <strong>Secure checkout in Stripe</strong>
            </div>
            <button className="primary-button wide" type="button" onClick={onClose}>Return to preview</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const openRegistration = () => setRegistrationOpen(true);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header onRegister={openRegistration} />
      <main id="main">
        <Hero onRegister={openRegistration} />
        <Intro />
        <Agenda />
        <SavannahMoment />
        <Directory />
        <Sponsors />
        <Registration onRegister={openRegistration} />
      </main>
      <Footer />
      <RegistrationModal open={registrationOpen} onClose={() => setRegistrationOpen(false)} />
    </>
  );
}
