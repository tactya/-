import { useRef, useState, type ReactNode, type PointerEvent } from "react";
import {
  Search,
  Plus,
  Minus,
  ChevronLeft,
  Grip,
  Clock,
  CloudSun,
  Battery,
  Download,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { AppDock } from "../vendor/ios-web/Launcher";
import { category } from "../apps";
import type { Work } from "../schema";
import {
  homeEntries,
  packHome,
  moveHome,
  type HomeEntry,
  type DeviceLayout,
  type AppConfig,
  type Widget,
} from "./layout";
type Props = {
  work: Work;
  storeOpen?: boolean;
  closeStore?: () => void;
  layout: DeviceLayout;
  change: (fn: (l: DeviceLayout) => void) => void;
  importLayout: (v: unknown) => void;
  error: string;
  open: (id: string) => void;
  onFolder: (name: string) => void;
  search: () => void;
  icon: (app: AppConfig, small?: boolean) => ReactNode;
  time: string;
  clearApp: (id: string) => void;
};
const widgetLabels = {
  calendar: "日历",
  clock: "时钟",
  weather: "天气",
  notes: "备忘录",
  battery: "电池",
};
const widgetApp = {
  calendar: "calendar",
  clock: "clock",
  weather: "weather",
  notes: "notes",
  battery: "settings",
};
function WidgetFace({
  widget,
  work,
  time,
}: {
  widget: Widget;
  work: Work;
  time: string;
}) {
  const date = new Date((work.phone.date || "2026-10-25") + "T12:00:00Z");
  const weather = work.data.weather?.[0];
  return (
    <div className={"widget-face widget-" + widget.type}>
      {widget.type === "calendar" ? (
        <>
          <span className="widget-red">
            {new Intl.DateTimeFormat("zh-CN", {
              weekday: "long",
              timeZone: "UTC",
            }).format(date)}
          </span>
          <b className="widget-day">{date.getUTCDate()}</b>
          <small>{work.data.calendar?.[0]?.title || "今天没有日程"}</small>
        </>
      ) : widget.type === "clock" ? (
        <>
          <Clock size={31} />
          <b>{time}</b>
          <small>时钟</small>
        </>
      ) : widget.type === "weather" ? (
        <>
          <small>{weather?.title || "未添加城市"}</small>
          <b>{weather?.meta.temperature || "—"}°</b>
          <CloudSun size={27} />
          <small>{weather?.meta.condition || "暂无天气数据"}</small>
        </>
      ) : widget.type === "notes" ? (
        <>
          <strong>备忘录</strong>
          {(work.data.notes || [])
            .filter((i) => !i.hidden && !i.password)
            .slice(0, 3)
            .map((i) => (
              <small key={i.id}>{i.title}</small>
            ))}
          {!(work.data.notes || []).some((i) => !i.hidden && !i.password) && (
            <small>无备忘录</small>
          )}
        </>
      ) : (
        <>
          <Battery size={44} />
          <b>{work.phone.battery}%</b>
          <small>电池</small>
        </>
      )}
    </div>
  );
}
export function HomeLauncher(p: Props) {
  const [editing, setEditing] = useState(false),
    [sheet, setSheet] = useState(p.storeOpen ? "library" : ""),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("全部"),
    [selected, setSelected] = useState(""),
    [uninstall, setUninstall] = useState(false),
    [keep, setKeep] = useState(true),
    [page, setPage] = useState(0),
    [error, setError] = useState(""),
    [ghost, setGhost] = useState<{
      entry: HomeEntry;
      x: number;
      y: number;
    } | null>(null),
    [widgetType, setWidgetType] = useState<Widget["type"]>("calendar"),
    [size, setSize] = useState<Widget["size"]>("small");
  const root = useRef<HTMLDivElement>(null),
    pager = useRef<HTMLDivElement>(null),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    edge = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    drag = useRef<{
      entry: HomeEntry;
      x: number;
      y: number;
      started: number;
      active: boolean;
      target: string;
      hover: number;
      pointer: number;
    } | null>(null),
    suppress = useRef(false),
    swipe = useRef<{
      pointer: number;
      x: number;
      y: number;
      left: number;
      started: number;
      active: boolean;
    } | null>(null);
  const pages = packHome(homeEntries(p.layout), p.layout.positions),
    apps = p.layout.apps,
    active = apps.find((a) => a.id === selected);
  if (editing && pages.length < 20) pages.push([]);
  const beginSwipe = (e: PointerEvent<HTMLDivElement>) => {
    if (
      editing ||
      e.button !== 0 ||
      !(e.target as HTMLElement).closest(".home-pages")
    )
      return;
    const el = pager.current;
    if (!el) return;
    swipe.current = {
      pointer: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      left: el.scrollLeft,
      started: Date.now(),
      active: false,
    };
    el.setPointerCapture(e.pointerId);
  };
  const moveSwipe = (e: PointerEvent<HTMLDivElement>) => {
    const gesture = swipe.current,
      el = pager.current;
    if (!gesture || !el || gesture.pointer !== e.pointerId || editing) return;
    const dx = e.clientX - gesture.x,
      dy = e.clientY - gesture.y;
    if (!gesture.active) {
      if (Date.now() - gesture.started >= 450) return;
      if (Math.abs(dx) < 10 || Math.abs(dx) <= Math.abs(dy) * 1.2) return;
      gesture.active = true;
      clearTimeout(timer.current);
      drag.current = null;
      suppress.current = true;
      el.style.scrollSnapType = "none";
      el.style.scrollBehavior = "auto";
    }
    e.preventDefault();
    e.stopPropagation();
    const scale = el.getBoundingClientRect().width / el.clientWidth;
    el.scrollLeft = gesture.left - dx / scale;
  };
  const finishSwipe = (e: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const gesture = swipe.current,
      el = pager.current;
    if (!gesture || gesture.pointer !== e.pointerId) return;
    swipe.current = null;
    if (!gesture.active || !el) return;
    clearTimeout(timer.current);
    e.stopPropagation();
    const dx = e.clientX - gesture.x;
    const origin = Math.round(gesture.left / el.clientWidth);
    const step =
      !cancelled && Math.abs(dx) > el.getBoundingClientRect().width * 0.14
        ? dx < 0
          ? 1
          : -1
        : 0;
    const next = Math.max(0, Math.min(pages.length - 1, origin + step));
    el.style.scrollSnapType = "";
    el.style.scrollBehavior = "";
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setPage(next);
  };
  const patch = (id: string, fn: (a: AppConfig) => void) =>
    p.change((l) => {
      const a = l.apps.find((a) => a.id === id);
      if (a) fn(a);
    });

  const start = (e: PointerEvent<HTMLButtonElement>, entry: HomeEntry) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    suppress.current = false;
    drag.current = {
      entry,
      x: e.clientX,
      y: e.clientY,
      started: Date.now(),
      active: false,
      target: "",
      hover: 0,
      pointer: e.pointerId,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    timer.current = setTimeout(() => {
      setEditing(true);
      suppress.current = true;
    }, 500);
  };
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const d = drag.current;
    if (!d) return;
    const distance = Math.hypot(e.clientX - d.x, e.clientY - d.y);
    if (distance > 7 && (editing || Date.now() - d.started > 450)) {
      d.active = true;
      suppress.current = true;
      clearTimeout(timer.current);
      setEditing(true);
      const r = root.current!.getBoundingClientRect(),
        scale = r.width / 393;
      setGhost({
        entry: d.entry,
        x: (e.clientX - r.left) / scale,
        y: (e.clientY - r.top) / scale,
      });
      const hit = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest<HTMLElement>("[data-home-key],[data-drop-zone]");
      let target = hit?.dataset.homeKey || hit?.dataset.dropZone || "";
      if (target.startsWith("page:") && hit) {
        const box = hit.getBoundingClientRect();
        const x = Math.max(
            0,
            Math.min(
              3,
              Math.floor(
                (e.clientX - box.left - 16 * scale) / ((361 / 4) * scale),
              ),
            ),
          ),
          y = Math.max(
            0,
            Math.min(5, Math.floor((e.clientY - box.top) / (99 * scale))),
          );
        target = `cell:${target.slice(5)}:${x}:${y}`;
      }
      if (target !== d.target) {
        d.target = target;
        d.hover = Date.now();
      }
      const near =
        e.clientX < r.left + 22 ? -1 : e.clientX > r.right - 22 ? 1 : 0;
      if (near && !edge.current)
        edge.current = setTimeout(() => {
          const next = Math.max(0, Math.min(pages.length - 1, page + near));
          pager.current?.scrollTo({
            left: next * pager.current.clientWidth,
            behavior: "smooth",
          });
          setPage(next);
          if (drag.current) {
            drag.current.target = "";
            drag.current.hover = Date.now();
          }
          edge.current = undefined;
        }, 550);
      if (!near) {
        clearTimeout(edge.current);
        edge.current = undefined;
      }
    } else if (distance > 10) clearTimeout(timer.current);
  };
  const end = (e: PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    clearTimeout(timer.current);
    clearTimeout(edge.current);
    edge.current = undefined;
    const d = drag.current;
    drag.current = null;
    setGhost(null);
    if (!d?.active) return;
    const target = d.target;
    if (!target || target === d.entry.key) return;
    if (
      (target === "dock" || target.startsWith("dock:")) &&
      !apps.find((a) => a.id === d.entry.key)?.dock &&
      apps.filter((a) => a.dock && a.visible && a.installed).length >= 4
    ) {
      setError("Dock最多放4个App");
      return;
    }
    p.change((l) => {
      const a = l.apps.find((a) => a.id === d.entry.key);
      if (target.startsWith("cell:")) {
        const [, pg, cx, cy] = target.split(":").map(Number);
        const w = d.entry.widget
            ? d.entry.widget.size === "small"
              ? 2
              : 4
            : 1,
          h = d.entry.widget ? (d.entry.widget.size === "large" ? 4 : 2) : 1;
        if (pg > 19 || cx + w > 4 || cy + h > 6) return;
        const other =
          packHome(
            homeEntries(l).filter((e) => e.key !== d.entry.key),
            l.positions,
          )[pg] || [];
        if (
          other.some(
            (e) =>
              cx < e.x + e.w && cx + w > e.x && cy < e.y + e.h && cy + h > e.y,
          )
        )
          return;
        if (a) {
          a.dock = false;
          a.folder = "";
        }
        l.positions[d.entry.key] = { page: pg, x: cx, y: cy };
        return;
      }
      if (target === "dock" || target.startsWith("dock:")) {
        if (!a) return;
        const count = l.apps.filter(
          (x) => x.dock && x.visible && x.installed,
        ).length;
        if (!a.dock && count >= 4) {
          return;
        }
        delete l.positions[d.entry.key];
        a.dock = true;
        a.folder = "";
        a.visible = true;
        if (target.startsWith("dock:")) {
          const from = l.apps.findIndex((x) => x.id === a.id),
            to = l.apps.findIndex((x) => x.id === target.slice(5));
          if (from >= 0 && to >= 0 && from !== to) {
            const [moved] = l.apps.splice(from, 1);
            l.apps.splice(to, 0, moved);
          }
        }
        return;
      }
      if (a) {
        a.dock = false;
        a.folder = "";
      }
      if (target.startsWith("folder:") && a) {
        a.folder = target.slice(7);
        delete l.positions[a.id];
        return;
      }
      const other = l.apps.find((x) => x.id === target);
      if (a && other && Date.now() - d.hover > 650) {
        const folder = "文件夹";
        a.folder = folder;
        other.folder = folder;
        other.dock = false;
        delete l.positions[a.id];
        delete l.positions[other.id];
        return;
      }
      delete l.positions[d.entry.key];
      delete l.positions[target];
      moveHome(l, d.entry.key, target);
    });
  };
  const click = (entry: HomeEntry) => {
    if (suppress.current) {
      suppress.current = false;
      return;
    }
    if (editing) {
      if (entry.app) {
        setSelected(entry.app.id);
        setSheet("actions");
      } else if (entry.widget) {
        setSelected(entry.widget.id);
        setSheet("widget-actions");
      } else p.onFolder(entry.folder!);
      return;
    }
    if (entry.app?.id === "appstore" && p.storeOpen) {
      setSheet("library");
      return;
    }
    if (entry.app) p.open(entry.app.id);
    else if (entry.folder) p.onFolder(entry.folder);
    else if (entry.widget) p.open(widgetApp[entry.widget.type]);
  };
  const cell = (entry: HomeEntry, dock = false) => (
    <button
      key={entry.key}
      className={"launcher-cell " + (entry.widget ? "launcher-widget" : "")}
      data-home-key={dock ? "dock:" + entry.key : entry.key}
      data-app-id={entry.app?.id}
      aria-label={
        entry.app
          ? "打开" + entry.app.name
          : entry.folder
            ? "打开文件夹" + entry.folder
            : widgetLabels[entry.widget!.type] + "小组件"
      }
      onPointerDown={(e) => start(e, entry)}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={() => {
        clearTimeout(timer.current);
        drag.current = null;
        setGhost(null);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setEditing(true);
        if (entry.app) {
          setSelected(entry.app.id);
          setSheet("actions");
        }
      }}
      onClick={() => click(entry)}
    >
      {entry.app ? (
        p.icon({ ...entry.app, ...(dock ? { name: "" } : {}) })
      ) : entry.widget ? (
        <WidgetFace widget={entry.widget} work={p.work} time={p.time} />
      ) : (
        <span className="app-icon-wrap">
          <span className="folder-icon">
            {apps
              .filter((a) => a.installed && a.folder === entry.folder)
              .slice(0, 9)
              .map((a) => p.icon(a, true))}
          </span>
          <span className="app-name">{entry.folder}</span>
        </span>
      )}
      {editing && (
        <span className="launcher-remove">
          <Minus size={12} />
        </span>
      )}
    </button>
  );
  const addWidget = () => {
    if (p.layout.widgets.length >= 24) {
      setError("最多添加24个小组件");
      return;
    }
    p.change((l) => {
      const widget = {
        id: "widget-" + crypto.randomUUID(),
        type: widgetType,
        size,
      };
      l.widgets.push(widget);
      l.order = [
        widget.id,
        ...homeEntries(l)
          .map((e) => e.key)
          .filter((k) => k !== widget.id),
      ];
      const app = l.apps.find((a) => a.id === widgetApp[widgetType]);
      if (app) {
        app.installed = true;
        app.visible = true;
      }
    });
    setSheet("");
    setEditing(true);
  };
  const download = () => {
    const blob = new Blob([JSON.stringify(p.layout, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "phone-layout.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <motion.div
      ref={root}
      className={
        "home-screen interactive-home " + (editing ? "home-editing" : "")
      }
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onPointerDownCapture={beginSwipe}
      onPointerMoveCapture={moveSwipe}
      onPointerUpCapture={(e) => finishSwipe(e)}
      onPointerCancelCapture={(e) => finishSwipe(e, true)}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("button,input,select,label"))
          return;
        timer.current = setTimeout(() => setEditing(true), 600);
      }}
      onPointerUp={() => clearTimeout(timer.current)}
      onPointerMove={(e) => {
        if (Math.abs(e.movementX) + Math.abs(e.movementY) > 8)
          clearTimeout(timer.current);
      }}
    >
      <div className="launcher-toolbar">
        {editing ? (
          <>
            <button aria-label="添加小组件" onClick={() => setSheet("widgets")}>
              <Plus size={18} />
              小组件
            </button>
            <button onClick={() => setSheet("layout")}>布局</button>
            <button onClick={() => setEditing(false)}>完成</button>
          </>
        ) : null}
      </div>
      <div
        className="home-pages"
        ref={pager}
        onScroll={(e) =>
          setPage(
            Math.round(
              e.currentTarget.scrollLeft / e.currentTarget.clientWidth,
            ),
          )
        }
      >
        {pages.map((cells, n) => (
          <div
            className="home-app-grid"
            data-drop-zone={"page:" + n}
            role="group"
            aria-label={"桌面第" + (n + 1) + "页"}
            key={n}
          >
            {cells.map(({ entry, x, y, w, h }) => (
              <div
                className="launcher-slot"
                key={entry.key}
                style={{
                  gridColumn: `${x + 1} / span ${w}`,
                  gridRow: `${y + 1} / span ${h}`,
                }}
              >
                {cell(entry)}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="launcher-bottom-tools">
        {pages.length > 1 && (
          <div className="home-page-dots">
            {pages.map((_, i) => (
              <button
                key={i}
                aria-label={"前往桌面第" + (i + 1) + "页"}
                aria-current={page === i ? "page" : undefined}
                onClick={() =>
                  pager.current?.scrollTo({
                    left: i * pager.current.clientWidth,
                    behavior: "smooth",
                  })
                }
              />
            ))}
          </div>
        )}
        <button className="home-search" onClick={p.search}>
          <Search size={12} />
          搜索
        </button>
      </div>
      <div data-drop-zone="dock">
        <AppDock>
          {apps
            .filter((a) => a.installed && a.visible && a.dock)
            .map((a) => cell({ key: a.id, kind: "app", app: a }, true))}
        </AppDock>
      </div>
      {ghost && (
        <div className="launcher-ghost" style={{ left: ghost.x, top: ghost.y }}>
          {ghost.entry.app ? p.icon(ghost.entry.app) : <Grip size={45} />}
        </div>
      )}
      {(error || p.error) && (
        <button className="launcher-toast" onClick={() => setError("")}>
          {error || p.error}
        </button>
      )}
      {sheet && (
        <div
          className={"launcher-sheet " + (p.storeOpen ? "storefront" : "")}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
        >
          <header>
            <button
              onClick={() => {
                if (p.storeOpen) p.closeStore?.();
                setSheet("");
                setSelected("");
                setUninstall(false);
              }}
              aria-label="关闭App管理"
            >
              <ChevronLeft />
              桌面
            </button>
            <strong>
              {sheet === "library"
                ? "App Store"
                : sheet === "widgets"
                  ? "小组件"
                  : sheet === "layout"
                    ? "保存布局"
                    : active?.name || "小组件"}
            </strong>
          </header>
          <div className="launcher-sheet-scroll">
            {sheet === "library" ? (
              <>
                <div className="storefront-title">
                  <h1>搜索</h1>
                  <span>App Store</span>
                </div>
                <label className="launcher-search">
                  <Search size={18} />
                  <input
                    placeholder="搜索全部App"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <nav className="library-filters">
                  {[
                    "全部",
                    "系统",
                    "通讯",
                    "社交",
                    "影音",
                    "生活",
                    "工具",
                    "已安装",
                  ].map((label) => (
                    <button
                      key={label}
                      aria-pressed={filter === label}
                      onClick={() => setFilter(label)}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
                <p className="library-count">
                  已安装{apps.filter((a) => a.installed).length} / 全部
                  {apps.length}个App
                </p>
                {apps
                  .filter(
                    (a) =>
                      (a.name + a.id)
                        .toLowerCase()
                        .includes(query.toLowerCase()) &&
                      (filter === "全部" ||
                        (filter === "已安装" && a.installed) ||
                        category(a.id) === filter),
                  )
                  .map((a) => (
                    <div className="runtime-library-row" key={a.id}>
                      {p.icon({ ...a, name: "" })}
                      <button
                        className="library-app-title"
                        onClick={() => {
                          setSelected(a.id);
                          setSheet("actions");
                        }}
                      >
                        <strong>{a.name}</strong>
                        <small>
                          {category(a.id)} ·{" "}
                          {a.installed
                            ? a.visible
                              ? "已在桌面"
                              : "仅App库"
                            : "未安装"}
                        </small>
                      </button>
                      <button
                        className="library-get"
                        onClick={() => {
                          if (a.id === "appstore") {
                            setSheet("library");
                            return;
                          }
                          if (a.installed && a.visible) {
                            setSheet("");
                            p.open(a.id);
                          } else
                            patch(a.id, (x) => {
                              x.installed = true;
                              x.visible = true;
                              x.folder = "";
                              x.dock = false;
                            });
                        }}
                      >
                        {a.installed
                          ? a.visible
                            ? "打开"
                            : "添加到桌面"
                          : "获取"}
                      </button>
                    </div>
                  ))}
              </>
            ) : sheet === "widgets" ? (
              <>
                <div className="widget-types">
                  {Object.entries(widgetLabels).map(([id, label]) => (
                    <button
                      key={id}
                      aria-pressed={widgetType === id}
                      onClick={() => setWidgetType(id as Widget["type"])}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className={"widget-preview widget-preview-" + size}>
                  <WidgetFace
                    widget={{ id: "preview", type: widgetType, size }}
                    work={p.work}
                    time={p.time}
                  />
                </div>
                <div className="widget-types">
                  {(["small", "medium", "large"] as const).map((s, i) => (
                    <button
                      key={s}
                      aria-pressed={size === s}
                      onClick={() => setSize(s)}
                    >
                      {["小", "中", "大"][i]}
                    </button>
                  ))}
                </div>
                <button className="launcher-primary" onClick={addWidget}>
                  添加{widgetLabels[widgetType]}小组件
                </button>
              </>
            ) : sheet === "layout" ? (
              <>
                <p>布局、安装状态和小组件自动保存在本浏览器。</p>
                <button className="launcher-action" onClick={download}>
                  <Download />
                  导出布局JSON
                </button>
                <label className="launcher-action">
                  <Upload />
                  导入布局JSON
                  <input
                    aria-label="导入桌面布局"
                    type="file"
                    accept=".json"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        if (f.size > 4 * 1024 * 1024)
                          throw Error("布局文件过大");
                        p.importLayout(JSON.parse(await f.text()));
                        setSheet("");
                      } catch (err) {
                        setError(String(err));
                      }
                    }}
                  />
                </label>
                <p>不改写作者故事，不清除玩家剧情存档。</p>
              </>
            ) : sheet === "widget-actions" ? (
              <>
                <div className="widget-types">
                  {(["small", "medium", "large"] as const).map((size, n) => (
                    <button
                      key={size}
                      aria-pressed={
                        p.layout.widgets.find((w) => w.id === selected)
                          ?.size === size
                      }
                      onClick={() =>
                        p.change((l) => {
                          const w = l.widgets.find((w) => w.id === selected);
                          if (w) {
                            w.size = size;
                            delete l.positions[selected];
                          }
                        })
                      }
                    >
                      {["小", "中", "大"][n]}
                    </button>
                  ))}
                </div>
                <button
                  className="launcher-action danger"
                  onClick={() => {
                    p.change((l) => {
                      l.widgets = l.widgets.filter((w) => w.id !== selected);
                      delete l.positions[selected];
                      l.order = l.order.filter((id) => id !== selected);
                    });
                    setSheet("");
                  }}
                >
                  移除小组件
                </button>
              </>
            ) : active ? (
              <>
                {!uninstall ? (
                  <>
                    <label className="launcher-field">
                      App名称
                      <input
                        aria-label="App名称"
                        maxLength={100}
                        value={active.name}
                        onChange={(e) =>
                          patch(active.id, (a) => {
                            a.name = e.target.value;
                          })
                        }
                      />
                    </label>
                    <label className="launcher-field">
                      文件夹
                      <input
                        aria-label="文件夹名称"
                        maxLength={80}
                        placeholder="留空移出文件夹"
                        value={active.folder}
                        onChange={(e) =>
                          patch(active.id, (a) => {
                            a.folder = e.target.value;
                            a.dock = false;
                          })
                        }
                      />
                    </label>
                    <label className="launcher-field">
                      自定义图标文字
                      <input
                        aria-label="自定义图标文字"
                        maxLength={2}
                        value={active.icon.length < 3 ? active.icon : ""}
                        onChange={(e) =>
                          patch(active.id, (a) => {
                            a.icon = e.target.value;
                          })
                        }
                      />
                    </label>
                    <label className="launcher-action">
                      上传图标
                      <input
                        aria-label="上传App图标"
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            if (
                              file.size > 2 * 1024 * 1024 ||
                              !/^image\/(png|jpeg|webp|gif)$/.test(file.type)
                            )
                              throw Error("请选择2MB以内的图片");
                            const url = URL.createObjectURL(file);
                            try {
                              const image = new Image();
                              image.src = url;
                              await image.decode();
                              const canvas = document.createElement("canvas");
                              canvas.width = 128;
                              canvas.height = 128;
                              const context = canvas.getContext("2d")!;
                              const side = Math.min(
                                image.naturalWidth,
                                image.naturalHeight,
                              );
                              context.drawImage(
                                image,
                                (image.naturalWidth - side) / 2,
                                (image.naturalHeight - side) / 2,
                                side,
                                side,
                                0,
                                0,
                                128,
                                128,
                              );
                              const data = canvas.toDataURL("image/png");
                              patch(active.id, (a) => {
                                a.icon = data;
                              });
                            } finally {
                              URL.revokeObjectURL(url);
                            }
                          } catch (err) {
                            setError(String(err));
                          }
                        }}
                      />
                    </label>
                    <button
                      className="launcher-action"
                      onClick={() => {
                        if (
                          !active.dock &&
                          apps.filter((a) => a.installed && a.visible && a.dock)
                            .length >= 4
                        ) {
                          setError("Dock最多放4个App");
                          return;
                        }
                        patch(active.id, (a) => {
                          a.installed = true;
                          a.visible = true;
                          a.dock = !a.dock;
                          a.folder = "";
                        });
                        setSheet("");
                      }}
                    >
                      {active.dock ? "移出Dock" : "放入Dock"}
                    </button>
                    <button
                      className="launcher-action"
                      onClick={() => {
                        patch(active.id, (a) => {
                          if (a.id === "appstore") return;
                          a.visible = false;
                        });
                        setSheet("");
                      }}
                    >
                      从桌面移除
                    </button>
                    <button
                      className="launcher-action danger"
                      disabled={active.id === "appstore"}
                      onClick={() => {
                        setUninstall(true);
                        setKeep(true);
                      }}
                    >
                      卸载App
                    </button>
                  </>
                ) : (
                  <div role="dialog" aria-label="确认卸载App">
                    <h2>卸载{active.name}？</h2>
                    <label className="launcher-checkbox">
                      <input
                        type="checkbox"
                        checked={keep}
                        onChange={(e) => setKeep(e.target.checked)}
                      />
                      保留此App的本机内容
                    </label>
                    <p>取消勾选会移除本机内容，原始故事脚本不受影响。</p>
                    <button
                      className="launcher-primary danger"
                      onClick={() => {
                        p.change((l) => {
                          const a = l.apps.find((a) => a.id === active.id)!;
                          a.installed = false;
                          a.visible = false;
                          a.dock = false;
                          if (!keep && !l.cleared.includes(a.id))
                            l.cleared.push(a.id);
                        });
                        if (!keep) p.clearApp(active.id);
                        setUninstall(false);
                        setSheet("");
                      }}
                    >
                      确认卸载
                    </button>
                    <button
                      className="launcher-action"
                      onClick={() => setUninstall(false)}
                    >
                      取消
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </motion.div>
  );
}
