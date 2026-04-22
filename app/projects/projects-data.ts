export type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  github: string;
  demo: string;
  demoMode?: "external" | "terminal";
};

export const projects: Project[] = [
  {
    id: "01",
    title: "Password Cracker",
    description:
      "GPU-accelerated password cracking system built for security research, benchmarking, and threat modelling.",
    image: "/images/pw-crack-img.png",
    github: "https://github.com/yourname/password-cracker",
    demo: "https://password-cracker.onrender.com/",
  },
  {
    id: "02",
    title: "LukaScope",
    description:
      "AI-driven system for early leukaemia detection, leveraging longitudinal medical data and predictive modelling.",
    image: "/images/lukascope.png",
    github: "https://github.com/yourname/lukascope",
    demo: "https://demo-link.com",
  },
  {
    id: "03",
    title: "Arc and Chrome YouTube Speed Extension",
    description: "Adjust speed and volume of YouTube including custom values.",
    image: "/images/pw-crack-img.png",
    github: "https://github.com/richardwaters9049/YouTube_Extension.git",
    demo: "https://demo-link.com",
  },
  {
    id: "04",
    title: "Docker Script",
    description:
      "Dockerized Python + Next.js script runner for repeatable local dev and testing workflows.",
    image: "/images/IT.png",
    github: "https://github.com/richardwaters9049/DockerScripts.git",
    demo: "docker-script-terminal",
    demoMode: "terminal",
  },
];
