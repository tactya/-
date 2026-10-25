import {
  Home,
  MapPin,
  Receipt,
  ShoppingBag,
  Star,
  Ticket,
  Truck,
  Utensils,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import {
  Empty,
  Header,
  Media,
  meta,
  SearchBox,
  Tabs,
  useContent,
  type Props,
} from "./shared";
export function AlipaySkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "账单");
  const list =
    tab === "卡包"
      ? items.filter((i) => i.folder === "卡包" || i.folder === "票券")
      : items.filter((i) => !["卡包", "票券"].includes(i.folder));
  return (
    <div className="catalog-skin alipay-ui">
      <Header p={p} />
      <div className="alipay-blue">
        <h2>{tab}</h2>
        <div>
          <button onClick={() => setTab("账单")}>
            <Receipt size={28} />
            账单
          </button>
          <button onClick={() => setTab("卡包")}>
            <Ticket size={28} />
            卡包
          </button>
        </div>
        <small>作品内的虚构支付记录</small>
      </div>
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {list.map((i) =>
          tab === "卡包" ? (
            <button
              className="alipay-ticket"
              key={i.id}
              onClick={() => p.onItem(i)}
            >
              <Ticket size={23} />
              <div>
                <strong>{i.title}</strong>
                <p>{i.body}</p>
                <small>{i.time}</small>
              </div>
            </button>
          ) : (
            <button
              className="alipay-bill"
              key={i.id}
              onClick={() => p.onItem(i)}
            >
              <Wallet size={27} />
              <div>
                <strong>{i.title}</strong>
                <small>
                  {meta(i, "merchant", i.sender)} · {i.time.slice(5, 16)}
                </small>
              </div>
              <span>
                <strong>{meta(i, "amount", "—")}</strong>
                <small>{meta(i, "status", "账单记录")}</small>
              </span>
            </button>
          ),
        )}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["账单", "卡包"]}
        value={tab}
        set={setTab}
        icons={[<Receipt />, <Ticket />]}
      />
    </div>
  );
}
export function TaobaoSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "商品");
  const [status, setStatus] = useState("全部");
  const list = items
    .filter((i) =>
      tab === "商品"
        ? i.folder !== "订单" && i.folder !== "物流"
        : i.folder === tab,
    )
    .filter((i) => status === "全部" || meta(i, "status") === status);
  return (
    <div className="catalog-skin taobao-ui">
      <Header p={p} />
      <div className="taobao-search">
        <SearchBox value={q} set={setQ} placeholder="搜索商品或订单" />
      </div>
      <div className="catalog-scroll">
        {tab === "商品" ? (
          <div className="taobao-products">
            {list.map((i) => (
              <button key={i.id} onClick={() => p.onItem(i)}>
                <Media item={i} />
                <strong>{i.title}</strong>
                <p>
                  ¥ <b>{meta(i, "price", "—")}</b>
                </p>
                <small>{i.sender}</small>
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="taobao-status">
              {["全部", "待付款", "待发货", "待收货", "已完成"].map((s) => (
                <button
                  className={s === status ? "selected" : ""}
                  key={s}
                  onClick={() => setStatus(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            {list.map((i) => (
              <button
                className="taobao-order"
                key={i.id}
                onClick={() => p.onItem(i)}
              >
                <div>
                  <ShoppingBag size={16} />
                  <strong>{i.sender}</strong>
                  <small>{meta(i, "status", "订单记录")}</small>
                </div>
                <section>
                  <Media item={i} />
                  <span>
                    <strong>{i.title}</strong>
                    <p>
                      {tab === "物流" ? meta(i, "tracking", i.body) : i.body}
                    </p>
                    <b>¥ {meta(i, "price", "—")}</b>
                  </span>
                </section>
                <footer>{meta(i, "number", i.time)}</footer>
              </button>
            ))}
          </>
        )}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["商品", "订单", "物流"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setStatus("全部");
        }}
        icons={[<Home />, <ShoppingBag />, <Truck />]}
      />
    </div>
  );
}
export function DeliverySkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "商家");
  const list = items.filter((i) =>
    tab === "订单" ? i.folder === "订单" : i.folder !== "订单",
  );
  return (
    <div className="catalog-skin delivery-ui">
      <Header p={p} />
      <div className="delivery-location">
        <MapPin size={18} />
        <strong>{meta(items[0], "address", "作品配送地址")}</strong>
      </div>
      <SearchBox value={q} set={setQ} placeholder="搜索商家或订单" />
      <div className="catalog-scroll">
        {tab === "商家"
          ? list.map((i) => (
              <button
                className="delivery-merchant"
                key={i.id}
                onClick={() => p.onItem(i)}
              >
                <Media item={i} />
                <div>
                  <h3>{i.title}</h3>
                  <p>
                    <Star size={12} />
                    {meta(i, "rating", "—")}
                    <span>{meta(i, "duration")}</span>
                  </p>
                  <small>{i.body.split("\n")[0]}</small>
                  <strong>¥ {meta(i, "price", "—")}</strong>
                </div>
              </button>
            ))
          : list.map((i) => (
              <button
                className="delivery-order"
                key={i.id}
                onClick={() => p.onItem(i)}
              >
                <header>
                  <Utensils size={18} />
                  <strong>{i.sender}</strong>
                  <span>{meta(i, "status", "配送记录")}</span>
                </header>
                <section>
                  <Media item={i} />
                  <div>
                    <strong>{i.title}</strong>
                    <p>{i.body}</p>
                    <small>{i.time}</small>
                  </div>
                  <b>¥ {meta(i, "price", "—")}</b>
                </section>
                <footer>
                  <MapPin size={13} />
                  {meta(i, "address")}
                </footer>
              </button>
            ))}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["商家", "订单"]}
        value={tab}
        set={setTab}
        icons={[<Utensils />, <Receipt />]}
      />
    </div>
  );
}
