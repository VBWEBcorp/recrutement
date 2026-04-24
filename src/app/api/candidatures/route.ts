import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      nom,
      prenom,
      email,
      telephone,
      statut,
      experience,
      categories,
      resume,
      tarifHoraire,
      liens,
    } = body;

    // Validation
    if (
      !nom ||
      !prenom ||
      !email ||
      !telephone ||
      !statut ||
      !experience ||
      !categories?.length ||
      !resume
    ) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis." },
        { status: 400 }
      );
    }

    if (liens && liens.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 liens autorisés." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Recrutement");

    const candidature = {
      nom,
      prenom,
      email,
      telephone,
      statut,
      experience,
      categories,
      resume,
      tarifHoraire: tarifHoraire || "",
      liens: liens || [],
      createdAt: new Date(),
      status: "nouveau",
    };

    const result = await db.collection("candidatures").insertOne(candidature);

    return NextResponse.json(
      { success: true, id: result.insertedId },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const password = request.headers.get("x-admin-password");
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("Recrutement");

    const candidatures = await db
      .collection("candidatures")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(candidatures);
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
