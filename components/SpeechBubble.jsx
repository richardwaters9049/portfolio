"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function SpeechBubble({
  children,
  delay = 2,
  tailPosition = "right",
}) {
  const bubbleRef = useRef(null);

  useEffect(() => {
    const bubble = bubbleRef.current;

    // Entrance animation with pop and squash
    const tl = gsap.timeline({ delay });

    tl.fromTo(
      bubble,
      {
        opacity: 0,
        scale: 0.5,
        transformOrigin:
          tailPosition === "right" ? "right bottom" : "left bottom",
      },
      { opacity: 1, scale: 1.2, duration: 0.4, ease: "back.out(2)" }
    ).to(bubble, { scale: 1, duration: 0.2, ease: "elastic.out(1, 0.5)" });

    // Idle floating animation
    gsap.to(bubble, {
      y: -6,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
      delay: delay + 0.6,
    });
  }, [delay, tailPosition]);

  return (
    <div
      ref={bubbleRef}
      className={`
        speech-bubble
        absolute
        -top-10
        ${tailPosition === "right" ? "left-1/3" : "right-1/3"}
        z-20
        scale-90
        sm:scale-95
        md:scale-100
      `}
      data-tail={tailPosition}
    >
      <div className="bubble-content">{children}</div>
    </div>
  );
}
