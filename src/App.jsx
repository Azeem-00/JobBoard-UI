import { useState, useCallback, useEffect, useRef } from "react";
import "./App.css";
import { JOBS, CATS, COS, TESTIS, FAQS, PIPELINE } from "./data/data";

const TW_WORDS = [
  "Your Next Role",
  "a React Job",
  "Remote Work",
  "$200k Packages",
  "Your Dream Team",
];

function App() {
  const [isDark, setIsDark] = useState(true);
  const [savedIds, setSavedIds] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);
  const [currentView, setCurrentView] = useState("grid");
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    type: "",
    location: "",
    salary: "",
  });
  const [sortBy, setSortBy] = useState("date");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [twWordIndex, setTwWordIndex] = useState(0);
  const [twChar, setTwChar] = useState(0);
  const [twDeleting, setTwDeleting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: "",
    skills: "",
    category: "Frontend",
  });
  const twRef = useRef(null);
  const toastTimerRef = useRef(null);

  // Typewriter effect
  useEffect(() => {
    const el = twRef.current;
    if (!el) return;

    const word = TW_WORDS[twWordIndex];
    let timeout;

    if (!twDeleting) {
      const nextChar = twChar + 1;
      el.textContent = word.slice(0, nextChar);
      if (nextChar === word.length) {
        timeout = setTimeout(() => {
          setTwDeleting(true);
        }, 1800);
      } else {
        timeout = setTimeout(() => {
          setTwChar(nextChar);
        }, 90);
      }
    } else {
      const nextChar = twChar - 1;
      el.textContent = word.slice(0, nextChar);
      if (nextChar === 0) {
        timeout = setTimeout(() => {
          setTwDeleting(false);
          setTwWordIndex((prev) => (prev + 1) % TW_WORDS.length);
          setTwChar(0);
        }, 300);
      } else {
        timeout = setTimeout(() => {
          setTwChar(nextChar);
        }, 60);
      }
    }

    return () => clearTimeout(timeout);
  }, [twChar, twDeleting, twWordIndex]);

  // Set initial theme
  useEffect(() => {
    if (!isDark) {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
  }, [isDark]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (!newIsDark) {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
  };

  const showToastMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowToast(false), 2800);
  };

  const toggleSave = (id, e) => {
    e?.stopPropagation();
    setSavedIds((prev) => {
      if (prev.includes(id)) {
        showToastMessage("Removed from saved ❌");
        return prev.filter((x) => x !== id);
      } else {
        showToastMessage("Saved to shortlist ❤️");
        return [...prev, id];
      }
    });
  };

  const handleApply = (job, e) => {
    e?.stopPropagation();
    if (appliedIds.includes(job.id)) {
      showToastMessage(`✅ Already applied to ${job.company}`);
      return;
    }
    setAppliedIds((prev) => [...prev, job.id]);
    showToastMessage(`📝 Applied to ${job.company}! (Demo)`);
  };

  const getFilteredJobs = useCallback(() => {
    const { search, category, type, location, salary } = filters;
    const salMin = parseInt(salary) || 0;
    return JOBS.filter((job) => {
      if (
        search &&
        !job.title.toLowerCase().includes(search.toLowerCase()) &&
        !job.company.toLowerCase().includes(search.toLowerCase()) &&
        !job.skills.join(" ").toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (category && job.cat !== category) return false;
      if (type && job.type !== type) return false;
      if (location && !job.loc.includes(location)) return false;
      if (salMin && job.salMin < salMin) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === "salary") return b.salMax - a.salMax;
      if (sortBy === "match") return b.match - a.match;
      return a.daysAgo - b.daysAgo;
    });
  }, [filters, sortBy]);

  const filteredJobs = getFilteredJobs();

  const openModal = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const handleLinkClick = (linkName) => {
    showToastMessage(
      `🔗 "${linkName}" - This is a frontend demo. Features are simulated for display purposes.`,
    );
  };

  const renderJobCard = (job, saved) => {
    const mg =
      job.match >= 80
        ? "linear-gradient(90deg,#10b981,#34d399)"
        : job.match >= 60
          ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
          : "linear-gradient(90deg,#f43f5e,#fb7185)";

    const isApplied = appliedIds.includes(job.id);

    return (
      <div
        key={job.id}
        className={`job-card ${job.featured ? "featured" : ""}`}
        onClick={() => openModal(job)}
      >
        {job.featured && <div className="featured-badge">⭐ Featured</div>}
        <div className="card-top">
          <div className="company-logo">{job.logo}</div>
          <div className="card-info">
            <div className="card-title">{job.title}</div>
            <div className="card-company">
              {job.company} · {job.loc}
            </div>
          </div>
          <button
            className={`card-save ${saved ? "saved" : ""}`}
            onClick={(e) => toggleSave(job.id, e)}
          >
            {saved ? "♥" : "♡"}
          </button>
        </div>
        <div className="card-tags">
          <span className="tag tag-type">{job.type}</span>
          {job.loc === "Remote" && (
            <span className="tag tag-remote">🌍 Remote</span>
          )}
          {job.daysAgo === 0 && <span className="tag tag-new">New</span>}
          {job.featured && <span className="tag tag-feat">Featured</span>}
        </div>
        <div className="card-tags" style={{ marginTop: "-4px" }}>
          {job.skills.slice(0, 4).map((s) => (
            <span key={s} className="tag-skill-sm">
              {s}
            </span>
          ))}
        </div>
        <div className="match-bar-wrap">
          <div className="match-label">
            <span>Skill match</span>
            <span className="match-val">{job.match}%</span>
          </div>
          <div className="match-track">
            <div
              className="match-fill"
              style={{ width: job.match + "%", background: mg }}
            ></div>
          </div>
        </div>
        <div className="card-bottom">
          <div>
            <div className="card-salary">{job.salary}</div>
            <div className="card-salary-sub">per year</div>
          </div>
          <div className="card-actions">
            <span className="card-date">{job.date}</span>
            <button
              className={`apply-btn ${isApplied ? "applied" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                handleApply(job, e);
              }}
              disabled={isApplied}
            >
              {isApplied ? "✅ Applied" : "Apply"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSavedJobs = () => {
    const savedJobs = JOBS.filter((j) => savedIds.includes(j.id));
    if (!savedJobs.length) {
      return (
        <div className="empty-state">
          <div className="empty-icon">♡</div>
          <div className="empty-title">Your shortlist is empty</div>
          <div>Click the heart on any job card to save it here.</div>
        </div>
      );
    }
    return (
      <div className="jobs-grid">
        {savedJobs.map((job) => renderJobCard(job, true))}
      </div>
    );
  };

  return (
    <div>
      {/* Aurora Background */}
      <div className="aurora" aria-hidden="true">
        <div className="aurora-blob ab1"></div>
        <div className="aurora-blob ab2"></div>
        <div className="aurora-blob ab3"></div>
      </div>
      <div className="grid-bg" aria-hidden="true"></div>

      {/* Navbar */}
      <nav className={mobileMenuOpen ? "mobile-open" : ""}>
        <div className="nav-left">
          <div className="logo">
            <div className="logo-mark">D</div>
            <div className="logo-text">
              Dev<span>Hive</span>
            </div>
          </div>
        </div>

        <div className={`nav-center ${mobileMenuOpen ? "open" : ""}`}>
          <div className="nav-links">
            <button
              className="nav-link active"
              onClick={() => scrollToSection("home")}
            >
              Home
            </button>
            <button
              className="nav-link"
              onClick={() => scrollToSection("categories")}
            >
              Categories
            </button>
            <button
              className="nav-link"
              onClick={() => scrollToSection("jobs")}
            >
              Jobs
            </button>
            <button
              className="nav-link"
              onClick={() => scrollToSection("saved")}
            >
              Saved
            </button>
            <button className="nav-link" onClick={() => scrollToSection("faq")}>
              FAQ
            </button>
          </div>
        </div>

        <div className="nav-right">
          <button className="theme-btn" onClick={toggleTheme}>
            {isDark ? "🌙" : "☀️"}
          </button>
          <button
            className="saved-pill"
            onClick={() => scrollToSection("saved")}
          >
            ♡ <span className="saved-text">Saved</span>{" "}
            <span className="pill-count">{savedIds.length}</span>
          </button>
          <button className="post-btn" onClick={() => setShowPostModal(true)}>
            Post a Job
          </button>
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`hamburger-line ${mobileMenuOpen ? "open" : ""}`}
            ></span>
            <span
              className={`hamburger-line ${mobileMenuOpen ? "open" : ""}`}
            ></span>
            <span
              className={`hamburger-line ${mobileMenuOpen ? "open" : ""}`}
            ></span>
          </button>
        </div>

        {/* Mobile Overlay */}
        <div
          className={`mobile-overlay ${mobileMenuOpen ? "open" : ""}`}
          onClick={() => setMobileMenuOpen(false)}
        ></div>

        {/* Mobile Menu Dropdown */}
        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <div className="mobile-menu-links">
            <button
              className="mobile-nav-link active"
              onClick={() => scrollToSection("home")}
            >
              Home
            </button>
            <button
              className="mobile-nav-link"
              onClick={() => scrollToSection("categories")}
            >
              Categories
            </button>
            <button
              className="mobile-nav-link"
              onClick={() => scrollToSection("jobs")}
            >
              Jobs
            </button>
            <button
              className="mobile-nav-link"
              onClick={() => scrollToSection("saved")}
            >
              Saved
            </button>
            <button
              className="mobile-nav-link"
              onClick={() => scrollToSection("faq")}
            >
              FAQ
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" id="home">
        <div className="hero-eyebrow">
          <div className="live-dot"></div>2,847 jobs live right now
        </div>
        <h1>
          The Smartest Way to Find
          <br />
          <span className="gradient-text">
            <span className="typewriter" ref={twRef}></span>
          </span>
        </h1>
        <p className="hero-sub">
          Curated opportunities from 900+ top-tier tech companies. Match your
          skills, negotiate with confidence.
        </p>
        <div className="hero-search-wrap">
          <div className="hero-search-inner">
            <span style={{ color: "var(--text3)", fontSize: "16px" }}>🔍</span>
            <input
              className="hero-input"
              type="text"
              placeholder="Search roles, companies, or skills…"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>
          <div className="hero-loc"></div>
          <input
            className="hero-loc-input"
            type="text"
            placeholder="📍 Location"
            value={filters.location}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, location: e.target.value }))
            }
          />
          <button
            className="search-btn"
            onClick={() =>
              document
                .getElementById("jobs")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Search Jobs
          </button>
        </div>
        <div className="hero-tags">
          <span className="tag-label">Trending:</span>
          {[
            "React Developer",
            "TypeScript",
            "Remote",
            "AI/ML",
            "Full Stack",
            "$150k+",
          ].map((tag) => (
            <span
              key={tag}
              className="quick-tag"
              onClick={() => {
                setFilters((prev) => ({ ...prev, search: tag }));
                document
                  .getElementById("jobs")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="hero-stats">
          <div>
            <div className="hero-stat-num">
              2,847<span>+</span>
            </div>
            <div className="hero-stat-label">Active Listings</div>
          </div>
          <div>
            <div className="hero-stat-num">
              900<span>+</span>
            </div>
            <div className="hero-stat-label">Companies Hiring</div>
          </div>
          <div>
            <div className="hero-stat-num">
              94<span>k</span>
            </div>
            <div className="hero-stat-label">Developers Placed</div>
          </div>
          <div>
            <div className="hero-stat-num">
              $142<span>k</span>
            </div>
            <div className="hero-stat-label">Avg. Salary Posted</div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* Categories */}
      <section className="section" id="categories">
        <div className="section-head">
          <div>
            <div className="eyebrow">Explore by role</div>
            <div className="section-title">Job Categories</div>
          </div>
          <button
            className="view-all-btn"
            onClick={() => handleLinkClick("View all categories")}
          >
            View all categories →
          </button>
        </div>
        <div className="cats-scroll">
          {CATS.map((c) => (
            <div
              key={c.name}
              className={`cat-card ${filters.category === c.name ? "active" : ""}`}
              onClick={() => {
                setFilters((prev) => ({
                  ...prev,
                  category: prev.category === c.name ? "" : c.name,
                }));
                document
                  .getElementById("jobs")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <div className="cat-icon-wrap" style={{ background: c.color }}>
                {c.icon}
              </div>
              <div className="cat-name">{c.name}</div>
              <div className="cat-count">
                {c.count.toLocaleString()} open roles
              </div>
              <div className={`cat-trend ${c.hot ? "trend-hot" : "trend-up"}`}>
                {c.hot ? "🔥 Hot · " : "📈 "}
                {c.trend}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider"></div>

      {/* Main Layout */}
      <div className="main-layout" id="jobs">
        <aside className="sidebar">
          <div className="profile-card">
            <div className="profile-avatar">
              AA<div className="profile-online"></div>
            </div>
            <div className="profile-name">AbdulGaniyu AbdulAzeem</div>
            <div className="profile-role">
              Junior Frontend Developer · 1 yrs exp
            </div>
            <div className="profile-skills">
              {[
                "React",
                "JavaScript",
                "Tailwind CSS",
                "HTML",
                "CSS",
                "BootStrap",
              ].map((s) => (
                <span key={s} className="ps">
                  {s}
                </span>
              ))}
            </div>
            <div className="profile-match">
              <div className="pm-num">
                {filteredJobs.length
                  ? Math.round(
                      filteredJobs.reduce((a, b) => a + b.match, 0) /
                        filteredJobs.length,
                    )
                  : "—"}
              </div>
              <div className="pm-label">avg. skill match score</div>
            </div>
          </div>
          <div className="salary-chart">
            <div className="sidebar-section-title">Salary by Category</div>
            {[
              { l: "Frontend", v: 155 },
              { l: "AI/ML", v: 240 },
              { l: "Full Stack", v: 175 },
              { l: "Backend", v: 160 },
              { l: "UI/UX", v: 170 },
              { l: "Data", v: 145 },
            ].map((d) => (
              <div key={d.l} className="salary-row">
                <div className="salary-label">{d.l}</div>
                <div className="salary-track">
                  <div
                    className="salary-fill"
                    style={{
                      width: Math.round((d.v / 350) * 100) + "%",
                      background: "linear-gradient(90deg,#6366f1,#7c3aed)",
                    }}
                  ></div>
                </div>
                <div className="salary-val">${d.v}k</div>
              </div>
            ))}
          </div>
          <div className="pipeline-card">
            <div className="sidebar-section-title">Your Pipeline</div>
            {PIPELINE.map((p) => (
              <div key={p.stage} className="pipeline-row">
                <div className="pipe-stage">
                  <div
                    className="pipe-dot"
                    style={{ background: p.color }}
                  ></div>
                  {p.stage}
                </div>
                <div className="pipe-count">
                  {p.stage === "Saved" ? savedIds.length : p.count}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div>
          <div className="filter-strip">
            <div className="filter-chip">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Title, company, skill…"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
              />
            </div>
            <div className="filter-chip">
              <span>📂</span>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                <option value="">All Categories</option>
                {CATS.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-chip">
              <span>⏰</span>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, type: e.target.value }))
                }
              >
                <option value="">All Types</option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Freelance</option>
              </select>
            </div>
            <div className="filter-chip">
              <span>📍</span>
              <select
                value={filters.location}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, location: e.target.value }))
                }
              >
                <option value="">All Locations</option>
                <option>Remote</option>
                <option>New York</option>
                <option>San Francisco</option>
                <option>London</option>
                <option>Berlin</option>
                <option>Singapore</option>
              </select>
            </div>
            <div className="filter-chip">
              <span>💰</span>
              <select
                value={filters.salary}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, salary: e.target.value }))
                }
              >
                <option value="0">Any Salary</option>
                <option value="80">$80k+</option>
                <option value="100">$100k+</option>
                <option value="130">$130k+</option>
                <option value="160">$160k+</option>
                <option value="200">$200k+</option>
              </select>
            </div>
          </div>

          <div className="active-filters">
            {filters.search && (
              <span className="af-tag">
                "{filters.search}"{" "}
                <span
                  className="af-remove"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, search: "" }))
                  }
                >
                  ×
                </span>
              </span>
            )}
            {filters.category && (
              <span className="af-tag">
                {filters.category}{" "}
                <span
                  className="af-remove"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, category: "" }))
                  }
                >
                  ×
                </span>
              </span>
            )}
            {filters.type && (
              <span className="af-tag">
                {filters.type}{" "}
                <span
                  className="af-remove"
                  onClick={() => setFilters((prev) => ({ ...prev, type: "" }))}
                >
                  ×
                </span>
              </span>
            )}
            {filters.location && (
              <span className="af-tag">
                {filters.location}{" "}
                <span
                  className="af-remove"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, location: "" }))
                  }
                >
                  ×
                </span>
              </span>
            )}
            {filters.salary && (
              <span className="af-tag">
                ${filters.salary}k+{" "}
                <span
                  className="af-remove"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, salary: "" }))
                  }
                >
                  ×
                </span>
              </span>
            )}
          </div>

          <div className="controls-bar">
            <div className="results-info">
              Showing <strong>{filteredJobs.length}</strong> of{" "}
              <strong>{JOBS.length}</strong> jobs
            </div>
            <div className="view-toggle">
              <button
                className={`vt-btn ${currentView === "grid" ? "active" : ""}`}
                onClick={() => setCurrentView("grid")}
              >
                ▦
              </button>
              <button
                className={`vt-btn ${currentView === "list" ? "active" : ""}`}
                onClick={() => setCurrentView("list")}
              >
                ☰
              </button>
            </div>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Newest first</option>
              <option value="salary">Highest salary</option>
              <option value="match">Best match</option>
            </select>
          </div>

          <div className={currentView === "grid" ? "jobs-grid" : "jobs-list"}>
            {filteredJobs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <div className="empty-title">No jobs found</div>
                <div>Try adjusting your filters.</div>
              </div>
            ) : (
              filteredJobs.map((job) =>
                renderJobCard(job, savedIds.includes(job.id)),
              )
            )}
          </div>
        </div>
      </div>

      <div className="divider"></div>

      {/* Saved Jobs */}
      <section className="section" id="saved">
        <div className="section-head">
          <div>
            <div className="eyebrow">Your shortlist</div>
            <div className="section-title">Saved Jobs</div>
          </div>
          <button
            className="view-all-btn"
            onClick={() => {
              setSavedIds([]);
              showToastMessage("Cleared all saved jobs");
            }}
          >
            Clear all →
          </button>
        </div>
        {renderSavedJobs()}
      </section>

      <div className="divider"></div>

      {/* Companies */}
      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Top employers</div>
            <div className="section-title">Companies Hiring Now</div>
          </div>
          <button
            className="view-all-btn"
            onClick={() => handleLinkClick("Browse all companies")}
          >
            Browse all →
          </button>
        </div>
        <div className="companies-grid">
          {COS.map((c) => (
            <div
              key={c.name}
              className="co-card"
              onClick={() => handleLinkClick(`View ${c.name} jobs`)}
            >
              <div className="co-logo">{c.logo}</div>
              <div className="co-name">{c.name}</div>
              <div className="co-jobs">{c.jobs} open positions</div>
              <div className="co-tags">
                {c.tags.map((t) => (
                  <span key={t} className="co-tag">
                    {t}
                  </span>
                ))}
              </div>
              <div className="co-rating">{c.rating}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider"></div>

      {/* Testimonials */}
      <section className="section">
        <div
          className="section-head"
          style={{
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "6px",
          }}
        >
          <div className="eyebrow">Success stories</div>
          <div className="section-title">Developers Who Found Their Match</div>
        </div>
        <div className="testi-grid">
          {TESTIS.map((t) => (
            <div key={t.name} className="testi-card">
              <div className="testi-quote">"</div>
              <div className="testi-stars">★★★★★</div>
              <div className="testi-text">{t.text}</div>
              <div className="testi-author">
                <div className="testi-av" style={{ background: t.color }}>
                  {t.av}
                </div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider"></div>

      {/* FAQ */}
      <section className="section" id="faq">
        <div
          className="section-head"
          style={{
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "6px",
          }}
        >
          <div className="eyebrow">Got questions</div>
          <div className="section-title">Frequently Asked</div>
        </div>
        <div className="faq-wrap">
          {FAQS.map((f, i) => (
            <div key={i} className="faq-item">
              <button
                className="faq-q"
                onClick={(e) => {
                  const item = e.currentTarget.parentElement;
                  item.classList.toggle("open");
                }}
              >
                {f.q}
                <div className="faq-chevron">▾</div>
              </button>
              <div className="faq-a">{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <div className="newsletter">
        <h2>Get the Best Roles in Your Inbox</h2>
        <p>
          Weekly digest of curated jobs matched to your stack. No noise,
          unsubscribe anytime.
        </p>
        <div className="nl-form">
          <input
            type="email"
            className="nl-input"
            placeholder="your@email.com"
          />
          <button
            className="nl-btn"
            onClick={() =>
              showToastMessage(
                "📧 Demo: Newsletter subscription (Frontend Demo)",
              )
            }
          >
            Get Alerts
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer>
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <div
                className="logo-mark"
                style={{ width: "28px", height: "28px", fontSize: "13px" }}
              >
                D
              </div>
              DevHive
            </div>
            <div className="footer-about">
              The signal-first job board for senior engineers. Fewer listings,
              higher quality — every role vetted by humans before it goes live.
            </div>
            <div className="footer-socials">
              <div
                className="social-btn"
                onClick={() => handleLinkClick("Twitter")}
              >
                𝕏
              </div>
              <div
                className="social-btn"
                onClick={() => handleLinkClick("LinkedIn")}
              >
                in
              </div>
              <div
                className="social-btn"
                onClick={() => handleLinkClick("GitHub")}
              >
                gh
              </div>
            </div>
          </div>
          <div>
            <div className="footer-col-title">For Developers</div>
            {[
              "Browse Jobs",
              "Salary Guide",
              "Resume Review",
              "Interview Prep",
              "Career Blog",
            ].map((l) => (
              <span
                key={l}
                className="footer-link"
                onClick={() => handleLinkClick(l)}
              >
                {l}
              </span>
            ))}
          </div>
          <div>
            <div className="footer-col-title">For Companies</div>
            {[
              "Post a Job",
              "Pricing",
              "Applicant Tracking",
              "Employer Brand",
              "Case Studies",
            ].map((l) => (
              <span
                key={l}
                className="footer-link"
                onClick={() => handleLinkClick(l)}
              >
                {l}
              </span>
            ))}
          </div>
          <div>
            <div className="footer-col-title">Company</div>
            {[
              "About",
              "Privacy Policy",
              "Terms of Service",
              "Status",
              "Contact Us",
            ].map((l) => (
              <span
                key={l}
                className="footer-link"
                onClick={() => handleLinkClick(l)}
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <span>© 2026 DevHive · All rights reserved.</span>
          <div className="footer-tags">
            <span className="tag tag-type" style={{ fontSize: "11px" }}>
              🌍 Remote-first
            </span>
            <span className="tag tag-remote" style={{ fontSize: "11px" }}>
              ✓ Vetted jobs only
            </span>
          </div>
        </div>

        {/* Disclaimer with subtle credit */}
        <div className="footer-disclaimer">
          <div className="disclaimer-icon">⚠️</div>
          <div className="disclaimer-text">
            <strong>Disclaimer:</strong> This is a frontend demonstration
            project built with React. All job listings, company information, and
            user data are simulated for display purposes only. This is not a
            functioning job board and does not represent real job opportunities,
            companies, or users.
          </div>
          <div className="disclaimer-credit">AbdulAzeem</div>
        </div>
      </footer>

      {/* Job Details Modal */}
      {showModal && selectedJob && (
        <div
          className="modal-overlay open"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div className="modal-logo">{selectedJob.logo}</div>
              <div>
                <div className="modal-title">{selectedJob.title}</div>
                <div className="modal-subtitle">
                  {selectedJob.company} · {selectedJob.loc} · {selectedJob.type}
                </div>
              </div>
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-match">
                <div>
                  <div className="mm-pct">{selectedJob.match}%</div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text3)",
                      marginTop: "2px",
                    }}
                  >
                    match
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "var(--text2)",
                      marginBottom: "8px",
                    }}
                  >
                    Your skills cover{" "}
                    <strong style={{ color: "var(--text)" }}>
                      {selectedJob.match}%
                    </strong>{" "}
                    of this role.
                    {selectedJob.match >= 80
                      ? " Strong fit — apply with confidence."
                      : selectedJob.match >= 60
                        ? " Good fit — address gaps in your cover letter."
                        : " Stretch role — worth applying if passionate."}
                  </div>
                  <div className="mm-bar">
                    <div
                      className="mm-fill"
                      style={{
                        width: selectedJob.match + "%",
                        background:
                          selectedJob.match >= 80
                            ? "linear-gradient(90deg,#10b981,#34d399)"
                            : selectedJob.match >= 60
                              ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
                              : "linear-gradient(90deg,#f43f5e,#fb7185)",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="modal-meta-grid">
                <div className="meta-box">
                  <div className="meta-box-label">Salary Range</div>
                  <div className="meta-box-val">{selectedJob.salary}</div>
                </div>
                <div className="meta-box">
                  <div className="meta-box-label">Category</div>
                  <div className="meta-box-val">{selectedJob.cat}</div>
                </div>
                <div className="meta-box">
                  <div className="meta-box-label">Posted</div>
                  <div className="meta-box-val">{selectedJob.date}</div>
                </div>
                <div className="meta-box">
                  <div className="meta-box-label">Type</div>
                  <div className="meta-box-val">{selectedJob.type}</div>
                </div>
              </div>
              <div className="modal-section">
                <div className="modal-section-title">About the Role</div>
                <div className="modal-desc">{selectedJob.desc}</div>
              </div>
              <div className="modal-section">
                <div className="modal-section-title">Requirements</div>
                <ul className="modal-reqs">
                  {selectedJob.reqs.map((r, i) => (
                    <li key={i}>
                      <span className="req-arrow">→</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="modal-section">
                <div className="modal-section-title">Tech Stack</div>
                <div className="modal-skills">
                  {selectedJob.skills.map((s) => (
                    <span key={s} className="modal-skill">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className={`modal-apply-btn ${appliedIds.includes(selectedJob.id) ? "applied" : ""}`}
                onClick={() => handleApply(selectedJob)}
                disabled={appliedIds.includes(selectedJob.id)}
              >
                {appliedIds.includes(selectedJob.id)
                  ? "✅ Applied"
                  : "Apply Now →"}
              </button>
              <button
                className={`modal-save-btn ${savedIds.includes(selectedJob.id) ? "saved" : ""}`}
                onClick={() => toggleSave(selectedJob.id)}
              >
                {savedIds.includes(selectedJob.id) ? "♥ Saved" : "♡ Save Job"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post a Job Modal */}
      <div
        className={`modal-overlay ${showPostModal ? "open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowPostModal(false);
        }}
      >
        <div className="modal post-job-modal">
          <div className="modal-header">
            <div className="modal-logo">📝</div>
            <div>
              <div className="modal-title">Post a New Job</div>
              <div className="modal-subtitle">
                Fill in the details to list a new position
              </div>
            </div>
            <button
              className="modal-close"
              onClick={() => setShowPostModal(false)}
            >
              ✕
            </button>
          </div>
          <div className="modal-body">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const job = {
                  id: JOBS.length + 1,
                  title: newJob.title,
                  company: newJob.company,
                  logo: "🏢",
                  cat: newJob.category,
                  type: newJob.type,
                  loc: newJob.location,
                  salMin: parseInt(newJob.salaryMin) || 0,
                  salMax: parseInt(newJob.salaryMax) || 0,
                  salary: `$${newJob.salaryMin}k – $${newJob.salaryMax}k`,
                  match: Math.floor(Math.random() * 30) + 60,
                  desc: newJob.description,
                  reqs: newJob.requirements.split(",").map((r) => r.trim()),
                  skills: newJob.skills.split(",").map((s) => s.trim()),
                  featured: false,
                  date: "Today",
                  daysAgo: 0,
                };

                JOBS.unshift(job);

                setNewJob({
                  title: "",
                  company: "",
                  location: "",
                  type: "Full-time",
                  salaryMin: "",
                  salaryMax: "",
                  description: "",
                  requirements: "",
                  skills: "",
                  category: "Frontend",
                });

                setShowPostModal(false);
                showToastMessage(
                  `✅ Job posted successfully! "${job.title}" at ${job.company}`,
                );
                setFilters((prev) => ({ ...prev }));
              }}
            >
              <div className="post-job-grid">
                <div className="post-job-field">
                  <label>Job Title *</label>
                  <input
                    type="text"
                    className="post-job-input"
                    placeholder="e.g. Senior React Developer"
                    value={newJob.title}
                    onChange={(e) =>
                      setNewJob({ ...newJob, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="post-job-field">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    className="post-job-input"
                    placeholder="e.g. Google"
                    value={newJob.company}
                    onChange={(e) =>
                      setNewJob({ ...newJob, company: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="post-job-field">
                  <label>Location *</label>
                  <input
                    type="text"
                    className="post-job-input"
                    placeholder="e.g. Remote, San Francisco, London"
                    value={newJob.location}
                    onChange={(e) =>
                      setNewJob({ ...newJob, location: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="post-job-field">
                  <label>Category *</label>
                  <select
                    className="post-job-input"
                    value={newJob.category}
                    onChange={(e) =>
                      setNewJob({ ...newJob, category: e.target.value })
                    }
                  >
                    {CATS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="post-job-field">
                  <label>Job Type *</label>
                  <select
                    className="post-job-input"
                    value={newJob.type}
                    onChange={(e) =>
                      setNewJob({ ...newJob, type: e.target.value })
                    }
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Freelance</option>
                  </select>
                </div>
                <div className="post-job-field-salary">
                  <label>Salary Range (in $k) *</label>
                  <div className="salary-range-inputs">
                    <input
                      type="number"
                      className="post-job-input"
                      placeholder="Min"
                      value={newJob.salaryMin}
                      onChange={(e) =>
                        setNewJob({ ...newJob, salaryMin: e.target.value })
                      }
                      required
                    />
                    <span style={{ color: "var(--text2)", padding: "0 8px" }}>
                      to
                    </span>
                    <input
                      type="number"
                      className="post-job-input"
                      placeholder="Max"
                      value={newJob.salaryMax}
                      onChange={(e) =>
                        setNewJob({ ...newJob, salaryMax: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="post-job-field-full">
                  <label>Job Description *</label>
                  <textarea
                    className="post-job-input post-job-textarea"
                    placeholder="Describe the role, responsibilities, and what makes it exciting..."
                    value={newJob.description}
                    onChange={(e) =>
                      setNewJob({ ...newJob, description: e.target.value })
                    }
                    rows="4"
                    required
                  />
                </div>
                <div className="post-job-field-full">
                  <label>Requirements (comma separated) *</label>
                  <input
                    type="text"
                    className="post-job-input"
                    placeholder="e.g. 5+ years React, TypeScript, Leadership experience"
                    value={newJob.requirements}
                    onChange={(e) =>
                      setNewJob({ ...newJob, requirements: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="post-job-field-full">
                  <label>Required Skills (comma separated) *</label>
                  <input
                    type="text"
                    className="post-job-input"
                    placeholder="e.g. React, TypeScript, Node.js, GraphQL"
                    value={newJob.skills}
                    onChange={(e) =>
                      setNewJob({ ...newJob, skills: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-save-btn"
                  onClick={() => setShowPostModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-apply-btn">
                  📤 Post Job
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`toast ${showToast ? "show" : ""}`}>{toastMessage}</div>
    </div>
  );
}

export default App;
