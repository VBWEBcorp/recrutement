import { NextRequest, NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const password = request.headers.get("x-admin-password");
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const client = await getMongoClient();
    const db = client.db("Recrutement");

    const candidature = await db
      .collection("candidatures")
      .findOne({ _id: new ObjectId(id) });

    if (!candidature) {
      return NextResponse.json(
        { error: "Candidature introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json(candidature);
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const password = request.headers.get("x-admin-password");
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const body = await request.json();
    const allowed: Record<string, unknown> = {};
    if (typeof body.commentaire === "string") allowed.commentaire = body.commentaire;
    if (typeof body.prix === "string") allowed.prix = body.prix;
    if (typeof body.status === "string") allowed.status = body.status;

    const client = await getMongoClient();
    const db = client.db("Recrutement");

    await db
      .collection("candidatures")
      .updateOne({ _id: new ObjectId(id) }, { $set: allowed });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const password = request.headers.get("x-admin-password");
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const client = await getMongoClient();
    const db = client.db("Recrutement");

    await db.collection("candidatures").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
