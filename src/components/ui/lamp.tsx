"use client";
import React from "react";
import { motion } from "motion/react"; // Assuming this is framer-motion, if it's "motion" library, syntax might differ slightly
import { cn } from "@/lib/utils";

export default function LampDemo() {
  return (
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, x: -100 }} // Adjusted for horizontal entry if lamp is on the side
        whileInView={{ opacity: 1, x: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
      >
        {/* Content Here */}
      </motion.h1>
    </LampContainer>
  );
}

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 w-full rounded-md z-0", // Main container setup
        className
      )}
    >
      {/* This container holds all the lamp visual effects. 
          It's positioned to simulate a lamp on the left.
          Adjust width (e.g. w-1/3 or fixed width like w-64) and height (h-full) as needed.
      */}
      <div className="absolute left-0 top-0 h-full w-1/4 flex items-center justify-center isolate z-0"> {/* Removed scale-y-125, positioned left */}
        {/* Light Beams (Conic Gradients) - reoriented for horizontal projection */}
        <motion.div
          initial={{ opacity: 0.5, height: "15rem" }} // Was width
          whileInView={{ opacity: 1, height: "30rem" }} // Was width
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          // Light beam pointing upwards and right
          className="absolute inset-auto top-1/2 transform -translate-y-1/2 w-56 overflow-visible h-[30rem] bg-gradient-conic from-orange-500 via-transparent to-transparent text-white [--conic-position:from_315deg_at_center_left]"
        >
          {/* Masks reoriented for horizontal light */}
          <div className="absolute w-40 h-[100%] top-0 right-0 bg-slate-950 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute h-40 w-[100%] top-0 right-0 bg-slate-950 z-20 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0.5, height: "15rem" }} // Was width
          whileInView={{ opacity: 1, height: "30rem" }} // Was width
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          // Light beam pointing downwards and right
          className="absolute inset-auto top-1/2 transform -translate-y-1/2 w-56 h-[30rem] bg-gradient-conic from-transparent via-transparent to-orange-500 text-white [--conic-position:from_45deg_at_center_left]"
        >
          {/* Masks reoriented for horizontal light */}
          <div className="absolute w-40 h-[100%] top-0 right-0 bg-slate-950 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute h-40 w-[100%] bottom-0 right-0 bg-slate-950 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>

        {/* Background Glow & Blur Effects - reoriented */}
        <div className="absolute left-1/2 w-48 h-full -translate-x-12 scale-y-150 bg-slate-950 blur-2xl"></div> {/* Was top-1/2, h-48 w-full, translate-y-12, scale-x-150 */}
        <div className="absolute left-1/2 z-50 w-48 h-full bg-transparent opacity-10 backdrop-blur-md"></div> {/* Was top-1/2, h-48 w-full */}
        
        {/* Lamp "Filament" and its Glow - reoriented to be vertical on the left */}
        <div className="absolute inset-auto z-50 w-36 h-[28rem] -translate-x-1/2 rounded-full bg-orange-500 opacity-50 blur-3xl"></div> {/* Was h-36 w-[28rem] -translate-y-1/2 */}
        <motion.div
          initial={{ height: "8rem" }} // Was width
          whileInView={{ height: "16rem" }} // Was width
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-auto z-30 w-36 h-64 -translate-x-[6rem] rounded-full bg-orange-400 blur-2xl" // Was h-36 w-64 -translate-y-[6rem]
        ></motion.div>
        <motion.div
          initial={{ height: "15rem" }} // Was width
          whileInView={{ height: "30rem" }} // Was width
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-auto z-50 w-0.5 h-[30rem] -translate-x-[7rem] bg-orange-400" // Was h-0.5 w-[30rem] -translate-y-[7rem]
        ></motion.div>

        {/* "Shade" or Occluder - reoriented */}
        <div className="absolute inset-auto z-40 w-44 h-full -translate-x-[12.5rem] bg-slate-950 "></div> {/* Was h-44 w-full -translate-y-[12.5rem] */}
      </div>

      {/* Content Area - adjust positioning if lamp takes space on left */}
      {/* If lamp is truly on the left, content might need margin-left or be in a separate column */}
      <div className="relative z-50 flex -translate-y-80 flex-col items-center px-5"> {/* Kept original content translation for now */}
        {children}
      </div>
    </div>
  );
};
