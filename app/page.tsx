"use client"
import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import gsap from 'gsap';

const Home: React.FC = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const p1Ref = useRef<HTMLParagraphElement>(null);
  const p2Ref = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Create GSAP timeline
    const timeline = gsap.timeline({
      defaults: { duration: 1, ease: "power2.out" },
    });

    // Check if all elements are properly referenced
    if (mainRef.current && h1Ref.current && p1Ref.current && p2Ref.current && buttonRef.current) {
      timeline
        .fromTo(mainRef.current,
          { opacity: 0 },
          { opacity: 1 })
        .fromTo(h1Ref.current,
          { opacity: 0, y: -50 },
          { opacity: 1, y: 0 }, "-=0.75")
        .fromTo(p1Ref.current,
          { opacity: 0, x: -50 },
          { opacity: 1, x: 0 }, "-=0.5")
        .fromTo(p2Ref.current,
          { opacity: 0, x: 50 },
          { opacity: 1, x: 0 }, "-=0.25")
        .fromTo(buttonRef.current,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, ease: "power1.out" }, "+=0.2");
    } else {
      console.error("One or more elements are not properly referenced.");
    }
  }, []);

  return (
    <main ref={mainRef} className="w-screen h-screen flex flex-col items-center justify-center main-container gap-5 text-center p-6">
      <h1 ref={h1Ref} className="font-angel">Richy Rose</h1>
      <p ref={p1Ref} className="font-zombie text-3xl tracking-widest ">Software Engineer</p>
      <p ref={p2Ref} className="font-zombie text-3xl tracking-widest">Ethical Hacker</p>
      <Link href="/dashboard" passHref>
        <Button ref={buttonRef} className="text-3xl font-angel p-8 m-8 tracking-widest">Enter</Button>
      </Link>
    </main>
  );
}

export default Home;
