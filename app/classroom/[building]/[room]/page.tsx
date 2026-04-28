import type { Metadata } from "next";
import SunsetPlaceholder from "@/components/SunsetPlaceholder";
import buildingsMetadata from "@/data/buildings-metadata.json";
import coursesData from "@/data/courses/courses-latest.json";
import { parseCourseSections, groupByRoom } from "@/lib/parse-courses";
import { getRoomRestrictions } from "@/lib/data-loader";
import { BuildingMetadata } from "@/types";

export async function generateStaticParams() {
  const buildings = buildingsMetadata.buildings as BuildingMetadata[];
  const sections = parseCourseSections(coursesData as any[]);
  const buildingsData = groupByRoom(sections, buildings, getRoomRestrictions());

  const params: { building: string; room: string }[] = [];
  buildingsData.forEach((buildingData) => {
    buildingData.rooms.forEach((room) => {
      params.push({
        building: buildingData.building,
        room: room.room,
      });
    });
  });
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ building: string; room: string }>;
}): Promise<Metadata> {
  const { building, room } = await params;
  const buildings = buildingsMetadata.buildings as BuildingMetadata[];
  const buildingData = buildings.find((b) => b.code === building);
  const buildingName = buildingData?.name || building;

  const title = `${building} ${room} - Aula-Finder se está despidiendo`;
  const description = `Aula-Finder se está despidiendo. La consulta oficial de salones disponibles en ${buildingName} ahora continúa en una nueva plataforma institucional.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/Aula-Finder/classroom/${building}/${room}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function ClassroomDetailPage({
  params,
}: {
  params: Promise<{ building: string; room: string }>;
}) {
  await params;
  return <SunsetPlaceholder />;
}
