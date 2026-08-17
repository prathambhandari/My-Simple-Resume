import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add a free key — My Simple Resume",
  description: "Keep chatting with a free Groq key. No coding needed.",
};

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
