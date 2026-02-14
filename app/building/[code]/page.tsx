import type { Metadata } from "next";
import BuildingDetailClient from "./BuildingDetailClient";
import buildingsMetadata from "@/data/buildings-metadata.json";
import { BuildingMetadata } from "@/types";

export async function generateStaticParams() {
  const buildings = buildingsMetadata.buildings as BuildingMetadata[];
  return buildings.map((building) => ({ code: building.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const buildings = buildingsMetadata.buildings as BuildingMetadata[];
  const building = buildings.find((b) => b.code === code);

  if (!building) {
    return {
      title: "Edificio no encontrado - Aula-Finder",
    };
  }

  const title = `${building.name} (${building.code}) - Aula-Finder`;
  const description = `Consulta la disponibilidad de salones en ${building.name} de la Universidad de los Andes. Ve qué aulas están libres en tiempo real.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/Aula-Finder/building/${code}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function BuildingDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <BuildingDetailClient code={code} />;
}
