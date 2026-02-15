"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { SHIPPING_EMOJI } from "@/lib/constants";

interface AnimatedThermometerProps {
  current: number;
  max: number;
  threshold: number;
  unit?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  showCelebration?: boolean;
}

export function AnimatedThermometer({
  current,
  max,
  threshold,
  unit = "ft³",
  label = "Container Fill",
  size = "md",
  showCelebration = true,
}: AnimatedThermometerProps) {
  const [isClient, setIsClient] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const thresholdPercentage = max > 0 ? (threshold / max) * 100 : 75;
  const isThresholdReached = percentage >= thresholdPercentage;

  const springValue = useSpring(0, { stiffness: 50, damping: 20 });
  const animatedPercentage = useTransform(springValue, (v) => Math.round(v));
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    setIsClient(true);
    springValue.set(percentage);
    const unsubscribe = animatedPercentage.on("change", (v) => setDisplayPercentage(v));
    if (isThresholdReached && showCelebration) {
      const t = setTimeout(() => setShowConfetti(true), 1500);
      return () => {
        clearTimeout(t);
        unsubscribe();
      };
    }
    return () => unsubscribe();
  }, [percentage, springValue, animatedPercentage, isThresholdReached, showCelebration]);

  const sizeClasses = {
    sm: { container: "h-32", width: "w-16", text: "text-sm" },
    md: { container: "h-48", width: "w-20", text: "text-base" },
    lg: { container: "h-64", width: "w-24", text: "text-lg" },
  };
  const classes = sizeClasses[size];

  if (!isClient) {
    return (
      <div
        className={`${classes.width} ${classes.container} bg-gray-100 rounded-full animate-pulse`}
      />
    );
  }

  return (
    <div className="relative flex flex-col items-center">
      <span className="text-sm font-medium text-gray-600 mb-3">{label}</span>
      {showConfetti && isThresholdReached && (
        <ConfettiBurst onComplete={() => setShowConfetti(false)} />
      )}
      {isThresholdReached && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 1.5 }}
          className="absolute -top-8 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
        >
          🎉 Threshold Reached!
        </motion.div>
      )}
      <div className={`relative ${classes.width} ${classes.container}`}>
        <div className="absolute inset-0 bg-gray-100 rounded-full overflow-hidden border-4 border-gray-200">
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-orange-400 z-10"
            style={{ bottom: `${thresholdPercentage}%` }}
          >
            <span className="absolute -right-16 -top-3 text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded">
              {thresholdPercentage.toFixed(0)}% Goal
            </span>
          </div>
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-b-full"
            style={{
              height: `${percentage}%`,
              background: `linear-gradient(180deg, ${
                isThresholdReached ? "#10B981" : "#3B82F6"
              } 0%, ${isThresholdReached ? "#059669" : "#1D4ED8"} 100%)`,
            }}
            initial={{ height: 0 }}
            animate={{ height: `${percentage}%` }}
            transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="absolute top-0 left-1/4 right-1/4 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </motion.div>
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg border-4 border-white" />
      </div>
      <div className="mt-6 text-center">
        <motion.div className={`${classes.text} font-bold text-gray-900`} key={displayPercentage}>
          {displayPercentage}% Full
        </motion.div>
        <div className="text-sm text-gray-500 mt-1">
          {current.toLocaleString()} / {max.toLocaleString()} {unit}
        </div>
        {!isThresholdReached && (
          <div className="mt-2 text-sm text-orange-600 font-medium">
            {Math.ceil(threshold - current).toLocaleString()} {unit} to goal
          </div>
        )}
      </div>
    </div>
  );
}

function ConfettiBurst({ onComplete }: { onComplete: () => void }) {
  const colors = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: colors[Math.floor(Math.random() * colors.length)],
    x: (Math.random() - 0.5) * 200,
    y: -Math.random() * 150 - 50,
    rotation: Math.random() * 360,
    scale: 0.5 + Math.random() * 0.5,
  }));

  useEffect(() => {
    const t = setTimeout(onComplete, 2000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-20">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-sm"
          style={{ backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: 0,
            scale: p.scale,
            rotate: p.rotation,
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function HorizontalThermometer({
  current,
  max,
  threshold,
  unit = "ft³",
  label = "Container Fill Progress",
}: AnimatedThermometerProps) {
  const [isClient, setIsClient] = useState(false);
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const thresholdPercentage = max > 0 ? (threshold / max) * 100 : 75;
  const isThresholdReached = percentage >= thresholdPercentage;

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="h-8 bg-gray-100 rounded-full animate-pulse" />;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{percentage.toFixed(0)}% Full</span>
      </div>
      <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-200">
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-orange-400 z-10"
          style={{ left: `${thresholdPercentage}%` }}
        >
          <span className="absolute -top-6 -translate-x-1/2 text-xs text-orange-600 font-medium whitespace-nowrap">
            🎯 Goal
          </span>
        </div>
        <motion.div
          className="h-full rounded-full relative"
          style={{
            background: `linear-gradient(90deg, ${
              isThresholdReached ? "#10B981" : "#3B82F6"
            } 0%, ${isThresholdReached ? "#059669" : "#1D4ED8"} 100%)`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white/30 to-transparent" />
        </motion.div>
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-2xl"
          initial={{ left: "0%" }}
          animate={{ left: `${percentage}%` }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {SHIPPING_EMOJI}
        </motion.div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>0 {unit}</span>
        <span>{max.toLocaleString()} {unit}</span>
      </div>
      <div className="flex gap-6 mt-4 text-sm">
        <div>
          <span className="text-gray-500">Pledged:</span>{" "}
          <span className="font-semibold text-gray-900">{current.toLocaleString()} {unit}</span>
        </div>
        <div>
          <span className="text-gray-500">Goal:</span>{" "}
          <span className="font-semibold text-gray-900">{threshold.toLocaleString()} {unit}</span>
        </div>
        {!isThresholdReached && (
          <div className="text-orange-600 font-medium">
            {Math.ceil(threshold - current).toLocaleString()} {unit} to go!
          </div>
        )}
      </div>
    </div>
  );
}
