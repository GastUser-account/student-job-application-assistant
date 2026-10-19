"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, Bookmark, BriefcaseBusiness,
  Check, CheckCircle2, ChevronDown, CircleHelp, Clock3, Copy, Download,
  FileText, Filter, Gauge, LayoutDashboard, Link2, MapPin, Plus, Search,
  Settings2, Sparkles, Target, TrendingUp, UserRound, X, Zap
} from "lucide-react"

type Job = {
  id: string; role: string; company: string; location: string; mode: string
  salary: string; posted: string; score: number; skills: string[]
  summary: string; url: string
}
type Application = {
  id: string; jobId: string; role: string; company: string; date: string
  status: "Draft" | "Applied" | "Interview" | "Rejected" | "Offer"
  score: number; coverLetter: string
}
type Profile = { name: string; email: string; targetRole: string; location: string; skills: string; experience: string; linkedin: string }

const demoJobs: Job[] = [
  { id: "j1", role: "Data Science Intern", company: "ASML", location: "Veldhoven, Netherlands", mode: "Hybrid", salary: "€650–€900 / month", posted: "2 days ago", score: 94, skills: ["Python", "Statistics", "Machine learning"], summary: "Support data scientists in analysing complex manufacturing data, building analytical pipelines and communicating insights to engineering teams.", url: "https://www.asml.com/en/careers" },
  { id: "j2", role: "Junior Data Analyst", company: "bol", location: "Utrecht, Netherlands", mode: "Hybrid", salary: "€3,000–€3,700 / month", posted: "3 days ago", score: 89, skills: ["SQL", "Python", "Power BI"], summary: "Turn customer and marketplace data into actionable insights. Work with product and operations teams to improve reporting and experimentation.", url: "https://careers.bol.com/" },
  { id: "j3", role: "AI Research Intern", company: "ING", location: "Amsterdam, Netherlands", mode: "Hybrid", salary: "€700–€1,000 / month", posted: "1 day ago", score: 86, skills: ["Python", "Machine learning", "NLP"], summary: "Prototype responsible AI applications and evaluate models with data science and risk teams. Strong analytical thinking is valued.", url: "https://www.ing.jobs/" },
  { id: "j4", role: "Data & Analytics Intern", company: "Alliander", location: "Arnhem, Netherlands", mode: "Hybrid", salary: "€550–€800 / month", posted: "5 days ago", score: 83, skills: ["SQL", "Python", "Visualisation"], summary: "Help analyse energy-network data, improve dashboards and support data-driven decisions for the energy transition.", url: "https://werkenbij.alliander.com/" },
  { id: "j5", role: "Machine Learning Intern", company: "Picnic", location: "Amsterdam, Netherlands", mode: "On-site / Hybrid", salary: "€600–€850 / month", posted: "4 days ago", score: 80, skills: ["Python", "Statistics", "Optimisation"], summary: "Explore forecasting and optimisation challenges across fulfilment and logistics with applied machine learning methods.", url: "https://jobs.picnic.app/" },
  { id: "j6", role: "Risk Data Analyst Intern", company: "Rabobank", location: "Utrecht, Netherlands", mode: "Hybrid", salary: "€600–€900 / month", posted: "1 week ago", score: 76, skills: ["SQL", "Statistics", "Python"], summary: "Help the risk analytics team prepare datasets, monitor model performance and translate analysis into clear recommendations.", url: "https://rabobank.jobs/" },
]

const initialProfile: Profile = {
  name: "Arman", email: "", targetRole: "Data Science / AI Internship",
  location: "Netherlands", skills: "Python, SQL, Statistics, Machine Learning, Data Visualisation",
  experience: "Data Science & Applied Mathematics student; internship experience in IoT monitoring and data logging.",
  linkedin: ""
}
const initialApplications: Application[] = [
  { id: "a1", jobId: "j4", role: "Data & Analytics Intern", company: "Alliander", date: "2026-10-14", status: "Applied", score: 83, coverLetter: "" },
  { id: "a2", jobId: "j2", role: "Junior Data Analyst", company: "bol", date: "2026-10-12", status: "Interview", score: 89, coverLetter: "" },
  { id: "a3", jobId: "j6", role: "Risk Data Analyst Intern", company: "Rabobank", date: "2026-10-09", status: "Draft", score: 76, coverLetter: "" },
]

const navItems = [
  { id: "Overview", label: "Overview", icon: LayoutDashboard },
  { id: "Find jobs", label: "Find jobs", icon: Search },
  { id: "Applications", label: "Applications", icon: BriefcaseBusiness },
  { id: "My profile", label: "My profile", icon: UserRound },
]

function makeCoverLetter(job: Job, profile: Profile) {
  const name = profile.name.trim() || "Your Name"
  const skills = profile.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4).join(", ") || "data analysis and problem-solving"
  return `Dear ${job.company} Recruitment Team,

I am writing to express my interest in the ${job.role} position at ${job.company}. I am studying Data Science and Applied Mathematics and am keen to apply analytical methods to practical business and technical challenges.

My background includes ${profile.experience || "academic work in data science and applied mathematics"}. I have worked with ${skills}, and I enjoy turning complex information into clear, useful insights. The opportunity to contribute to ${job.company}'s work while learning from an experienced team is particularly appealing to me.

I would welcome the opportunity to discuss how my analytical mindset, curiosity and willingness to learn could contribute to your team. Thank you for considering my application.

Kind regards,
${name}`
}

function scoreColor(score: number) {
  return score >= 90 ? "text-emerald-700 bg-emerald-50" : score >= 80 ? "text-blue-700 bg-blue-50" : "text-amber-700 bg-amber-50"
}
function statusColor(status: Application["status"]) {
  if (status === "Interview" || status === "Offer") return "bg-emerald-50 text-emerald-700"
  if (status === "Applied") return "bg-blue-50 text-blue-700"
  if (status === "Rejected") return "bg-rose-50 text-rose-700"
  return "bg-amber-50 text-amber-700"
}

export default function Page() {
  const [active, setActive] = useState("Overview")
  const [jobs, setJobs] = useState<Job[]>(demoJobs)
  const [applications, setApplications] = useState<Application[]>(initialApplications)
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [query, setQuery] = useState("")
  const [jobFilter, setJobFilter] = useState("All matches")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [letterJob, setLetterJob] = useState<Job | null>(null)
  const [letter, setLetter] = useState("")
  const [saved, setSaved] = useState(false)
  const [notice, setNotice] = useState("")
  const [lastRefresh, setLastRefresh] = useState("just now")

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem("autoapply-profile")
      const storedApps = localStorage.getItem("autoapply-applications")
      if (storedProfile) setProfile({ ...initialProfile, ...JSON.parse(storedProfile) })
      if (storedApps) setApplications(JSON.parse(storedApps))
    } catch { /* keep demo defaults if browser storage is unavailable */ }
  }, [])

  useEffect(() => {
    try { localStorage.setItem("autoapply-profile", JSON.stringify(profile)) } catch { /* storage optional */ }
  }, [profile])
  useEffect(() => {
    try { localStorage.setItem("autoapply-applications", JSON.stringify(applications)) } catch { /* storage optional */ }
  }, [applications])

  const filteredJobs = useMemo(() => jobs.filter((job) => {
    const text = `${job.role} ${job.company} ${job.location} ${job.skills.join(" ")}`.toLowerCase()
    const queryMatch = text.includes(query.toLowerCase())
    const scoreMatch = jobFilter === "All matches" || (jobFilter === "80%+ match" && job.score >= 80) || (jobFilter === "90%+ match" && job.score >= 90)
    return queryMatch && scoreMatch
  }), [jobs, query, jobFilter])

  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(""), 3200)
  }
  const refreshJobs = () => {
    setJobs([...demoJobs].sort(() => Math.random() - 0.5))
    setLastRefresh("just now")
    showNotice("Demo listings refreshed. Live job-board integration is not connected.")
  }
  const openLetter = (job: Job) => {
    setLetterJob(job)
    setLetter(makeCoverLetter(job, profile))
  }
  const saveDraft = (job: Job, coverLetter = "") => {
    const existing = applications.find((a) => a.jobId === job.id)
    if (existing) {
      setApplications((items) => items.map((a) => a.jobId === job.id ? { ...a, coverLetter, status: "Draft" } : a))
      showNotice(`Updated your ${job.company} application draft.`)
    } else {
      setApplications((items) => [{ id: `a-${Date.now()}`, jobId: job.id, role: job.role, company: job.company, date: new Date().toISOString().slice(0, 10), status: "Draft", score: job.score, coverLetter }, ...items])
      showNotice(`Added ${job.role} at ${job.company} to your tracker.`)
    }
    setLetterJob(null)
  }
  const updateStatus = (id: string, status: Application["status"]) => {
    setApplications((items) => items.map((a) => a.id === id ? { ...a, status } : a))
    showNotice(`Application status updated to ${status}.`)
  }
  const exportApplications = () => {
    const rows = [["Company", "Role", "Date", "Status", "Match score"], ...applications.map((a) => [a.company, a.role, a.date, a.status, String(a.score)])]
    const csv = rows.map((r) => r.map((v) => `"${v.replaceAll('"', '""')}"`).join(",")).join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }))
    const a = document.createElement("a"); a.href = url; a.download = "autoapply-applications.csv"; a.click(); URL.revokeObjectURL(url)
    showNotice("Application tracker exported as CSV.")
  }
  const copyLetter = async () => {
    try { await navigator.clipboard.writeText(letter); showNotice("Cover letter copied to clipboard.") }
    catch { showNotice("Clipboard access unavailable. Select and copy the text manually.") }
  }

  const appliedCount = applications.filter((a) => a.status === "Applied" || a.status === "Interview" || a.status === "Offer").length
  const interviewCount = applications.filter((a) => a.status === "Interview").length
  const avgScore = applications.length ? Math.round(applications.reduce((sum, a) => sum + a.score, 0) / applications.length) : 0

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[246px] flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-[78px] items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm"><Sparkles size={21} /></div>
          <div><div className="text-[17px] font-bold tracking-tight">AutoApply</div><div className="text-[11px] text-slate-500">STUDENT CAREER HUB</div></div>
        </div>
        <div className="px-4 pt-6">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Workspace</div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return <button key={item.id} onClick={() => setActive(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold transition ${active === item.id ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}><Icon size={17} />{item.label}{item.id === "Applications" && <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px]">{applications.length}</span>}</button>
            })}
          </nav>
        </div>
        <div className="mt-7 px-4">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Tools</div>
          <button onClick={() => { setActive("Find jobs"); setJobFilter("90%+ match") }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold text-slate-600 hover:bg-slate-50"><Target size={17} /> Top matches</button>
          <button onClick={exportApplications} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold text-slate-600 hover:bg-slate-50"><Download size={17} /> Export tracker</button>
        </div>
        <div className="mt-auto p-4">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Zap size={16} /> Application toolkit</div>
            <p className="text-xs leading-5 text-indigo-100">Match roles, prepare letters and keep your job search organised.</p>
            <button onClick={() => setActive("My profile")} className="mt-3 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold hover:bg-white/25">Complete profile <span aria-hidden>→</span></button>
          </div>
          <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">{(profile.name || "A").slice(0,1).toUpperCase()}</div>
            <div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold">{profile.name || "Your profile"}</div><div className="text-[11px] text-slate-500">Student account</div></div>
            <button aria-label="Open profile" onClick={() => setActive("My profile")} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><Settings2 size={16} /></button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[246px]">
        <header className="sticky top-0 z-10 flex h-[70px] items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <div className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white"><Sparkles size={18} /></div>
            <div><div className="text-[11px] font-medium text-slate-500">Workspace / {active}</div><div className="text-sm font-bold">{active === "Overview" ? "Your career dashboard" : active}</div></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-800 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Demo mode</span>
            <button onClick={() => showNotice("You're all caught up — no new notifications in this demo.")} aria-label="Notifications" className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"><Bell size={17} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500" /></button>
            <button onClick={() => setActive("My profile")} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50"><UserRound size={15} /><span className="hidden sm:inline">My profile</span><ChevronDown size={13} /></button>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] p-5 md:p-8">
          {active === "Overview" && <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700"><Sparkles size={13} /> YOUR NEXT OPPORTUNITY STARTS HERE</div><h1 className="text-2xl font-bold tracking-tight md:text-[30px]">Good morning, {profile.name || "there"} 👋</h1><p className="mt-2 text-sm text-slate-500">A clear view of your search, your best matches and what to do next.</p></div>
              <button onClick={() => setActive("Find jobs")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"><Search size={16} /> Explore matching jobs</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Jobs matched", value: String(jobs.length), delta: "Sample listings", icon: Target, color: "bg-indigo-50 text-indigo-700", trend: "Updated demo" },
                { label: "Applications tracked", value: String(applications.length), delta: `${appliedCount} submitted or active`, icon: BriefcaseBusiness, color: "bg-sky-50 text-sky-700", trend: "Your pipeline" },
                { label: "Interviews", value: String(interviewCount), delta: "Keep preparing", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700", trend: "Positive progress" },
                { label: "Average match score", value: `${avgScore || 0}%`, delta: "Across tracked roles", icon: Gauge, color: "bg-amber-50 text-amber-700", trend: "Profile fit" },
              ].map((stat) => { const Icon = stat.icon; return <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,.025)]"><div className="flex items-start justify-between"><div className="text-xs font-medium text-slate-500">{stat.label}</div><div className={`rounded-xl p-2.5 ${stat.color}`}><Icon size={18} /></div></div><div className="mt-4 text-3xl font-bold tracking-tight">{stat.value}</div><div className="mt-2 text-xs text-slate-500">{stat.delta}</div><div className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400"><Activity size={12} /> {stat.trend}</div></div> }) }
            </div>
            <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between"><div><h2 className="text-base font-bold">Recommended for you</h2><p className="mt-1 text-xs text-slate-500">Roles ranked against your current profile</p></div><button onClick={() => setActive("Find jobs")} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">View all →</button></div>
                <div className="space-y-3">
                  {jobs.slice(0,3).map((job) => <JobRow key={job.id} job={job} onOpen={() => setSelectedJob(job)} onLetter={() => openLetter(job)} onSave={() => saveDraft(job)} />)}
                </div>
              </section>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between"><div><h2 className="text-base font-bold">Application pipeline</h2><p className="mt-1 text-xs text-slate-500">Where things stand today</p></div><button onClick={() => setActive("Applications")} className="text-xs font-bold text-indigo-600">Manage →</button></div>
                <div className="space-y-4">
                  {(["Draft", "Applied", "Interview", "Offer", "Rejected"] as const).map((status) => { const count = applications.filter((a) => a.status === status).length; const total = Math.max(applications.length,1); const color = status === "Interview" || status === "Offer" ? "bg-emerald-500" : status === "Applied" ? "bg-indigo-500" : status === "Rejected" ? "bg-rose-400" : "bg-amber-400"; return <div key={status}><div className="mb-2 flex justify-between text-xs"><span className="font-medium text-slate-600">{status}</span><span className="font-bold">{count}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${count / total * 100}%` }} /></div></div>})}
                </div>
                <div className="mt-6 rounded-xl bg-slate-50 p-4"><div className="flex items-center gap-2 text-xs font-bold"><TrendingUp size={15} className="text-indigo-600" /> Your next step</div><p className="mt-2 text-xs leading-5 text-slate-600">Review your saved draft and tailor it to the role before applying.</p><button onClick={() => setActive("Applications")} className="mt-3 text-xs font-bold text-indigo-600">Open tracker →</button></div>
              </section>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-5 md:flex md:items-center md:justify-between md:p-6"><div className="flex items-start gap-3"><div className="rounded-xl bg-white p-3 text-indigo-600 shadow-sm"><FileText size={21} /></div><div><h3 className="text-sm font-bold">Make every application count</h3><p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">Create a tailored cover-letter draft using your profile, then review and edit it before sending. This demo never submits an application for you.</p></div></div><button onClick={() => setActive("My profile")} className="mt-4 whitespace-nowrap rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50 md:mt-0">Update my profile</button></div>
          </div>}

          {active === "Find jobs" && <div className="space-y-6">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><h1 className="text-2xl font-bold tracking-tight">Find your next role</h1><p className="mt-2 text-sm text-slate-500">Explore sample opportunities and see how your profile matches.</p></div><button onClick={refreshJobs} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold hover:bg-slate-50"><Activity size={15} /> Refresh listings</button></div>
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search roles, companies or skills..." className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></div><div className="relative"><Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-9 text-sm outline-none focus:border-indigo-400 md:w-44"><option>All matches</option><option>80%+ match</option><option>90%+ match</option></select></div><div className="flex items-center px-2 text-xs text-slate-500">{filteredJobs.length} results</div></div>
            <div className="grid gap-4 xl:grid-cols-2">{filteredJobs.map((job) => <div key={job.id} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-sm"><div className="flex items-start gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">{job.company.slice(0,2).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-bold">{job.role}</h3><div className="mt-1 text-xs text-slate-500">{job.company} · {job.posted}</div></div><span className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${scoreColor(job.score)}`}>{job.score}% match</span></div></div></div><p className="mt-4 text-sm leading-6 text-slate-600">{job.summary}</p><div className="mt-4 flex flex-wrap gap-2">{job.skills.map((skill) => <span key={skill} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-600">{skill}</span>)}</div><div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><MapPin size={13} /> {job.location}</span><span className="inline-flex items-center gap-1"><Clock3 size={13} /> {job.mode}</span><span className="font-semibold text-slate-700">{job.salary}</span></div><div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><button onClick={() => setSelectedJob(job)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold hover:bg-slate-50">View details</button><button onClick={() => openLetter(job)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"><Sparkles size={14} /> Tailor cover letter</button><button onClick={() => saveDraft(job)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold hover:bg-slate-50"><Bookmark size={14} /> Save draft</button></div></div>)}</div>
            {filteredJobs.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><Search className="mx-auto text-slate-300" size={28} /><h3 className="mt-3 font-bold">No matching sample jobs</h3><p className="mt-1 text-sm text-slate-500">Try a different keyword or match-score filter.</p><button onClick={() => { setQuery(""); setJobFilter("All matches") }} className="mt-4 text-sm font-bold text-indigo-600">Clear filters</button></div>}
            <p className="text-xs leading-5 text-slate-400">Demo listings are illustrative examples, not verified live vacancies. Live job discovery and AI services are not connected in this prototype.</p>
          </div>}

          {active === "Applications" && <div className="space-y-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h1 className="text-2xl font-bold tracking-tight">Application tracker</h1><p className="mt-2 text-sm text-slate-500">Keep your drafts, applications and interviews in one place.</p></div><button onClick={exportApplications} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-700"><Download size={15} /> Export CSV</button></div><div className="grid gap-4 sm:grid-cols-3"><MiniStat label="Tracked roles" value={applications.length} /><MiniStat label="Active / submitted" value={appliedCount} /><MiniStat label="Interviews" value={interviewCount} /></div><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4 font-bold">Role / Company</th><th className="px-5 py-4 font-bold">Date added</th><th className="px-5 py-4 font-bold">Match</th><th className="px-5 py-4 font-bold">Status</th><th className="px-5 py-4 font-bold">Update status</th><th className="px-5 py-4 font-bold">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{applications.map((app) => <tr key={app.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><div className="font-bold">{app.role}</div><div className="mt-1 text-xs text-slate-500">{app.company}</div></td><td className="px-5 py-4 text-xs text-slate-500">{app.date}</td><td className="px-5 py-4"><span className={`rounded-lg px-2 py-1 text-xs font-bold ${scoreColor(app.score)}`}>{app.score}%</span></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1.5 text-[11px] font-bold ${statusColor(app.status)}`}>{app.status}</span></td><td className="px-5 py-4"><select aria-label={`Update ${app.company} status`} value={app.status} onChange={(e) => updateStatus(app.id, e.target.value as Application["status"])} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-indigo-400">{["Draft","Applied","Interview","Offer","Rejected"].map((s) => <option key={s}>{s}</option>)}</select></td><td className="px-5 py-4"><div className="flex gap-1"><button aria-label="Edit cover letter" onClick={() => { const job = jobs.find((j) => j.id === app.jobId) || { ...jobs[0], id: app.jobId, role: app.role, company: app.company }; setLetterJob(job); setLetter(app.coverLetter || makeCoverLetter(job, profile)) }} className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"><FileText size={15} /></button><button aria-label="Remove application" onClick={() => { setApplications((items) => items.filter((a) => a.id !== app.id)); showNotice("Application removed from your tracker.") }} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><X size={15} /></button></div></td></tr>)}</tbody></table></div>{applications.length === 0 && <div className="p-10 text-center text-sm text-slate-500">No applications yet. Save a draft from Find jobs to get started.</div>}</div></div>}

          {active === "My profile" && <div className="mx-auto max-w-3xl space-y-6"><div><h1 className="text-2xl font-bold tracking-tight">Your profile</h1><p className="mt-2 text-sm text-slate-500">Keep your details accurate so drafts are relevant to your real experience.</p></div><form onSubmit={(e) => { e.preventDefault(); setSaved(true); showNotice("Profile saved in this browser."); window.setTimeout(() => setSaved(false), 2500) }} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 md:p-7"><div className="flex items-center gap-3 border-b border-slate-100 pb-5"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-xl font-bold text-indigo-700">{(profile.name || "A").slice(0,1).toUpperCase()}</div><div><h2 className="font-bold">Candidate details</h2><p className="mt-1 text-xs text-slate-500">Used to personalise your application drafts.</p></div></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Full name" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} placeholder="Your name" /><Field label="Email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} placeholder="you@example.com" type="email" /><Field label="Target role" value={profile.targetRole} onChange={(v) => setProfile({ ...profile, targetRole: v })} placeholder="Data Science Internship" /><Field label="Preferred location" value={profile.location} onChange={(v) => setProfile({ ...profile, location: v })} placeholder="Netherlands" /><Field label="LinkedIn URL" value={profile.linkedin} onChange={(v) => setProfile({ ...profile, linkedin: v })} placeholder="https://linkedin.com/in/..." /></div><div><label className="mb-2 block text-xs font-bold text-slate-700">Skills (comma-separated)</label><textarea rows={3} value={profile.skills} onChange={(e) => setProfile({ ...profile, skills: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" placeholder="Python, SQL, statistics..." /></div><div><label className="mb-2 block text-xs font-bold text-slate-700">Experience and education summary</label><textarea rows={5} value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm leading-6 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" placeholder="Summarise your real experience and education. Avoid adding claims you cannot support." /></div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5"><p className="text-xs text-slate-400">Saved locally in this browser; not synced to a cloud account.</p><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white hover:bg-indigo-700">{saved ? <Check size={15} /> : <UserRound size={15} />}{saved ? "Saved" : "Save profile"}</button></div></form><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="flex items-start gap-3"><CircleHelp size={18} className="mt-0.5 shrink-0 text-amber-700" /><div><h3 className="text-sm font-bold text-amber-900">About this prototype</h3><p className="mt-1 text-xs leading-5 text-amber-800">Profile and application tracker data are stored in your browser. AI provider integration, CV file parsing, real job feeds and cloud sync are not configured yet. Review every draft for accuracy before using it.</p></div></div></div></div>}
        </div>
      </div>

      {notice && <div role="status" className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl"><CheckCircle2 size={17} className="shrink-0 text-emerald-400" />{notice}<button aria-label="Dismiss notice" onClick={() => setNotice("")} className="ml-2 text-slate-400 hover:text-white"><X size={15} /></button></div>}

      {selectedJob && <Modal title={selectedJob.role} subtitle={`${selectedJob.company} · ${selectedJob.location}`} onClose={() => setSelectedJob(null)}><div className="space-y-4"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-lg px-3 py-1.5 text-xs font-bold ${scoreColor(selectedJob.score)}`}>{selectedJob.score}% profile match</span><span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{selectedJob.mode}</span><span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{selectedJob.salary}</span></div><div><h4 className="mb-2 text-sm font-bold">Role summary</h4><p className="text-sm leading-6 text-slate-600">{selectedJob.summary}</p></div><div><h4 className="mb-2 text-sm font-bold">Relevant skills</h4><div className="flex flex-wrap gap-2">{selectedJob.skills.map((s) => <span key={s} className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">{s}</span>)}</div></div><div className="rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">This is an illustrative demo listing. The match score is a sample score, not an independently verified AI assessment. Check the employer's official careers page for current vacancies.</div><div className="flex flex-wrap gap-2"><button onClick={() => { saveDraft(selectedJob); setSelectedJob(null) }} className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold hover:bg-slate-50">Save to tracker</button><button onClick={() => { setSelectedJob(null); openLetter(selectedJob) }} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-700"><Sparkles size={14} /> Prepare cover letter</button><a href={selectedJob.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold hover:bg-slate-50"><Link2 size={14} /> Employer careers site</a></div></div></Modal>}

      {letterJob && <Modal title="Cover letter draft" subtitle={`${letterJob.role} · ${letterJob.company}`} onClose={() => setLetterJob(null)} wide><div className="mb-3 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3"><Sparkles size={17} className="mt-0.5 shrink-0 text-indigo-700" /><p className="text-xs leading-5 text-indigo-800">Template-based draft using your saved profile. This is not an AI-generated or externally verified letter. Edit it to reflect your real experience.</p></div><textarea value={letter} onChange={(e) => setLetter(e.target.value)} rows={15} className="w-full rounded-xl border border-slate-200 p-4 text-sm leading-6 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /><div className="mt-4 flex flex-wrap justify-between gap-2"><button onClick={copyLetter} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold hover:bg-slate-50"><Copy size={14} /> Copy text</button><div className="flex gap-2"><button onClick={() => setLetterJob(null)} className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold hover:bg-slate-50">Close</button><button onClick={() => saveDraft(letterJob, letter)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-700"><Check size={14} /> Save to tracker</button></div></div></Modal>}

      <div className="fixed bottom-0 left-0 right-0 z-10 grid grid-cols-4 border-t border-slate-200 bg-white lg:hidden">{navItems.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => setActive(item.id)} className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold ${active === item.id ? "text-indigo-700" : "text-slate-500"}`}><Icon size={18} />{item.label}</button> })}</div>
    </main>
  )
}

function JobRow({ job, onOpen, onLetter, onSave }: { job: Job; onOpen: () => void; onLetter: () => void; onSave: () => void }) {
  return <div className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-slate-200 sm:flex-row sm:items-center"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600">{job.company.slice(0,2).toUpperCase()}</div><div className="min-w-0 flex-1"><button onClick={onOpen} className="text-left text-sm font-bold hover:text-indigo-700">{job.role}</button><div className="mt-1 text-xs text-slate-500">{job.company} · {job.location}</div><div className="mt-2 flex flex-wrap gap-1.5">{job.skills.slice(0,2).map((s) => <span key={s} className="rounded-md bg-slate-50 px-2 py-1 text-[10px] text-slate-500">{s}</span>)}</div></div><div className="flex items-center gap-2 sm:flex-col sm:items-end"><span className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${scoreColor(job.score)}`}>{job.score}% match</span><div className="flex gap-1"><button onClick={onLetter} aria-label={`Prepare letter for ${job.company}`} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"><FileText size={16} /></button><button onClick={onSave} aria-label={`Save ${job.company} draft`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Plus size={16} /></button></div></div></div>
}
function MiniStat({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-xs font-medium text-slate-500">{label}</div><div className="mt-2 text-2xl font-bold">{value}</div></div> }
function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) { return <div><label className="mb-2 block text-xs font-bold text-slate-700">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></div> }
function Modal({ title, subtitle, onClose, children, wide = false }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) { return <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}><div role="dialog" aria-modal="true" className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl md:p-7 ${wide ? "max-w-3xl" : "max-w-xl"}`}><div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold">{title}</h2><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div><button onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button></div>{children}</div></div> }
