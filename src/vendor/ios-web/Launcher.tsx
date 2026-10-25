import { motion, useIsPresent } from "motion/react";
import { DEVICE_WIDTH, DEVICE_HEIGHT } from "../../deviceMetrics";
/* Adapted from lukejacksonn/homescreen (README: MIT),
 * commit 98a812f4f7c33594e791d65092f73b8f54b3c598,
 * components/Launcher.tsx and apps/home/components/AppDock.tsx.
 * See licenses/ios-web/homescreen-NOTICE.txt.
 * Preact portals/Twind replaced by the existing React/Motion runtime.
 */
import type { ReactNode } from "react";
export type LauncherOrigin = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export const screenOrigin: LauncherOrigin = {
  x: 0,
  y: 0,
  width: DEVICE_WIDTH,
  height: DEVICE_HEIGHT,
};
export function readLauncherOrigin(
  launcher: HTMLElement,
  screen: HTMLElement,
): LauncherOrigin {
  const icon = launcher.querySelector<HTMLElement>(".app-icon") ?? launcher;
  const a = icon.getBoundingClientRect(),
    b = screen.getBoundingClientRect();
  const scale = b.width / DEVICE_WIDTH;
  return {
    x: (a.x - b.x) / scale,
    y: (a.y - b.y) / scale,
    width: a.width / scale,
    height: a.height / scale,
  };
}
export function launcherPose(origin: LauncherOrigin) {
  return {
    x: origin.x,
    y: origin.y,
    scaleX: origin.width / DEVICE_WIDTH,
    scaleY: origin.height / DEVICE_HEIGHT,
    borderRadius: 90,
    opacity: 0.3,
  };
}
export const launcherTransition = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};
export function AppDock({ children }: { children: ReactNode }) {
  return (
    <nav className="dock" aria-label="Dock">
      {children}
    </nav>
  );
}

export function AppWindow({
  origin,
  className,
  creator,
  children,
}: {
  origin: LauncherOrigin;
  className: string;
  creator: boolean;
  children: ReactNode;
}) {
  const present = useIsPresent();
  return (
    <motion.div
      className={className}
      data-authoring={creator}
      inert={!present}
      aria-hidden={!present}
      style={{
        transformOrigin: "0 0",
        pointerEvents: present ? "auto" : "none",
      }}
      initial={launcherPose(origin)}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        borderRadius: 0,
      }}
      exit={launcherPose(origin)}
      transition={launcherTransition}
    >
      {children}
    </motion.div>
  );
}
