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

export default async function ClassroomDetailPage({
  params,
}: {
  params: Promise<{ building: string; room: string }>;
}) {
  const { building, room } = await params;
  return <ClassroomDetailClient building={building} room={room} />;
}
