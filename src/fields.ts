export type Field = { key: string; label: string; type?: "number" | "text" };
const fields: Record<string, Field[]> = {
  phone: [
    { key: "number", label: "电话号码" },
    { key: "status", label: "通话状态" },
  ],
  contacts: [
    { key: "number", label: "电话" },
    { key: "email", label: "电子邮箱" },
    { key: "company", label: "公司" },
  ],
  calendar: [
    { key: "location", label: "地点" },
    { key: "duration", label: "持续时间" },
  ],
  clock: [
    { key: "city", label: "城市" },
    { key: "clock", label: "显示时间" },
  ],
  maps: [
    { key: "address", label: "地址" },
    { key: "x", label: "地图横坐标(0–100)", type: "number" },
    { key: "y", label: "地图纵坐标(0–100)", type: "number" },
  ],
  weather: [
    { key: "temperature", label: "气温", type: "number" },
    { key: "condition", label: "天气状况" },
    { key: "high", label: "最高温", type: "number" },
    { key: "low", label: "最低温", type: "number" },
    { key: "humidity", label: "湿度" },
  ],
  wallet: [
    { key: "amount", label: "金额" },
    { key: "status", label: "交易状态" },
    { key: "number", label: "卡片尾号" },
  ],
  health: [
    { key: "value", label: "数值", type: "number" },
    { key: "unit", label: "单位" },
    { key: "metric", label: "指标名称" },
  ],
  find: [
    { key: "location", label: "位置" },
    { key: "status", label: "设备状态" },
    { key: "x", label: "位置横坐标", type: "number" },
    { key: "y", label: "位置纵坐标", type: "number" },
  ],
  safari: [{ key: "url", label: "虚构网址" }],
  files: [
    { key: "extension", label: "文件扩展名" },
    { key: "size", label: "显示文件大小" },
  ],
  mail: [
    { key: "email", label: "发件地址" },
    { key: "recipient", label: "收件人" },
  ],
  discord: [
    { key: "server", label: "服务器名称" },
    { key: "status", label: "成员状态" },
  ],
  qq: [{ key: "number", label: "QQ号码" }],
  telegram: [{ key: "handle", label: "用户名" }],
  alipay: [
    { key: "amount", label: "金额" },
    { key: "status", label: "交易状态" },
    { key: "merchant", label: "商家" },
    { key: "number", label: "交易单号" },
  ],
  taobao: [
    { key: "price", label: "价格" },
    { key: "status", label: "订单状态" },
    { key: "tracking", label: "物流进度" },
    { key: "number", label: "订单号" },
  ],
  delivery: [
    { key: "price", label: "金额" },
    { key: "status", label: "配送状态" },
    { key: "address", label: "配送地址" },
    { key: "duration", label: "配送时长" },
    { key: "rating", label: "评分" },
  ],
  reddit: [
    { key: "community", label: "社区名" },
    { key: "votes", label: "虚构投票数", type: "number" },
  ],
  forum: [
    { key: "views", label: "虚构浏览数", type: "number" },
    { key: "status", label: "帖子状态" },
  ],
  twitter: [
    { key: "handle", label: "用户名" },
    { key: "reposts", label: "虚构转发数", type: "number" },
  ],
  weibo: [{ key: "reposts", label: "虚构转发数", type: "number" }],
  netflix: [
    { key: "genre", label: "类型" },
    { key: "duration", label: "时长" },
    { key: "year", label: "年份" },
  ],
  spotify: [
    { key: "album", label: "专辑" },
    { key: "duration", label: "时长" },
  ],
  music: [
    { key: "album", label: "专辑" },
    { key: "duration", label: "时长" },
  ],
  netease: [
    { key: "album", label: "专辑" },
    { key: "duration", label: "时长" },
  ],
  youtube: [
    { key: "views", label: "虚构播放数" },
    { key: "duration", label: "时长" },
  ],
  bilibili: [
    { key: "views", label: "虚构播放数" },
    { key: "duration", label: "时长" },
  ],
  douyin: [{ key: "views", label: "虚构播放数" }],
  tiktok: [{ key: "views", label: "虚构播放数" }],
};
export const getFields = (app: string) => fields[app] ?? [];
