import type { Metadata } from "next";
import MapClient from "./MapClient";

export const metadata: Metadata = {
  title: "Mapa del Campus - Aula-Finder",
  description: "Visualiza los edificios de la Universidad de los Andes en el mapa del campus y consulta la disponibilidad de salones.",
  openGraph: {
    title: "Mapa del Campus - Aula-Finder",
    description: "Visualiza los edificios de la Universidad de los Andes en el mapa del campus.",
    url: "/Aula-Finder/map",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Mapa del Campus - Aula-Finder",
    description: "Visualiza los edificios de la Universidad de los Andes en el mapa del campus.",
  },
};

export default function MapPage() {
  return <MapClient />;
}
