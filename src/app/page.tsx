"use client";

import { useState } from "react";

const CATEGORIES = [
  {
    id: "developpeur",
    label: "Développeur Web",
    description:
      "Quelqu'un qui sait coder et qui peut aider sur plein de démarches à côté (DNS, optimisation, etc.). Un vrai bras droit technique.",
  },
  {
    id: "seo",
    label: "Expert SEO",
    description:
      "Bon en SEO, qui mène des actions concrètes chaque mois et reste en contact direct avec le client via l'app.",
  },
  {
    id: "ads",
    label: "Meta Ads & Google Ads",
    description: "Calé en publicité Meta (Facebook / Instagram) et Google Ads.",
  },
  {
    id: "setter",
    label: "Setter",
    description:
      "Bon ciblage requis et humain dans les conversations, pas de scripts robots.",
  },
];

const EXPERIENCES = [
  { id: "junior", label: "Moins d'1 an" },
  { id: "1-3", label: "1 à 3 ans" },
  { id: "3-7", label: "3 à 7 ans" },
  { id: "7+", label: "Plus de 7 ans" },
];

interface LienItem {
  url: string;
  description: string;
}

export default function Home() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    statut: "",
    experience: "",
    categories: [] as string[],
    resume: "",
    tarifHoraire: "",
  });
  const [liens, setLiens] = useState<LienItem[]>([{ url: "", description: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function toggleCategory(id: string) {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id],
    }));
  }

  function addLien() {
    if (liens.length < 5) setLiens([...liens, { url: "", description: "" }]);
  }

  function removeLien(index: number) {
    setLiens(liens.filter((_, i) => i !== index));
  }

  function updateLien(index: number, field: keyof LienItem, value: string) {
    const updated = [...liens];
    updated[index][field] = value;
    setLiens(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.statut) {
      setError("Indiquez si vous êtes freelance ou une agence.");
      return;
    }
    if (!form.experience) {
      setError("Indiquez votre expérience dans le domaine.");
      return;
    }
    if (!form.categories.length) {
      setError("Sélectionnez au moins un poste.");
      return;
    }

    setSubmitting(true);
    const liensFiltered = liens.filter((l) => l.url.trim() !== "");

    try {
      const res = await fetch("/api/candidatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, liens: liensFiltered }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Une erreur est survenue.");
      } else {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setError("Erreur de connexion. Réessayez dans un instant.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0A2540] relative overflow-hidden">
        <BackgroundMesh />
        <div className="relative bg-white rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-2xl">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-[#0A2540] flex items-center justify-center mb-6">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#0A2540] tracking-tight mb-3">
            Candidature envoyée
          </h1>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            Merci d&apos;avoir postulé. Si votre profil correspond, vous serez recontacté rapidement.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A2540] relative">
      <BackgroundMesh />

      {/* Hero */}
      <header className="relative">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-8 sm:pt-20 pb-8 sm:pb-14">
          <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://i.ibb.co/1fRDj4NP/Victor.jpg"
              alt="Victor, fondateur VBWEB"
              loading="eager"
              fetchPriority="high"
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-white/20 shadow-xl shrink-0"
            />
            <div className="min-w-0">
              <div className="text-[13px] sm:text-sm font-medium text-white leading-tight">
                Victor · Fondateur VBWEB
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-blue-200/80 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Équipe jeune et dynamique
              </div>
            </div>
          </div>

          <h1 className="text-[28px] sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.1] flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span>Rejoignez</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://i.ibb.co/C3ZJ3z59/VBWEB-LOGO-BLEU-BLANC.png"
              alt="VBWEB"
              className="inline-block h-7 sm:h-12 lg:h-14 w-auto translate-y-1"
            />
            <span>.</span>
          </h1>
          <p className="mt-3 sm:mt-5 text-sm sm:text-lg text-blue-100/70 leading-relaxed max-w-xl">
            Agence web en pleine croissance. On travaille au projet, avec des profils rigoureux et passionnés.
          </p>
        </div>
      </header>

      {/* Formulaire */}
      <main className="relative max-w-2xl mx-auto px-3 sm:px-6 pb-10 sm:pb-24">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* À propos VBWEB */}
          <div className="px-4 py-5 sm:p-8 bg-gradient-to-br from-blue-50 to-white border-b border-gray-100">
            <div className="text-[10px] sm:text-xs uppercase tracking-wider text-[#0A2540] font-semibold mb-2">
              À propos de VBWEB
            </div>
            <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed">
              VBWEB est une jeune agence web dynamique, déjà spécialisée dans le
              développement. Nous sommes aujourd&apos;hui une équipe de{" "}
              <span className="font-semibold text-[#0A2540]">2 développeurs en interne</span>{" "}
              et nous cherchons à nous entourer de profils complémentaires pour
              grandir ensemble. On privilégie les collaborations long terme, dans
              un cadre équilibré pour tout le monde.
            </p>
          </div>

          {/* 1. Qui */}
          <Section n="1" title="Qui êtes-vous ?">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field label="Prénom" required>
                <input
                  type="text"
                  required
                  autoComplete="given-name"
                  autoCapitalize="words"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="Nom" required>
                <input
                  type="text"
                  required
                  autoComplete="family-name"
                  autoCapitalize="words"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="Email" required>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder="nom@exemple.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="Téléphone / WhatsApp" required>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+261 ..."
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  className="input"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
              <div>
                <span className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Vous êtes <span className="text-[#0A2540]">*</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {["Freelance", "Agence"].map((s) => {
                    const active = form.statut === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm({ ...form, statut: s })}
                        className={`py-3 rounded-xl text-sm font-semibold transition ${
                          active
                            ? "bg-[#0A2540] text-white ring-2 ring-[#0A2540]"
                            : "bg-gray-50 text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Field label="Expérience dans le domaine" required>
                <select
                  required
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  className="input"
                >
                  <option value="">Choisir</option>
                  {EXPERIENCES.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>

          <Divider />

          {/* 2. Postes */}
          <Section
            n="2"
            title="Pour quel poste ?"
            hint="Plusieurs choix possibles."
          >
            <div className="space-y-2.5">
              {CATEGORIES.map((cat) => {
                const checked = form.categories.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className={`group flex items-start gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl cursor-pointer transition-all ${
                      checked
                        ? "bg-[#0A2540] text-white ring-2 ring-[#0A2540]"
                        : "bg-gray-50 hover:bg-gray-100 ring-1 ring-gray-200/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(cat.id)}
                      className="sr-only"
                    />
                    <div
                      className={`shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${
                        checked
                          ? "bg-white border-white"
                          : "border-gray-300 group-hover:border-gray-400 bg-white"
                      }`}
                    >
                      {checked && (
                        <svg
                          className="w-3 h-3 text-[#0A2540]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={4}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm sm:text-base leading-snug">
                        {cat.label}
                      </div>
                      <p
                        className={`text-xs sm:text-sm mt-1 leading-relaxed ${
                          checked ? "text-blue-100/80" : "text-gray-500"
                        }`}
                      >
                        {cat.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </Section>

          <Divider />

          {/* 3. Présentation */}
          <Section
            n="3"
            title="Présentez-vous"
            hint="Quelques lignes sur votre expérience, vos compétences, pourquoi vous."
          >
            <textarea
              required
              rows={5}
              placeholder="Je m'appelle... je fais ça depuis... ce qui me motive..."
              value={form.resume}
              onChange={(e) => setForm({ ...form, resume: e.target.value })}
              className="input resize-y min-h-[120px]"
            />
          </Section>

          <Divider />

          {/* 4. Tarif */}
          <Section n="4" title="Votre tarif horaire" optional>
            <div className="bg-blue-50/60 ring-1 ring-blue-100 rounded-xl p-3.5 sm:p-4 mb-4 sm:mb-5">
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                Notre tarification dépend du type de mission : certains projets
                sont au <span className="font-semibold text-[#0A2540]">forfait fixe</span>,
                d&apos;autres sont payés à <span className="font-semibold text-[#0A2540]">l&apos;heure</span> parce que c&apos;est plus
                volatile (interventions, DNS, dépannage, bras droit technique).
                Pour démarrer, indiquez simplement votre tarif horaire.
              </p>
            </div>
            <Field label="Tarif horaire">
              <input
                type="text"
                value={form.tarifHoraire}
                onChange={(e) => setForm({ ...form, tarifHoraire: e.target.value })}
                className="input"
              />
            </Field>
          </Section>

          <Divider />

          {/* 5. Liens */}
          <Section
            n="5"
            title="Vos liens"
            hint="Portfolio, CV Google Doc, GitHub, LinkedIn... jusqu'à 5 liens. Mettez vos pièces jointes dans un Google Doc partagé."
            optional
          >
            <div className="space-y-2.5 sm:space-y-3">
              {liens.map((lien, i) => (
                <div
                  key={i}
                  className="relative bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 ring-1 ring-gray-200/50"
                >
                  <div className="flex gap-2 sm:gap-3 items-start">
                    <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white flex items-center justify-center text-gray-400 font-medium text-xs sm:text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <input
                        type="url"
                        placeholder="https://..."
                        value={lien.url}
                        onChange={(e) => updateLien(i, "url", e.target.value)}
                        className="input-sm"
                      />
                      <input
                        type="text"
                        placeholder="Description (ex: Mon CV, Portfolio...)"
                        value={lien.description}
                        onChange={(e) => updateLien(i, "description", e.target.value)}
                        className="input-sm"
                      />
                    </div>
                    {liens.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLien(i)}
                        className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition flex items-center justify-center text-lg leading-none"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {liens.length < 5 && (
              <button
                type="button"
                onClick={addLien}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#0A2540] hover:text-blue-700 transition"
              >
                <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-base leading-none">
                  +
                </span>
                Ajouter un lien
              </button>
            )}
          </Section>

          <Divider />

          {/* Submit */}
          <div className="px-4 py-5 sm:p-8 bg-gray-50/50">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#0A2540] hover:bg-[#0a2540ee] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 sm:py-4 rounded-xl sm:rounded-2xl transition-all text-sm sm:text-base shadow-lg shadow-[#0A2540]/20 active:scale-[0.99]"
            >
              {submitting ? "Envoi en cours..." : "Envoyer ma candidature"}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              Vos infos sont envoyées directement à Victor (VBWEB.fr).
            </p>
          </div>
        </form>

        <p className="text-center text-xs text-blue-200/50 mt-6 sm:mt-8">
          VBWEB.fr · Agence web
        </p>
      </main>
    </div>
  );
}

function Section({
  n,
  title,
  hint,
  optional,
  children,
}: {
  n: string;
  title: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="px-4 py-5 sm:p-8">
      <div className="flex items-center gap-2 sm:gap-3 mb-1">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0A2540] text-white text-xs sm:text-sm font-semibold flex items-center justify-center shrink-0">
          {n}
        </div>
        <h2 className="text-base sm:text-lg font-semibold text-[#0A2540] tracking-tight">
          {title}
        </h2>
        {optional && (
          <span className="text-[10px] sm:text-xs text-gray-400 font-normal uppercase tracking-wider">
            optionnel
          </span>
        )}
      </div>
      {hint && (
        <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-5 ml-8 sm:ml-10 leading-relaxed">
          {hint}
        </p>
      )}
      {!hint && <div className="mb-4 sm:mb-5" />}
      {children}
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-[#0A2540] ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

function Divider() {
  return <div className="border-t border-gray-100" />;
}

function BackgroundMesh() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute top-20 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[120px]" />
    </div>
  );
}
