import type { Metadata } from "next";
import ClassroomDetailClient from "./ClassroomDetailClient";
import buildingsMetadata from "@/data/buildings-metadata.json";
import coursesData from "@/data/courses/courses-202610.json";
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

  const title = `${building} ${room} - Aula-Finder`;
  const description = `Consulta el horario y disponibilidad del salón ${room} en ${buildingName} de la Universidad de los Andes.`;

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
  const { building, room } = await params;
  return <ClassroomDetailClient building={building} room={room} />;
}
