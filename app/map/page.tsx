import type { Metadata } from "next";
import SunsetPlaceholder from "@/components/SunsetPlaceholder";

export const metadata: Metadata = {
  title: "Aula-Finder se está despidiendo",
  description: "Aula-Finder se está despidiendo y ahora dirige a la plataforma oficial para consultar salones disponibles en la Universidad de los Andes.",
  openGraph: {
    title: "Aula-Finder se está despidiendo",
    description: "La consulta de salones disponibles ahora continúa en la plataforma oficial de la Universidad de los Andes.",
    url: "/Aula-Finder/map",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Aula-Finder se está despidiendo",
    description: "La consulta de salones disponibles ahora continúa en la plataforma oficial de la Universidad de los Andes.",
  },
};

export default function MapPage() {
  return <SunsetPlaceholder />;
}
