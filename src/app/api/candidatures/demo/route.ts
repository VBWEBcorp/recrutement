import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const DEMO_DATA = [
  {
    nom: "Rakoto",
    prenom: "Andry",
    email: "andry.rakoto@exemple.mg",
    telephone: "+261 34 12 34 567",
    statut: "Freelance",
    experience: "3-7",
    categories: ["developpeur"],
    resume:
      "Développeur full-stack depuis 5 ans, spécialisé Next.js et MongoDB. J'ai déjà migré une dizaine de sites WordPress vers Next.js. Très à l'aise avec la gestion DNS, OVH, et les déploiements Vercel. Je cherche une collaboration long terme.",
    tarifHoraire: "20€/h",
    liens: [
      { url: "https://github.com/andryrakoto", description: "Mon GitHub" },
      { url: "https://andry-portfolio.vercel.app", description: "Portfolio" },
    ],
    status: "nouveau",
    __demo: true,
  },
  {
    nom: "Randrianasolo",
    prenom: "Mialy",
    email: "mialy.r@exemple.mg",
    telephone: "+261 33 98 76 543",
    statut: "Agence",
    experience: "7+",
    categories: ["seo", "ads"],
    resume:
      "Expert SEO et Google Ads depuis 7 ans. J'ai accompagné +30 PME françaises sur leur visibilité locale. Je produis des rapports mensuels clairs, je contacte les clients directement via Meet ou WhatsApp. Meta Ads également maîtrisé.",
    tarifHoraire: "18€/h",
    liens: [
      { url: "https://docs.google.com/document/d/demo-cv", description: "CV détaillé" },
      { url: "https://mialy-seo.com", description: "Mon site" },
    ],
    status: "vert",
    prix: "220€/mois par client",
    commentaire:
      "Entretien très positif. Parle bien français, structurée, portfolio convaincant. À tester sur un client pilote.",
    __demo: true,
  },
  {
    nom: "Razafindrakoto",
    prenom: "Tiana",
    email: "tiana.r@exemple.mg",
    telephone: "+261 32 44 55 667",
    statut: "Freelance",
    experience: "1-3",
    categories: ["setter"],
    resume:
      "J'ai 3 ans d'expérience en prospection B2B pour des agences web en France. Je préfère des vraies conversations à des scripts. Disponible 25h/semaine, horaires flexibles.",
    tarifHoraire: "12€/h",
    liens: [
      { url: "https://linkedin.com/in/tiana-demo", description: "LinkedIn" },
    ],
    status: "orange",
    commentaire: "Potentielle mais il faut vérifier le niveau de français à l'oral. Rappeler cette semaine.",
    __demo: true,
  },
  {
    nom: "Rabe",
    prenom: "Hery",
    email: "hery.rabe@exemple.mg",
    telephone: "+261 34 77 88 999",
    statut: "Freelance",
    experience: "junior",
    categories: ["developpeur", "seo"],
    resume: "Développeur junior, 1 an d'expérience. Motivé mais manque de références concrètes.",
    tarifHoraire: "8€/h",
    liens: [],
    status: "rouge",
    commentaire: "Trop junior pour le moment. Lui dire de revenir dans 1 an.",
    __demo: true,
  },
];

export async function POST(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("Recrutement");

  const docs = DEMO_DATA.map((d, i) => ({
    ...d,
    createdAt: new Date(Date.now() - (i + 1) * 86400000 * 2),
  }));

  await db.collection("candidatures").insertMany(docs);
  return NextResponse.json({ success: true, count: docs.length });
}

export async function DELETE(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("Recrutement");
  const result = await db.collection("candidatures").deleteMany({ __demo: true });
  return NextResponse.json({ success: true, deleted: result.deletedCount });
}
