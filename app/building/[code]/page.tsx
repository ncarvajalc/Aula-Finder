import type { Metadata } from "next";
import SunsetPlaceholder from "@/components/SunsetPlaceholder";
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
      title: "Aula-Finder se está despidiendo",
    };
  }

  const title = `${building.name} (${building.code}) - Aula-Finder se está despidiendo`;
  const description = `Aula-Finder se está despidiendo. La consulta oficial de salones disponibles en la Universidad de los Andes ahora continúa en una nueva plataforma institucional.`;

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
  await params;
  return <SunsetPlaceholder />;
}
