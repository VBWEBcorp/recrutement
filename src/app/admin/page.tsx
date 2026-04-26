"use client";

import { useState, useEffect, useCallback } from "react";

const CATEGORIES_MAP: Record<string, string> = {
  developpeur: "Dev",
  seo: "SEO",
  ads: "Ads",
  setter: "Setter",
};

const CATEGORIES_FULL: Record<string, string> = {
  developpeur: "Développeur Web",
  seo: "Expert SEO",
  ads: "Meta Ads & Google Ads",
  setter: "Setter",
};

type TagColor = "nouveau" | "vert" | "orange" | "rouge";

const TAGS: { id: TagColor; label: string; dot: string; bg: string; ring: string; text: string }[] = [
  { id: "nouveau", label: "Nouveau", dot: "bg-gray-300", bg: "bg-gray-50", ring: "ring-gray-200", text: "text-gray-600" },
  { id: "vert", label: "OK", dot: "bg-emerald-400", bg: "bg-emerald-50", ring: "ring-emerald-200", text: "text-emerald-700" },
  { id: "orange", label: "À revoir", dot: "bg-amber-400", bg: "bg-amber-50", ring: "ring-amber-200", text: "text-amber-700" },
  { id: "rouge", label: "Refusé", dot: "bg-red-400", bg: "bg-red-50", ring: "ring-red-200", text: "text-red-700" },
];

interface Lien {
  url: string;
  description: string;
}

interface Candidature {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  statut?: string;
  experience?: string;
  categories: string[];
  resume: string;
  tarifHoraire?: string;
  liens: Lien[];
  createdAt: string;
  status: string;
  commentaire?: string;
  prix?: string;
  __demo?: boolean;
}

const EXP_LABEL: Record<string, string> = {
  junior: "< 1 an",
  "1-3": "1-3 ans",
  "3-7": "3-7 ans",
  "7+": "7+ ans",
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Candidature | null>(null);
  const [filterCat, setFilterCat] = useState("");
  const [filterTag, setFilterTag] = useState<"all" | TagColor>("all");
  const [tab, setTab] = useState<"actifs" | "archives">("actifs");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchCandidatures = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/candidatures", {
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        const data = await res.json();
        setCandidatures(data);
        setAuthenticated(true);
      } else {
        setError("Mot de passe incorrect.");
      }
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  }, [password]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    fetchCandidatures();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer définitivement cette candidature ?")) return;
    await fetch(`/api/candidatures/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    setCandidatures((prev) => prev.filter((c) => c._id !== id));
    if (selected?._id === id) setSelected(null);
  }

  async function loadDemo() {
    await fetch("/api/candidatures/demo", {
      method: "POST",
      headers: { "x-admin-password": password },
    });
    await fetchCandidatures();
  }

  async function clearDemo() {
    if (!confirm("Supprimer toutes les candidatures de démo ?")) return;
    await fetch("/api/candidatures/demo", {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    await fetchCandidatures();
    setSelected(null);
  }

  async function handleUpdate(
    id: string,
    patch: Partial<Pick<Candidature, "commentaire" | "prix" | "status">>
  ) {
    await fetch(`/api/candidatures/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify(patch),
    });
    setCandidatures((prev) =>
      prev.map((c) => (c._id === id ? { ...c, ...patch } : c))
    );
    setSelected((prev) => (prev && prev._id === id ? { ...prev, ...patch } : prev));
  }

  useEffect(() => {
    if (authenticated) fetchCandidatures();
  }, [authenticated, fetchCandidatures]);

  // Bloquer scroll body quand drawer ouvert sur mobile
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [selected]);

  const actifs = candidatures.filter((c) => (c.status || "nouveau") !== "rouge");
  const archives = candidatures.filter((c) => c.status === "rouge");
  const baseList = tab === "actifs" ? actifs : archives;

  const filtered = baseList.filter((c) => {
    if (filterCat && !c.categories.includes(filterCat)) return false;
    if (filterTag !== "all" && (c.status || "nouveau") !== filterTag) return false;
    if (search) {
      const s = search.toLowerCase();
      const hay = `${c.prenom} ${c.nom} ${c.email} ${c.telephone}`.toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  });

  const tagOf = (status?: string) =>
    TAGS.find((t) => t.id === ((status as TagColor) || "nouveau"))!;

  if (!authenticated) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8 bg-[#0A2540] min-h-screen">
        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm space-y-4">
          <h1 className="text-xl font-semibold text-[#0A2540] text-center">Admin · Recrutement</h1>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:border-[#0A2540] focus:ring-4 focus:ring-blue-100 outline-none transition"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A2540] hover:bg-[#0a2540ee] text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? "Connexion..." : "Accéder"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 sticky top-0 z-10">
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-[#0A2540] truncate">
            CRM Recrutement
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">VBWEB · {candidatures.length} candidatures</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {candidatures.some((c) => c.__demo) ? (
            <button
              onClick={clearDemo}
              className="text-[11px] sm:text-xs bg-red-50 hover:bg-red-100 text-red-700 ring-1 ring-red-200 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition"
            >
              Supprimer démo
            </button>
          ) : (
            <button
              onClick={loadDemo}
              className="text-[11px] sm:text-xs bg-blue-50 hover:bg-blue-100 text-[#0A2540] ring-1 ring-blue-200 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition"
            >
              Charger démo
            </button>
          )}
          <button
            onClick={fetchCandidatures}
            className="text-[11px] sm:text-xs bg-white ring-1 ring-gray-200 hover:bg-gray-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition text-gray-700"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Filtres par statut */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4">
        <Stat label="Nouveaux" dot="bg-gray-300" active={filterTag === "nouveau"} onClick={() => setFilterTag(filterTag === "nouveau" ? "all" : "nouveau")} />
        <Stat label="OK" dot="bg-emerald-400" active={filterTag === "vert"} onClick={() => setFilterTag(filterTag === "vert" ? "all" : "vert")} />
        <Stat label="À revoir" dot="bg-amber-400" active={filterTag === "orange"} onClick={() => setFilterTag(filterTag === "orange" ? "all" : "orange")} />
        <Stat label="Archives" dot="bg-red-400" active={tab === "archives"} onClick={() => { setTab(tab === "archives" ? "actifs" : "archives"); setFilterTag("all"); }} />
      </div>

      {/* Filtres barre */}
      <div className="flex flex-wrap items-center gap-2 px-3 sm:px-6 pb-3 sm:pb-4">
        <div className="inline-flex rounded-lg bg-white ring-1 ring-gray-200 p-0.5">
          <button
            onClick={() => { setTab("actifs"); setFilterTag("all"); setSelected(null); }}
            className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-md transition ${
              tab === "actifs" ? "bg-[#0A2540] text-white" : "text-gray-600"
            }`}
          >
            Actifs · {actifs.length}
          </button>
          <button
            onClick={() => { setTab("archives"); setFilterTag("all"); setSelected(null); }}
            className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-md transition ${
              tab === "archives" ? "bg-[#0A2540] text-white" : "text-gray-600"
            }`}
          >
            Archives · {archives.length}
          </button>
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 focus:border-[#0A2540] outline-none"
        >
          <option value="">Tous postes</option>
          {Object.entries(CATEGORIES_FULL).map(([id, label]) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Rechercher un candidat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[140px] rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-[#0A2540] outline-none"
        />
      </div>

      {/* Tableau */}
      <div className="flex-1 px-2 sm:px-6 pb-6">
        <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-[1050px]">
              {/* Desktop header */}
              <div className="grid grid-cols-[130px_minmax(140px,1.1fr)_140px_minmax(180px,1.4fr)_minmax(140px,1fr)_110px_80px_70px] gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                <div>Statut</div>
                <div>Candidat</div>
                <div>Profil</div>
                <div>Contact</div>
                <div>Postes</div>
                <div>Tarif</div>
                <div>Reçu</div>
                <div className="text-right">Actions</div>
              </div>

              {filtered.length === 0 ? (
                <div className="p-12 text-center text-sm text-gray-400">
                  Aucune candidature.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filtered.map((c) => (
                    <div
                      key={c._id}
                      onClick={() => setSelected(c)}
                      className="grid grid-cols-[130px_minmax(140px,1.1fr)_140px_minmax(180px,1.4fr)_minmax(140px,1fr)_110px_80px_70px] gap-3 items-center px-4 py-3 text-sm cursor-pointer hover:bg-gray-50/60 transition"
                    >
                      <StatusSelector
                        status={c.status || "nouveau"}
                        onChange={(s) => handleUpdate(c._id, { status: s })}
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-[#0A2540] truncate">
                          {c.prenom} {c.nom}
                        </div>
                      </div>
                      <div className="min-w-0 text-xs">
                        {c.statut ? (
                          <>
                            <div className="font-medium text-[#0A2540]">{c.statut}</div>
                            <div className="text-gray-400">{EXP_LABEL[c.experience || ""] || ""}</div>
                          </>
                        ) : (
                          <span className="text-gray-300">·</span>
                        )}
                      </div>
                      <div className="min-w-0 text-gray-600 text-xs">
                        <div className="truncate">{c.email}</div>
                        <div className="text-gray-400 truncate">{c.telephone}</div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {c.categories.map((cat) => (
                          <span
                            key={cat}
                            className="text-[11px] bg-blue-50 text-[#0A2540] px-2 py-0.5 rounded-full font-medium"
                          >
                            {CATEGORIES_MAP[cat] || cat}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-700 font-medium truncate">
                        {c.prix || c.tarifHoraire || <span className="text-gray-300">·</span>}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {new Date(c.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                      </div>
                      <div className="text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelected(c); }}
                          className="text-xs text-[#0A2540] hover:underline font-medium"
                        >
                          Voir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile list */}
          <div className="md:hidden">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-sm text-gray-400">
                Aucune candidature.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filtered.map((c) => {
                  const tag = tagOf(c.status);
                  return (
                    <div
                      key={c._id}
                      onClick={() => setSelected(c)}
                      className="flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50/60 transition"
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${tag.dot}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-[#0A2540] truncate text-sm">
                            {c.prenom} {c.nom}
                          </div>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {new Date(c.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                          </span>
                        </div>
                        {(c.statut || c.experience) && (
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            {c.statut}
                            {c.statut && c.experience ? " · " : ""}
                            {EXP_LABEL[c.experience || ""] || ""}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          {c.categories.map((cat) => (
                            <span
                              key={cat}
                              className="text-[10px] bg-blue-50 text-[#0A2540] px-1.5 py-0.5 rounded-full font-medium"
                            >
                              {CATEGORIES_MAP[cat] || cat}
                            </span>
                          ))}
                          {(c.prix || c.tarifHoraire) && (
                            <span className="text-[10px] text-gray-500 font-medium">
                              · {c.prix || c.tarifHoraire}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer détail */}
      {selected && (
        <Drawer
          candidat={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          onDelete={() => handleDelete(selected._id)}
        />
      )}
    </div>
  );
}

function Stat({
  label,
  dot,
  active,
  onClick,
}: {
  label: string;
  dot: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 bg-white rounded-xl px-3 py-3 ring-1 transition hover:shadow-sm ${
        active ? "ring-2 ring-[#0A2540]" : "ring-gray-200"
      }`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
      <span className="text-xs sm:text-sm font-semibold text-[#0A2540] truncate">
        {label}
      </span>
    </button>
  );
}

function StatusSelector({
  status,
  onChange,
}: {
  status: string;
  onChange: (s: TagColor) => void;
}) {
  const tag = TAGS.find((t) => t.id === status) || TAGS[0];
  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      {TAGS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          title={t.label}
          className={`w-5 h-5 rounded-full transition ${t.dot} ${
            tag.id === t.id ? "ring-2 ring-offset-1 ring-[#0A2540] scale-110" : "opacity-40 hover:opacity-80"
          }`}
          aria-label={t.label}
        />
      ))}
    </div>
  );
}

function Drawer({
  candidat,
  onClose,
  onUpdate,
  onDelete,
}: {
  candidat: Candidature;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Pick<Candidature, "commentaire" | "prix" | "status">>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full sm:max-w-xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col animate-in slide-in-from-right">
        {/* Header drawer */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-start justify-between gap-3 z-10">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-[#0A2540] truncate">
              {candidat.prenom} {candidat.nom}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Reçu le {new Date(candidat.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 transition flex items-center justify-center text-xl leading-none"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 space-y-5">
          {/* Tag statut */}
          <div>
            <Label>Statut</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {TAGS.map((t) => {
                const active = (candidat.status || "nouveau") === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onUpdate(candidat._id, { status: t.id })}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                      active
                        ? `${t.bg} ${t.text} ring-2 ${t.ring}`
                        : "bg-gray-50 text-gray-500 ring-1 ring-gray-100 hover:bg-gray-100"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.dot}`} />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
            {candidat.status === "rouge" && (
              <p className="text-[11px] text-red-600 mt-2">Archivé automatiquement.</p>
            )}
          </div>

          {/* Profil */}
          {(candidat.statut || candidat.experience) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type de profil</Label>
                <div className="text-sm text-[#0A2540] font-semibold">
                  {candidat.statut || ""}
                </div>
              </div>
              <div>
                <Label>Expérience</Label>
                <div className="text-sm text-[#0A2540] font-semibold">
                  {EXP_LABEL[candidat.experience || ""] || ""}
                </div>
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Email</Label>
              <a href={`mailto:${candidat.email}`} className="text-sm text-[#0A2540] font-medium hover:underline break-all">
                {candidat.email}
              </a>
            </div>
            <div>
              <Label>Téléphone</Label>
              <a href={`tel:${candidat.telephone}`} className="text-sm text-[#0A2540] font-medium hover:underline break-all">
                {candidat.telephone}
              </a>
            </div>
          </div>

          {/* Postes */}
          <div>
            <Label>Postes visés</Label>
            <div className="flex flex-wrap gap-1.5">
              {candidat.categories.map((cat) => (
                <span
                  key={cat}
                  className="text-sm bg-blue-50 text-[#0A2540] px-3 py-1 rounded-full font-medium"
                >
                  {CATEGORIES_FULL[cat] || cat}
                </span>
              ))}
            </div>
          </div>

          {/* Présentation */}
          <div>
            <Label>Présentation</Label>
            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4 text-sm leading-relaxed">
              {candidat.resume}
            </p>
          </div>

          {/* Liens */}
          {candidat.liens.length > 0 && (
            <div>
              <Label>Liens</Label>
              <div className="space-y-1.5">
                {candidat.liens.map((lien, i) => (
                  <a
                    key={i}
                    href={lien.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 bg-gray-50 hover:bg-blue-50 rounded-lg px-3 py-2 text-sm transition group"
                  >
                    <span className="text-[#0A2540] font-medium truncate">
                      {lien.description || lien.url}
                    </span>
                    <span className="text-xs text-gray-400 group-hover:text-[#0A2540] shrink-0">↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tarif demandé */}
          {candidat.tarifHoraire && (
            <div className="border-t border-gray-100 pt-5">
              <Label>Tarif horaire demandé</Label>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-[#0A2540] font-medium">
                {candidat.tarifHoraire}
              </div>
            </div>
          )}

          {/* Notes post-entretien */}
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#0A2540]">Notes après entretien</h3>
            <div>
              <Label>Tarif négocié</Label>
              <input
                type="text"
                placeholder="ex: 200€/projet, 15€/h..."
                defaultValue={candidat.prix || ""}
                key={`prix-${candidat._id}`}
                onBlur={(e) =>
                  e.target.value !== (candidat.prix || "") &&
                  onUpdate(candidat._id, { prix: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-[#0A2540] focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>
            <div>
              <Label>Commentaire</Label>
              <textarea
                rows={4}
                placeholder="Vos notes sur ce candidat..."
                defaultValue={candidat.commentaire || ""}
                key={`comment-${candidat._id}`}
                onBlur={(e) =>
                  e.target.value !== (candidat.commentaire || "") &&
                  onUpdate(candidat._id, { commentaire: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-[#0A2540] focus:ring-2 focus:ring-blue-100 outline-none transition resize-y"
              />
              <p className="text-[11px] text-gray-400 mt-1">Sauvegardé en quittant le champ.</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-3 flex items-center justify-between">
          <button
            onClick={onDelete}
            className="text-xs text-gray-400 hover:text-red-500 transition"
          >
            Supprimer
          </button>
          <button
            onClick={onClose}
            className="bg-[#0A2540] hover:bg-[#0a2540ee] text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">
      {children}
    </div>
  );
}
