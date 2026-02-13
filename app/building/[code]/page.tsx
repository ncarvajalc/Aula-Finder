import BuildingDetailClient from "./BuildingDetailClient";
import buildingsMetadata from "@/data/buildings-metadata.json";
import { BuildingMetadata } from "@/types";

export async function generateStaticParams() {
  const buildings = buildingsMetadata.buildings as BuildingMetadata[];
  return buildings.map((building) => ({ code: building.code }));
}

export default async function BuildingDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <BuildingDetailClient code={code} />;
}
