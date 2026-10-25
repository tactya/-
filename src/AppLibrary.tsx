import { useRef, useState } from "react";
import {
  GripVertical,
  Search,
  Plus,
  Check,
  ArrowUp,
  ArrowDown,
  FolderPlus,
  Trash2,
  Download,
  Smartphone,
} from "lucide-react";
import { Modal } from "./Editors";
import { AppIcon } from "./Phone";
import { registry, getApp } from "./registry";
import { type Work } from "./schema";
import {
  category,
  installApp,
  removeFromHome,
  uninstallApp,
  moveApp,
  newCustomApp,
} from "./apps";
import { mediaData } from "./io";
export function AppManager({
  work,
  onChange,
  onClose,
}: {
  work: Work;
  onChange: (fn: (w: Work) => void) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState(""),
    [group, setGroup] = useState("全部"),
    [status, setStatus] = useState("全部"),
    [selected, setSelected] = useState(""),
    [uninstall, setUninstall] = useState(""),
    [keep, setKeep] = useState(true),
    [folder, setFolder] = useState(""),
    [folderApps, setFolderApps] = useState<string[]>([]),
    [showFolder, setShowFolder] = useState(false),
    [customName, setCustomName] = useState(""),
    [error, setError] = useState(""),
    [dragging, setDragging] = useState("");
  const drag = useRef("");
  const catalog = [
    ...work.apps,
    ...registry
      .filter((r) => !work.apps.some((a) => a.id === r.id))
      .map((a) => ({
        id: a.id,
        name: a.name,
        installed: false,
        visible: false,
        dock: false,
        folder: "",
        icon: "",
      })),
  ];
  const filtered = catalog.filter(
    (a) =>
      (a.name + getApp(a.id).name)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (group === "全部" || category(a.id) === group) &&
      (status === "全部" || (status === "已安装" ? a.installed : !a.installed)),
  );
  const current = work.apps.find((a) => a.id === selected);
  const update = (patch: Partial<Work["apps"][number]>) =>
    onChange((w) => {
      const a = w.apps.find((a) => a.id === selected);
      if (a) Object.assign(a, patch);
    });
  const drop = (target: string) => {
    if (drag.current && target && target !== drag.current)
      onChange((w) => moveApp(w, drag.current, target));
    drag.current = "";
    setDragging("");
  };
  return (
    <>
      <Modal title="App 库" onClose={onClose} wide>
        <div className="app-library">
          <div className="library-controls">
            <label className="library-search">
              <Search size={16} />
              <input
                aria-label="搜索 App"
                placeholder="搜索 App"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <select
              aria-label="App 分类"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              {[
                "全部",
                "系统",
                "通讯",
                "社交",
                "影音",
                "生活",
                "工具",
                "自定义",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              aria-label="安装筛选"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {["全部", "已安装", "未安装"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <button
              className="secondary"
              onClick={() => setShowFolder(!showFolder)}
            >
              <FolderPlus size={15} />
              创建文件夹
            </button>
          </div>
          {showFolder && (
            <section className="folder-builder">
              <label>
                文件夹名称
                <input
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  placeholder="文件夹名称"
                />
              </label>
              <div className="folder-app-picks">
                {work.apps
                  .filter((a) => a.installed)
                  .map((a) => (
                    <label key={a.id}>
                      <input
                        type="checkbox"
                        checked={folderApps.includes(a.id)}
                        onChange={(e) =>
                          setFolderApps(
                            e.target.checked
                              ? [...folderApps, a.id]
                              : folderApps.filter((id) => id !== a.id),
                          )
                        }
                      />
                      {a.name}
                    </label>
                  ))}
              </div>
              <button
                className="primary"
                disabled={!folder.trim() || !folderApps.length}
                onClick={() => {
                  onChange((w) => {
                    for (const a of w.apps)
                      if (folderApps.includes(a.id)) {
                        a.folder = folder.trim();
                        a.visible = true;
                        a.dock = false;
                      }
                  });
                  setShowFolder(false);
                  setFolderApps([]);
                }}
              >
                保存文件夹
              </button>
            </section>
          )}
          <div className="library-layout">
            <div className="library-catalog" aria-label="App 目录">
              {filtered.map((a) => (
                <article
                  key={a.id}
                  data-app-id={a.id}
                  className={`library-app ${a.id === selected ? "selected" : ""} ${dragging === a.id ? "dragging" : ""}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    drop(a.id);
                  }}
                >
                  <div className="library-app-main">
                    <button
                      className="drag-grip"
                      aria-label={`拖动${a.name}排序`}
                      disabled={!a.installed}
                      draggable={false}
                      onDragStart={(e) => {
                        drag.current = a.id;
                        setDragging(a.id);
                        e.dataTransfer.setData("text/plain", a.id);
                      }}
                      onDragEnd={() => {
                        drag.current = "";
                        setDragging("");
                      }}
                      onPointerDown={(e) => {
                        if (!a.installed) return;
                        e.preventDefault();
                        drag.current = a.id;
                        setDragging(a.id);
                        e.currentTarget.setPointerCapture(e.pointerId);
                      }}
                      onPointerUp={(e) => {
                        const row = document
                          .elementFromPoint(e.clientX, e.clientY)
                          ?.closest<HTMLElement>("[data-app-id]");
                        drop(row?.dataset.appId ?? "");
                      }}
                      onPointerCancel={() => {
                        drag.current = "";
                        setDragging("");
                      }}
                    >
                      <GripVertical size={15} />
                    </button>
                    <button
                      className="library-app-select"
                      onClick={() => setSelected(a.id)}
                    >
                      <AppIcon id={a.id} custom={a.icon} small />
                      <span>
                        <strong>{a.name}</strong>
                        <small>
                          {category(a.id)} ·{" "}
                          {a.installed
                            ? a.visible
                              ? "已安装"
                              : "仅 App 资源库"
                            : "未安装"}
                        </small>
                      </span>
                    </button>
                    {a.installed ? (
                      <button
                        className="library-configure"
                        onClick={() => setSelected(a.id)}
                      >
                        管理
                      </button>
                    ) : (
                      <button
                        className="library-install"
                        aria-label={`安装${a.name}`}
                        onClick={() => {
                          onChange((w) => installApp(w, a.id));
                          setSelected(a.id);
                        }}
                      >
                        <Download size={14} />
                        安装
                      </button>
                    )}
                  </div>
                  {a.installed && (
                    <div className="library-app-actions">
                      <button
                        aria-label={`上移${a.name}`}
                        onClick={() => {
                          const i = work.apps.indexOf(a);
                          if (i > 0)
                            onChange((w) => moveApp(w, a.id, w.apps[i - 1].id));
                        }}
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        aria-label={`下移${a.name}`}
                        onClick={() => {
                          const i = work.apps.indexOf(a);
                          if (i < work.apps.length - 1)
                            onChange((w) => moveApp(w, a.id, w.apps[i + 1].id));
                        }}
                      >
                        <ArrowDown size={12} />
                      </button>
                      <button
                        aria-label={`${a.visible ? "从桌面移除" : "添加到桌面"}${a.name}`}
                        onClick={() =>
                          onChange((w) => {
                            if (a.visible) removeFromHome(w, a.id);
                            else {
                              const x = w.apps.find((x) => x.id === a.id);
                              if (x) x.visible = true;
                            }
                          })
                        }
                      >
                        <Smartphone size={12} />
                        {a.visible ? "从桌面移除" : "添加到桌面"}
                      </button>
                      <button
                        className="danger"
                        aria-label={`卸载${a.name}`}
                        onClick={() => {
                          setUninstall(a.id);
                          setKeep(true);
                        }}
                      >
                        <Trash2 size={12} />
                        卸载
                      </button>
                    </div>
                  )}
                </article>
              ))}
              {!filtered.length && (
                <p className="library-empty">没有匹配的 App</p>
              )}
            </div>
            <aside className="app-properties">
              {current?.installed ? (
                <>
                  <h3>{current.name}</h3>
                  <label>
                    App 名称
                    <input
                      aria-label="自定义 App 名称"
                      value={current.name}
                      onChange={(e) => update({ name: e.target.value })}
                    />
                  </label>
                  <label>
                    图标文字
                    <input
                      aria-label="自定义图标文字"
                      maxLength={4}
                      value={
                        current.icon.startsWith("data:") ? "" : current.icon
                      }
                      placeholder="使用默认图标"
                      onChange={(e) => update({ icon: e.target.value })}
                    />
                  </label>
                  <label className="icon-upload">
                    上传图标
                    <input
                      aria-label="上传 App 图标"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f)
                          try {
                            update({ icon: await mediaData(f) });
                          } catch (err) {
                            setError(String(err));
                          }
                      }}
                    />
                  </label>
                  {current.icon && (
                    <button
                      className="text-button"
                      onClick={() => update({ icon: "" })}
                    >
                      恢复默认图标
                    </button>
                  )}
                  <label>
                    文件夹
                    <input
                      aria-label="App 文件夹"
                      value={current.folder}
                      placeholder="留空放在桌面"
                      onChange={(e) =>
                        update({
                          folder: e.target.value,
                          dock: false,
                          visible: true,
                        })
                      }
                    />
                  </label>
                  <label className="inline-check">
                    <input
                      type="checkbox"
                      checked={current.dock}
                      onChange={(e) => {
                        if (
                          e.target.checked &&
                          work.apps.filter(
                            (a) => a.installed && a.visible && a.dock,
                          ).length >= 4
                        ) {
                          setError("Dock 最多放置 4 个 App");
                          return;
                        }
                        update({
                          dock: e.target.checked,
                          visible: true,
                          folder: "",
                        });
                      }}
                    />
                    放入 Dock
                  </label>
                  <small>
                    {(work.data[current.id] ?? []).length} 条创作内容
                  </small>
                </>
              ) : (
                <p>选择已安装的 App，编辑名称、图标与文件夹。</p>
              )}
              <div className="custom-app-form">
                <label>
                  自定义 App
                  <input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="App 名称"
                  />
                </label>
                <button
                  className="secondary"
                  disabled={!customName.trim()}
                  onClick={() => {
                    onChange((w) => {
                      setSelected(newCustomApp(w, customName.trim()));
                    });
                    setCustomName("");
                  }}
                >
                  <Plus size={14} />
                  添加 App
                </button>
              </div>
            </aside>
          </div>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </div>
        <footer>
          <span>
            {work.apps.filter((a) => a.installed).length} 个已安装 ·
            拖动手柄排序
          </span>
          <button className="primary" onClick={onClose}>
            <Check size={14} />
            完成
          </button>
        </footer>
      </Modal>
      {uninstall && (
        <Modal
          title={`卸载${catalog.find((a) => a.id === uninstall)?.name}？`}
          onClose={() => setUninstall("")}
        >
          <div className="editor-fields">
            <p>卸载后将从手机和 App 资源库移除。</p>
            <label className="inline-check">
              <input
                type="checkbox"
                checked={keep}
                onChange={(e) => setKeep(e.target.checked)}
              />
              保留创作数据，重新安装后恢复
            </label>
            {!keep && (
              <p className="error">
                将删除此 App 的全部创作内容。引用这些内容的剧情可能失效。
              </p>
            )}
          </div>
          <footer>
            <button className="secondary" onClick={() => setUninstall("")}>
              取消
            </button>
            <button
              className="primary danger-bg"
              onClick={() => {
                onChange((w) => uninstallApp(w, uninstall, keep));
                setUninstall("");
              }}
            >
              确认卸载{keep ? "并保留数据" : "并删除数据"}
            </button>
          </footer>
        </Modal>
      )}
    </>
  );
}
