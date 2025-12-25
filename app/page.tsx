"use client";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import batAnimation from "@/public/animations/bat.json";

const Home: React.FC = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const p1Ref = useRef<HTMLParagraphElement>(null);
  const p2Ref = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const router = useRouter();

  useEffect(() => {
    const batEl = lottieRef.current?.animationContainerRef?.current;

    const tl = gsap.timeline({ defaults: { duration: 1, ease: "power2.out" } });

    if (
      mainRef.current &&
      h1Ref.current &&
      p1Ref.current &&
      p2Ref.current &&
      buttonRef.current &&
      batEl
    ) {
      // Fade in main content + bat
      tl.fromTo(mainRef.current, { opacity: 0 }, { opacity: 1 })
        .fromTo(
          batEl,
          { opacity: 0, scale: 2 }, // bigger scale for stronger presence
          {
            opacity: 1,
            scale: 2.2,
            filter: "drop-shadow(0 0 150px rgba(255,0,0,1))", // intense glow
          },
          "-=0.5"
        )
        .fromTo(h1Ref.current, { opacity: 0, y: -50 }, { opacity: 1, y: 0 }, "-=0.5")
        .fromTo(p1Ref.current, { opacity: 0, x: -50 }, { opacity: 1, x: 0 }, "-=0.4")
        .fromTo(p2Ref.current, { opacity: 0, x: 50 }, { opacity: 1, x: 0 }, "-=0.3")
        .fromTo(buttonRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1 }, "+=0.2");

      // Add subtle idle float for the bat
      gsap.to(batEl, {
        y: "-=10",
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  }, []);

  const handleEnter = () => {
    const batEl = lottieRef.current?.animationContainerRef?.current;
    const button = buttonRef.current;

    if (!batEl || !button) {
      router.push("/dashboard");
      return;
    }

    // Prefetch dashboard early
    router.prefetch("/dashboard");

    // Button press feedback
    gsap.to(button, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });

    // Fade out text & button
    gsap.to([h1Ref.current, p1Ref.current, p2Ref.current, buttonRef.current], {
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut",
    });

    // Bat animation: flapping
    lottieRef.current?.setSpeed(0.6);
    lottieRef.current?.goToAndPlay(0, true);

    // Intensify bat glow and scale on Enter click
    gsap.to(batEl, {
      opacity: 1,
      scale: 2.4, // slightly bigger for Enter animation
      duration: 0.3,
      ease: "power1.inOut",
      filter: "drop-shadow(0 0 180px rgba(255,0,0,1))", // even stronger glow
    });

    const endY = -window.innerHeight - 300;

    const tl = gsap.timeline({
      onComplete: () => router.push("/dashboard"),
    });

    // Idle flapping for 2 seconds
    tl.to(batEl, { duration: 2, y: "-=0", ease: "power1.inOut" })
      // Fly off upwards with fade
      .to(
        batEl,
        {
          y: endY,
          opacity: 0,
          scale: 2.5,
          duration: 1.2,
          ease: "power1.inOut",
        },
        ">"
      );
  };

  return (
    <main
      ref={mainRef}
      className="relative w-screen h-screen flex flex-col items-center justify-center bg-black text-slate-100 gap-12 text-center p-6 overflow-hidden"
    >
      {/* Bat */}
      <Lottie
        lottieRef={lottieRef}
        animationData={batAnimation}
        loop
        autoplay={false}
        className="absolute w-[450px] drop-shadow-[0_0_150px_rgba(255,0,0,0.9)]"
      />

      {/* Text */}
      <h1 ref={h1Ref} className="r_rose font-angel z-10 bg-clip-text text-transparent bg-gradient-to-b from-white to-red-900">
        Richy Rose
      </h1>
      <p ref={p1Ref} className="font-bitter text-4xl tracking-widest z-10">
        AI & Cybersecurity Engineer
      </p>
      <p ref={p2Ref} className="font-bitter italic text-2xl tracking-widest z-10">
        "Building Systems Beyond Human Capability"
      </p>

      <Button
        ref={buttonRef}
        onClick={handleEnter}
        className="text-6xl font-angel p-8 mt-4 tracking-widest z-10 
           bg-transparent border-none hover:bg-transparent
           relative group"
      >
        <span className="relative">
          Enter
          <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-slate-200 
                    transition-all duration-300 group-hover:w-full"></span>
        </span>
      </Button>
    </main>
  );
};

export default Home;
