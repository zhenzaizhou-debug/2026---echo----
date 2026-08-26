# 回声 Echo — V0.1 local slice

这一轮实现黄昏海滩、第一人称慢走、程序化海浪与风声、16 条本地 Echo、空间范围加载、潮水侵蚀感、匿名设备 ID、本地频率限制与“起身后作者不再看见”的写作流程。进入海边后会分片加载 SPZ 高斯泼溅实景，行走高度与 Echo 落点由配套 GLB 碰撞网格校准。数据库与多人 Presence 留给后续里程碑。

## 项目结构

```text
app/                    页面、全局样式与分享元数据
components/
  EchoExperience.tsx   入场、写字、设置与状态流程
  scene/               海滩、海面、玩家控制、沙滩文字
data/                   16 条本地测试 Echo
hooks/                  程序化海浪、风声与脚步声
lib/                    匿名设备 ID、频率限制与基础过滤
types/                  Echo 空间数据类型
public/                 分享封面、SPZ 分片与碰撞网格
```

## 主要依赖

- Next.js / React / TypeScript
- Three.js
- React Three Fiber
- `@react-three/drei`（预留后续场景工具）
- `@sparkjsdev/spark`（SPZ 高斯泼溅渲染）

沙滩字迹使用 Google Fonts 的 Long Cang 手写字体，随项目本地托管；字体许可证见 `public/fonts/OFL-LongCang.txt`。

## 本地运行

安装依赖后运行 `pnpm dev`，访问 `http://localhost:3000`。

后续接入 Supabase 时，复制 `.env.example` 为 `.env.local` 并填写项目地址与匿名密钥。
