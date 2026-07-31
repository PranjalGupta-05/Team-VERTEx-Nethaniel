import type { Metadata } from "next";
import { ReconstructionsView } from "@/components/reconstructions/reconstructions-view";

export const metadata: Metadata = {
  title: "3D Crime Scene Reconstruction",
  description: "Interactive WebGL 3D crime scene reconstruction with bullet trajectory analysis.",
};

export default function ReconstructionsPage() {
  return <ReconstructionsView />;
}
