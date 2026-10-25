import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { IOS_MOTION } from "./tokens";
export function useNavigation() {
  const [stack, setStack] = useState<string[]>([]);
  return {
    page: stack.at(-1) || "",
    push: (page: string) => setStack((s) => [...s, page]),
    pop: () => setStack((s) => s.slice(0, -1)),
    depth: stack.length,
  };
}
export function NavigationPage({
  page,
  back,
  title,
  children,
}: {
  page: string;
  back: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <header className="settings-native-nav">
        {page ? (
          <button onClick={back}>
            <ChevronLeft size={26} />
            {title}
          </button>
        ) : (
          <span />
        )}
        <strong>{page}</strong>
      </header>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={page}
          className="settings-native-scroll"
          initial={{ x: page ? 35 : -15, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: IOS_MOTION.duration,
            ease: [...IOS_MOTION.ease],
          }}
          onPointerDown={(e) => {
            e.currentTarget.dataset.startX = String(e.clientX);
          }}
          onPointerUp={(e) => {
            const start = Number(e.currentTarget.dataset.startX);
            if (
              page &&
              start < e.currentTarget.getBoundingClientRect().left + 30 &&
              e.clientX - start > 80
            )
              back();
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
