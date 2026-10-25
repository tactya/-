import { AppManager } from "./AppLibrary";
import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  Smartphone,
  LayoutGrid,
  GitBranch,
  FolderOpen,
  Settings2,
  Undo2,
  Redo2,
  Play,
  Download,
  Plus,
  ChevronDown,
  ArrowUpRight,
  Check,
  BookOpen,
  Upload,
  FileJson,
  Package,
  Globe,
  Copy,
  Trash2,
  ChevronRight,
  PanelRightClose,
  ShieldCheck,
  Info,
} from "lucide-react";
import { useStudio } from "./store";
import { Phone } from "./Phone";
import { getApp } from "./registry";
import {
  makeItem,
  initialRuntime,
  type Work,
  type Item,
  type Runtime,
} from "./schema";
import { ItemEditor, PhoneSettings, BatchImport, Modal } from "./Editors";
import { jsonExport, backup, staticExport, importWork, mediaData } from "./io";
import { dispatch } from "./engine";
import "./styles.css";
const StoryEditor = lazy(() =>
  import("./StoryEditor").then((m) => ({ default: m.StoryEditor })),
);
function Studio() {
  const store = useStudio();
  const { work, works, change } = store;
  const [view, setView] = useState("phone");
  const [app, setApp] = useState("messages");
  const [editing, setEditing] = useState<{ app: string; item: Item } | null>(
    null,
  );
  const [modal, setModal] = useState("");
  const [preview, setPreview] = useState<Work | null>(null);
  const [runtime, setRuntime] = useState<Runtime | undefined>();
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState("");
  const [busy, setBusy] = useState(false);
  const [side, setSide] = useState(true);
  const [phoneKey, setPhoneKey] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    void useStudio.getState().load();
    const handler = () => {
      void useStudio.getState().flush();
    };
    window.addEventListener("pagehide", handler);
    return () => window.removeEventListener("pagehide", handler);
  }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        void useStudio.getState().flush();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "z" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        if (e.shiftKey) useStudio.getState().redo();
        else useStudio.getState().undo();
      }
      if (e.key === "Escape") {
        setModal("");
        setEditing(null);
        setPreview(null);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
  const run = async (fn: () => Promise<unknown>, message: string) => {
    setBusy(true);
    try {
      await fn();
      setNotice(message);
    } catch (e) {
      setNotice(String(e));
    } finally {
      setBusy(false);
    }
  };
  if (!work)
    return (
      <div className="boot">
        <Smartphone size={40} />
        <h1>捡手机</h1>
        <p>{store.error || "正在打开你的故事工作室…"}</p>
      </div>
    );
  const count = Object.values(work.data).reduce(
    (n, items) => n + items.length,
    0,
  );
  const items = (work.data[app] ?? []).filter((i) =>
    (i.title + i.body).includes(search),
  );
  const startPreview = () => {
    const snapshot = structuredClone(work);
    setPreview(snapshot);
    setRuntime(dispatch(snapshot, initialRuntime(snapshot), "start"));
  };
  const edit = (app: string, item: Item) => {
    setApp(app);
    setEditing({ app, item });
  };
  const add = (app: string) =>
    edit(
      app,
      makeItem({
        title: getApp(app).engine === "messaging" ? "小林" : "新的故事片段",
        folder: getApp(app).tabs[0],
      }),
    );
  return (
    <div className="studio">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="FoundPhone 首页">
          <span className="brand-mark">
            <Smartphone size={25} />
          </span>
          <span>
            捡手机<small>FOUNDPHONE STUDIO</small>
          </span>
        </a>
        <div className="workspace-label">
          创作空间 <span>LOCAL</span>
        </div>
        <nav>
          {[
            { id: "phone", icon: Smartphone, label: "手机创作" },
            { id: "story", icon: GitBranch, label: "剧情编排" },
            { id: "assets", icon: FolderOpen, label: "素材与内容" },
            { id: "works", icon: LayoutGrid, label: "我的作品" },
          ].map((t) => (
            <button
              key={t.id}
              className={view === t.id ? "active" : ""}
              onClick={() => setView(t.id)}
            >
              <t.icon size={18} />
              {t.label}
              {view === t.id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <div className="section-label">
          <span>当前作品</span>
          <button aria-label="新建作品" onClick={() => void store.add()}>
            <Plus size={15} />
          </button>
        </div>
        <button className="current-work" onClick={() => setView("works")}>
          <div className="work-thumb">
            <span>雨</span>
          </div>
          <div>
            <strong>{work.title}</strong>
            <small>{work.category}</small>
          </div>
          <ChevronRight size={13} />
        </button>

        <div className="sidebar-bottom">
          <button onClick={() => setModal("guide")}>
            <BookOpen size={17} />
            创作指南 <ArrowUpRight size={13} />
          </button>
          <button onClick={() => setModal("about")}>
            <Info size={17} />
            关于捡手机
          </button>
          <div className="local-status">
            <span />
            本地优先 · 无需登录
          </div>
        </div>
      </aside>
      <div className="main-workspace">
        <header className="topbar">
          <div className="breadcrumb">
            创作空间 <ChevronRight size={13} />
            <button onClick={() => setModal("metadata")}>
              {work.title}
              <ChevronDown size={13} />
            </button>
            <span className="draft-badge">草稿</span>
          </div>
          <div className="topbar-actions">
            <button
              className={`save-status ${store.error ? "error" : ""}`}
              onClick={() => void store.flush()}
            >
              <span className="save-dot" />
              {store.status}
            </button>
            <span className="toolbar-divider" />
            <button
              aria-label="撤销"
              disabled={!store.past.length}
              onClick={store.undo}
            >
              <Undo2 size={17} />
            </button>
            <button
              aria-label="重做"
              disabled={!store.future.length}
              onClick={store.redo}
            >
              <Redo2 size={17} />
            </button>
            <button className="secondary compact" onClick={startPreview}>
              <Play size={14} />
              预览
            </button>
            <button
              className="primary compact"
              onClick={() => setModal("export")}
            >
              <Download size={14} />
              导出作品
            </button>
          </div>
        </header>
        {view === "story" ? (
          <Suspense fallback={<div className="boot">正在加载剧情编辑器…</div>}>
            <StoryEditor work={work} onChange={change} />
          </Suspense>
        ) : view === "works" ? (
          <div className="library-page">
            <div className="page-title">
              <div>
                <h1>
                  我的作品<span> {works.length}</span>
                </h1>
              </div>
              <button className="primary" onClick={() => void store.add()}>
                <Plus size={16} />
                新建作品
              </button>
            </div>
            <div className="works-grid">
              {works.map((w) => (
                <article className="work-card" key={w.id}>
                  <button
                    className={`work-cover wallpaper-${w.phone.wallpaper}`}
                    onClick={() => {
                      store.select(w.id);
                      setPhoneKey((k) => k + 1);
                      setView("phone");
                    }}
                  >
                    {w.cover ? (
                      <img src={w.cover} alt={w.title} />
                    ) : (
                      <>
                        <small>FOUND PHONE STORY</small>
                        <h2>{w.title}</h2>
                        <span>{w.phone.owner} 的手机</span>
                      </>
                    )}
                  </button>
                  <div className="work-card-meta">
                    <h3>{w.title}</h3>
                    <p>
                      {w.category} ·{" "}
                      {new Date(w.updatedAt).toLocaleDateString("zh-CN")}
                    </p>
                    <div>
                      <button
                        onClick={() => {
                          store.select(w.id);
                          setModal("metadata");
                        }}
                      >
                        编辑信息
                      </button>
                      <button
                        aria-label={`复制${w.title}`}
                        onClick={() =>
                          void store.add({ ...w, title: `${w.title} 副本` })
                        }
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        aria-label={`删除${w.title}`}
                        className="danger"
                        onClick={() => setConfirmDelete(w.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              <button
                className="import-work-card"
                onClick={() => input.current?.click()}
              >
                <Upload size={26} />
                <strong>导入作品</strong>
                <span>JSON 或 ZIP 作品包</span>
              </button>
            </div>
            <p className="storage-note">
              清理浏览器数据会删除本地草稿，更换设备不会自动同步。请定期导出 ZIP
              备份。
            </p>
          </div>
        ) : view === "assets" ? (
          <div className="library-page">
            <div className="page-title">
              <div>
                <h1>素材与内容</h1>
              </div>
              <button className="primary" onClick={() => add(app)}>
                <Plus size={16} />
                添加内容
              </button>
            </div>
            <div className="asset-toolbar">
              <select
                aria-label="选择内容 App"
                value={app}
                onChange={(e) => setApp(e.target.value)}
              >
                {work.apps.map((a) => (
                  <option value={a.id} key={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <input
                placeholder="搜索故事内容"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="secondary" onClick={() => setModal("batch")}>
                批量导入聊天
              </button>
            </div>
            <div className="content-table">
              <div className="table-header">
                <span>标题 / 会话</span>
                <span>内容</span>
                <span>时间</span>
                <span>操作</span>
              </div>
              {items.map((i) => (
                <div key={i.id}>
                  <button onClick={() => edit(app, i)}>
                    <strong>{i.title}</strong>
                    {i.hidden && <small>隐藏</small>}
                  </button>
                  <p>{i.body.slice(0, 85)}</p>
                  <small>{i.time}</small>
                  <button
                    aria-label={`编辑${i.title}`}
                    onClick={() => edit(app, i)}
                  >
                    编辑 <ArrowUpRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`creator-layout ${side ? "" : "no-inspector"}`}>
            <section className="phone-stage">
              <div className="stage-heading">
                <div>
                  <h1>手机创作</h1>
                </div>
                <button
                  className="secondary"
                  aria-label="打开 App 库"
                  onClick={() => setModal("apps")}
                >
                  <LayoutGrid size={15} />
                  App 库
                </button>
                <button
                  className="stage-settings"
                  aria-label="手机设置"
                  onClick={() => setModal("settings")}
                >
                  <Settings2 size={19} />
                </button>
              </div>
              <div className="phone-presentation">
                <Phone
                  key={`${work.id}-${phoneKey}`}
                  work={work}
                  creator
                  onEdit={edit}
                  onAdd={add}
                  onSettings={() => setModal("settings")}
                  onOpen={setApp}
                />
              </div>
              <div className="stage-footer">
                <span className="mode-pill">
                  <span />
                  创作模式
                </span>
                <button onClick={startPreview}>
                  切换玩家视角 <ArrowUpRight size={13} />
                </button>
                <button
                  aria-label="显示属性面板"
                  onClick={() => setSide(!side)}
                >
                  <PanelRightClose size={16} />
                </button>
              </div>
            </section>
            {side && (
              <aside className="inspector">
                <div className="inspector-section">
                  <div className="section-label">
                    <strong>作品概览</strong>
                    <button onClick={() => setModal("metadata")}>
                      编辑 <ArrowUpRight size={12} />
                    </button>
                  </div>
                  <div className="overview-grid">
                    <div>
                      <strong>
                        {work.apps.filter((a) => a.installed).length}
                      </strong>
                      <span>已安装 App</span>
                    </div>
                    <div>
                      <strong>{count}</strong>
                      <span>内容片段</span>
                    </div>
                    <div>
                      <strong>{work.nodes.length}</strong>
                      <span>剧情节点</span>
                    </div>
                  </div>
                  <div className="story-mode">
                    <span>故事模式</span>
                    <select
                      value={work.mode}
                      onChange={(e) =>
                        change((w) => {
                          w.mode = e.target.value as Work["mode"];
                        })
                      }
                    >
                      <option value="mixed">混合模式</option>
                      <option value="explore">自由探索</option>
                      <option value="story">互动剧情</option>
                    </select>
                  </div>
                </div>
                <div className="inspector-section">
                  <div className="section-label">
                    <strong>手机个性化</strong>
                    <Settings2 size={14} />
                  </div>
                  <button
                    className="inspector-row"
                    onClick={() => setModal("settings")}
                  >
                    <span className="round-icon">
                      <Smartphone size={16} />
                    </span>
                    <span>
                      机主与锁屏<small>{work.phone.owner} 的 iPhone</small>
                    </span>
                    <ChevronRight size={15} />
                  </button>
                  <button
                    className="inspector-row"
                    onClick={() => setModal("settings")}
                  >
                    <span
                      className={`wallpaper-swatch wallpaper-${work.phone.wallpaper}`}
                    />
                    <span>
                      壁纸与外观
                      <small>
                        柔雾 · {work.phone.theme === "light" ? "浅色" : "深色"}
                        模式
                      </small>
                    </span>
                    <ChevronRight size={15} />
                  </button>
                  <button
                    className="inspector-row"
                    onClick={() => setModal("apps")}
                  >
                    <span className="round-icon">
                      <LayoutGrid size={16} />
                    </span>
                    <span>App 库</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
                <div className="inspector-section">
                  <div className="section-label">
                    <strong>正在编辑 · {getApp(app).name}</strong>
                    <button
                      aria-label="添加当前 App 内容"
                      onClick={() => add(app)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="app-content-list">
                    {(work.data[app] ?? []).slice(0, 4).map((i) => (
                      <button key={i.id} onClick={() => edit(app, i)}>
                        <span className="content-line-mark" />
                        <span>
                          <strong>{i.title}</strong>
                          <small>{i.body.slice(0, 25)}</small>
                        </span>
                        <ChevronRight size={13} />
                      </button>
                    ))}
                  </div>
                  <button
                    className="dashed-button"
                    onClick={() => setModal("batch")}
                  >
                    <Upload size={14} />
                    批量导入聊天记录
                  </button>
                  <button
                    className="text-button all-content"
                    onClick={() => setView("assets")}
                  >
                    管理全部内容 <ArrowUpRight size={12} />
                  </button>
                </div>

                <div className="inspector-bottom">
                  <ShieldCheck size={14} />
                  <span>仅保存在你的浏览器中</span>
                </div>
              </aside>
            )}
          </div>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept=".json,.zip"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file)
            void run(async () => {
              const imported = await importWork(file);
              await store.add(imported);
              setPhoneKey((k) => k + 1);
            }, "作品已导入");
          e.target.value = "";
        }}
      />
      {editing && (
        <ItemEditor
          key={editing.item.id}
          app={editing.app}
          item={editing.item}
          onClose={() => setEditing(null)}
          onSave={(item) => {
            change((w) => {
              const list = w.data[editing.app] ?? [];
              w.data[editing.app] = list.some((i) => i.id === item.id)
                ? list.map((i) => (i.id === item.id ? item : i))
                : [...list, item];
            });
            setEditing(null);
          }}
          onDelete={() => {
            if (confirm("删除这条内容？可使用撤销恢复。")) {
              change((w) => {
                w.data[editing.app] = (w.data[editing.app] ?? []).filter(
                  (i) => i.id !== editing.item.id,
                );
              });
              setEditing(null);
            }
          }}
        />
      )}
      {modal === "settings" && (
        <PhoneSettings
          work={work}
          onChange={change}
          onClose={() => setModal("")}
        />
      )}
      {modal === "apps" && (
        <AppManager
          work={work}
          onChange={change}
          onClose={() => setModal("")}
        />
      )}
      {modal === "batch" && (
        <BatchImport
          onClose={() => setModal("")}
          onImport={(items) => {
            change((w) => {
              w.data[app] = [...(w.data[app] ?? []), ...items];
            });
            setModal("");
            setNotice(`已向 ${getApp(app).name} 导入 ${items.length} 条消息`);
          }}
        />
      )}
      {modal === "export" && (
        <Modal title="导出作品" onClose={() => setModal("")}>
          <p className="modal-intro">选择导出格式。</p>
          <div className="export-options">
            <button
              disabled={busy}
              onClick={() => {
                jsonExport(work);
                setNotice("JSON 已导出");
              }}
            >
              <FileJson />
              <span>
                <strong>作品 JSON</strong>
                <small>完整数据与内嵌素材，可再次导入编辑。</small>
              </span>
              <Download size={16} />
            </button>
            <button
              disabled={busy}
              onClick={() => void run(() => backup(work), "ZIP 备份已导出")}
            >
              <Package />
              <span>
                <strong>完整 ZIP 备份</strong>
                <small>保存作品与素材，适合长期备份和迁移。</small>
              </span>
              <Download size={16} />
            </button>
            <button
              disabled={busy}
              onClick={() =>
                void run(() => staticExport(work), "独立玩家网页已导出")
              }
            >
              <Globe />
              <span>
                <strong>独立玩家网页</strong>
                <small>静态运行器 + 作品，无创作后台。需生产构建。</small>
              </span>
              <Download size={16} />
            </button>
          </div>
          <p className="storage-note">
            当前作品约{" "}
            {(new Blob([JSON.stringify(work)]).size / 1024).toFixed(1)}{" "}
            KB。素材版权由作者自行确认。部署说明见 docs/DEPLOYMENT.md。
          </p>
          <footer>
            <button
              className="text-button"
              onClick={() => input.current?.click()}
            >
              <Upload size={15} />
              导入作品
            </button>
            <span>{busy ? "正在打包…" : "所有导出均在本地完成"}</span>
          </footer>
        </Modal>
      )}
      {modal === "metadata" && (
        <Metadata
          work={work}
          onClose={() => setModal("")}
          onSave={(patch) => {
            change((w) => Object.assign(w, patch));
            setModal("");
          }}
        />
      )}
      {(modal === "guide" || modal === "about") && (
        <Modal
          title={modal === "guide" ? "创作指南" : "捡手机 FoundPhone Studio"}
          onClose={() => setModal("")}
        >
          <div className="guide-content">
            {modal === "guide" ? (
              <ol>
                <li>打开手机中的 App，点击内容编辑；右上角 ＋ 新建。</li>
                <li>在“素材与内容”管理会话、帖子和记录，批量导入聊天。</li>
                <li>
                  使用“剧情编排”连接事件与动作，用内容 ID
                  解锁照片、设置选项与结局。
                </li>
                <li>点“预览”以玩家身份探索。预览不会修改作者草稿。</li>
                <li>导出 JSON / ZIP 备份，或构建后导出独立玩家静态网页。</li>
              </ol>
            ) : (
              <>
                <p>免费、开源、本地优先的虚拟手机故事创作工具。</p>
                <p>
                  当前版本 0.2.0：47 个 App
                  注册入口，共用六类内容引擎。品牌专属完整交互、真实延时调度与完整移动端验收仍在开发。
                </p>
                <p>
                  所有品牌名称仅用于非官方模拟参考。默认图标来自
                  Lucide；内置画面与人物为原创虚构内容。
                </p>
              </>
            )}
            <p className="storage-note">
              清理浏览器数据可能丢失草稿。设备间不会同步，请定期导出 ZIP
              备份。源码采用 MIT，用户作品不自动采用 MIT。
            </p>
          </div>
        </Modal>
      )}
      {preview && (
        <div className="preview-overlay">
          <header>
            <div>
              <h3>{preview.title}</h3>
            </div>
            <span>
              {runtime?.clues.length ?? 0} 条线索 ·{" "}
              {runtime?.endings.length ?? 0} 个结局
            </span>
            <button className="secondary" onClick={() => setPreview(null)}>
              退出预览
            </button>
          </header>
          <Phone
            key={preview.id + preview.updatedAt}
            work={preview}
            runtime={runtime}
            onRuntime={setRuntime}
          />
          <div className="debug-trace">
            <span>剧情调试</span>
            {runtime?.trace.slice(-3).map((t, i) => (
              <small key={i}>{t}</small>
            ))}
          </div>
        </div>
      )}
      {confirmDelete && (
        <Modal title="删除这部作品？" onClose={() => setConfirmDelete("")}>
          <p className="modal-intro">
            此操作会删除本机上的作品与玩家进度。请先导出备份。
          </p>
          <footer>
            <button className="secondary" onClick={() => setConfirmDelete("")}>
              取消
            </button>
            <button
              className="primary danger-bg"
              onClick={() => {
                void run(() => store.remove(confirmDelete), "作品已删除");
                setConfirmDelete("");
              }}
            >
              确认删除
            </button>
          </footer>
        </Modal>
      )}
      {notice && (
        <div className="toast" role="status">
          <Check size={17} />
          <span>{notice}</span>
          <button aria-label="关闭提示" onClick={() => setNotice("")}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
function Metadata({
  work,
  onClose,
  onSave,
}: {
  work: Work;
  onClose: () => void;
  onSave: (p: Partial<Work>) => void;
}) {
  const [title, setTitle] = useState(work.title),
    [description, setDescription] = useState(work.description),
    [category, setCategory] = useState(work.category),
    [cover, setCover] = useState(work.cover),
    [error, setError] = useState("");
  return (
    <Modal title="作品信息" onClose={onClose}>
      <div className="editor-fields">
        <label>
          作品名称
          <input
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          简介
          <textarea
            rows={4}
            maxLength={5000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          分类
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </label>
        <label>
          封面
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={async (e) => {
              if (e.target.files?.[0])
                try {
                  setCover(await mediaData(e.target.files[0]));
                } catch (err) {
                  setError(String(err));
                }
            }}
          />
        </label>
        {cover && <img className="cover-preview" alt="作品封面" src={cover} />}
        <p className="error">{error}</p>
      </div>
      <footer>
        <span>作品 ID · {work.id.slice(0, 8)}</span>
        <button
          className="primary"
          disabled={!title.trim()}
          onClick={() =>
            onSave({ title: title.trim(), description, category, cover })
          }
        >
          保存信息
        </button>
      </footer>
    </Modal>
  );
}
createRoot(document.getElementById("root")!).render(<Studio />);
