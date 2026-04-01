import { useState, useMemo, useCallback, useRef, useEffect } from "react";

/* ═══ MATH ═══ */
function gsd(n) { if (n <= 0) return 0; let d = 0; while (n % 2 === 0) { n /= 2; d++; } return d; }
function gsc(n) { const c = [n]; while (n % 2 === 0 && n > 1) { n /= 2; c.push(n); } return c; }
function gtd(dim, t) { if (t <= 0 || dim <= 0 || dim % t !== 0) return -1; return gsd(dim / t); }
function gtc(dim, t) { if (t <= 0 || dim % t !== 0) return [dim]; let c = dim / t; const r = [c]; while (c % 2 === 0 && c > 1) { c /= 2; r.push(c); } return r; }
function isPow2(n) { return n > 0 && (n & (n - 1)) === 0; }

function getDepthTier(d, ts) {
  if (ts > 1) {
    if (d >= 5) return { label: "极优", tier: "S", color: "#34a853", bg: "#d6f5dd" };
    if (d >= 4) return { label: "优秀", tier: "A", color: "#1a73e8", bg: "#d2e3fc" };
    if (d >= 3) return { label: "良好", tier: "B", color: "#e8710a", bg: "#fde7cc" };
    if (d >= 2) return { label: "可用", tier: "C", color: "#9334e6", bg: "#e8d5f5" };
    return { label: "不足", tier: "D", color: "#999", bg: "#eee" };
  }
  if (d >= 15) return { label: "极优", tier: "S", color: "#34a853", bg: "#d6f5dd" };
  if (d >= 13) return { label: "优秀", tier: "A", color: "#1a73e8", bg: "#d2e3fc" };
  if (d >= 11) return { label: "良好", tier: "B", color: "#e8710a", bg: "#fde7cc" };
  if (d >= 9) return { label: "可用", tier: "C", color: "#9334e6", bg: "#e8d5f5" };
  return { label: "不足", tier: "D", color: "#999", bg: "#eee" };
}
function getTierThresholds(ts) {
  if (ts > 1) return [
    { tier: "S", min: 5, desc: "极优 · 超大型镶嵌" }, { tier: "A", min: 4, desc: "优秀 · 推荐创作" },
    { tier: "B", min: 3, desc: "良好 · 常规需求" }, { tier: "C", min: 2, desc: "可用 · 基本递归" },
    { tier: "D", min: 0, desc: "不足 · 不建议" },
  ];
  return [
    { tier: "S", min: 15, desc: "极优 · 超大型镶嵌" }, { tier: "A", min: 13, desc: "优秀 · 推荐创作" },
    { tier: "B", min: 11, desc: "良好 · 常规需求" }, { tier: "C", min: 9, desc: "可用 · 基本递归" },
    { tier: "D", min: 0, desc: "不足 · 不建议" },
  ];
}

function getMatrixColor(fullDepth, ts) { return getDepthTier(fullDepth, ts).bg; }

const ASPECT_RATIOS = [
  { label:"1:1",w:1,h:1 },{ label:"4:3",w:4,h:3 },{ label:"3:2",w:3,h:2 },
  { label:"16:9",w:16,h:9 },{ label:"16:10",w:16,h:10 },{ label:"2:1",w:2,h:1 },
  { label:"3:4",w:3,h:4 },{ label:"2:3",w:2,h:3 },{ label:"9:16",w:9,h:16 },
  { label:"5:4",w:5,h:4 },{ label:"21:9",w:21,h:9 },{ label:"自定义",w:0,h:0 },
];
const TILE_PRESETS = [1, 64, 128, 256, 512, 1024, 2048];

/* ═══ DESIGN ═══ */
const m = {
  bg:"#ececec",panelBg:"#f6f6f6",panelBorder:"#c8c8c8",inputBg:"#fff",inputBorder:"#b8b8b8",
  focusBorder:"#4a9eff",text:"#1d1d1f",text2:"#6e6e73",text3:"#999",
  accent:"#007aff",accentH:"#0066d6",sep:"#d2d2d7",
  targetBg:"#f3eeff",targetBd:"#d8ccf8",
  font:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",
  mono:"'SF Mono','Menlo','Monaco','Courier New',monospace",
  shadow:"0 1px 3px rgba(0,0,0,0.08)",
};

/* ═══ UI COMPONENTS ═══ */
function Panel({ title, children, style }) {
  return (<div style={{ background:m.panelBg, border:`1px solid ${m.panelBorder}`, borderRadius:10, boxShadow:m.shadow, overflow:"hidden", ...style }}>
    {title && <div style={{ padding:"7px 14px", fontSize:11, fontWeight:600, color:m.text2, borderBottom:`1px solid ${m.sep}`, background:"linear-gradient(to bottom,#fafafa,#f0f0f0)" }}>{title}</div>}
    <div style={{ padding:12 }}>{children}</div>
  </div>);
}
function MInput({ label, value, onChange, width=110, suffix, style }) {
  const [f, setF] = useState(false);
  return (<div style={{ display:"flex", alignItems:"center", gap:6, ...style }}>
    {label && <span style={{ fontSize:12, color:m.text, whiteSpace:"nowrap" }}>{label}</span>}
    <div style={{ position:"relative", width }}>
      <input type="number" value={value} onChange={e=>onChange(parseInt(e.target.value)||0)}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{ width:"100%",padding:"5px 8px",paddingRight:suffix?24:8,background:m.inputBg,
          border:`1px solid ${f?m.focusBorder:m.inputBorder}`,borderRadius:5,fontSize:13,fontFamily:m.mono,
          color:m.text,outline:"none",boxShadow:f?"0 0 0 3px rgba(0,122,255,0.15)":"inset 0 1px 2px rgba(0,0,0,0.06)",boxSizing:"border-box" }}/>
      {suffix && <span style={{ position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",fontSize:9,color:m.text3,pointerEvents:"none" }}>{suffix}</span>}
    </div>
  </div>);
}
function MSel({ label, value, onChange, options }) {
  return (<div style={{ display:"flex",alignItems:"center",gap:6 }}>
    {label && <span style={{ fontSize:12,color:m.text,whiteSpace:"nowrap" }}>{label}</span>}
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ padding:"5px 20px 5px 8px",background:m.inputBg,border:`1px solid ${m.inputBorder}`,borderRadius:5,fontSize:12,color:m.text,outline:"none",cursor:"pointer" }}>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>);
}
function MSlider({ label, value, min, max, step, onChange, displayValue, suffix="", lw=55 }) {
  return (<div style={{ display:"flex",alignItems:"center",gap:8,width:"100%" }}>
    {label && <span style={{ fontSize:12,color:m.text,whiteSpace:"nowrap",minWidth:lw }}>{label}</span>}
    <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))} style={{ flex:1,accentColor:m.accent,height:4 }}/>
    <span style={{ fontSize:11,fontFamily:m.mono,color:m.text2,minWidth:52,textAlign:"right" }}>{displayValue!==undefined?displayValue:value}{suffix}</span>
  </div>);
}
function MBtn({ children, onClick, primary, small, active, style:sx }) {
  const [h, setH] = useState(false);
  return (<button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{ padding:small?"3px 9px":"5px 13px",borderRadius:5,border:(primary||active)?"none":`1px solid ${m.inputBorder}`,
      background:primary?(h?m.accentH:m.accent):active?"#d2e3fc":(h?"#e8e8e8":m.inputBg),
      color:primary?"#fff":m.text,fontSize:small?11:12,fontWeight:500,cursor:"pointer",
      boxShadow:"0 1px 2px rgba(0,0,0,0.06)",transition:"all 0.15s",fontFamily:m.font,whiteSpace:"nowrap",...sx }}>
    {children}</button>);
}
function MSeg({ options, value, onChange }) {
  return (<div style={{ display:"inline-flex",background:"#ddd",borderRadius:7,padding:2,gap:1 }}>
    {options.map(o=>(<button key={o.value} onClick={()=>onChange(o.value)} style={{
      padding:"4px 13px",borderRadius:5,border:"none",background:value===o.value?"#fff":"transparent",
      color:value===o.value?m.text:m.text2,fontSize:11,fontWeight:value===o.value?600:400,
      cursor:"pointer",boxShadow:value===o.value?"0 1px 3px rgba(0,0,0,0.12)":"none",fontFamily:m.font }}>
      {o.label}</button>))}
  </div>);
}
function DBadge({ depth, ts }) {
  const t = getDepthTier(depth, ts);
  return (<span style={{ display:"inline-flex",alignItems:"center",gap:3,padding:"1px 6px",borderRadius:4,
    background:t.bg,border:`1px solid ${t.color}33`,fontSize:10,fontWeight:600,color:t.color,fontFamily:m.mono }}>
    {t.tier}·{depth}级</span>);
}
function FullChain({ value, ts }) {
  const items = ts > 1 ? gtc(value, ts) : gsc(value);
  const unit = ts > 1 ? "tiles" : "px";
  return (<div style={{ fontFamily:m.mono,fontSize:11,color:m.text2,lineHeight:1.8,wordBreak:"break-word" }}>
    {items.map((v,i)=>(<span key={i}>
      <span style={{ color:i===0?m.text:m.text2,fontWeight:i===0?600:400 }}>{v}</span>
      {i<items.length-1 && <span style={{ color:m.text3,margin:"0 3px" }}>→</span>}
    </span>))}
    <span style={{ color:m.text3,marginLeft:6 }}>({items.length-1}级 · {unit})</span>
  </div>);
}
function SortHeader({ label, field, sf, sd, onSort, align }) {
  const active = sf === field;
  return (<span onClick={()=>onSort(field)} style={{ cursor:"pointer",userSelect:"none",textAlign:align||"left",
    color:active?m.accent:m.text3,fontWeight:active?700:600,display:"flex",alignItems:"center",
    justifyContent:align==="right"?"flex-end":"flex-start",gap:2 }}>
    {label}{active && <span style={{ fontSize:7 }}>{sd==="asc"?" ▲":" ▼"}</span>}
  </span>);
}

/* ═══ MATRIX VIEW ═══ */
function MatrixView({ effectiveTile, selectedCell, onSelectCell }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [view, setView] = useState({ col: 0, row: 0, cellPx: 32 });
  const [hover, setHover] = useState(null);
  const [drag, setDrag] = useState(null);
  const step = effectiveTile > 1 ? effectiveTile : 512;
  const LM = 60, BM = 44; // left margin, bottom margin

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setSize({ w: Math.floor(width), h: Math.floor(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Grid ↔ Screen transforms
  const g2sx = useCallback((col) => LM + (col - view.col) * view.cellPx, [view, LM]);
  const g2sy = useCallback((row) => (size.h - BM) - (row - view.row + 1) * view.cellPx, [view, size.h, BM]);
  const s2gc = useCallback((sx) => view.col + (sx - LM) / view.cellPx, [view, LM]);
  const s2gr = useCallback((sy) => view.row + ((size.h - BM) - sy) / view.cellPx, [view, size.h, BM]);

  // Canvas draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    canvas.style.width = size.w + "px";
    canvas.style.height = size.h + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size.w, size.h);

    const drawW = size.w - LM;
    const drawH = size.h - BM;
    const cp = view.cellPx;

    // Visible range
    const c0 = Math.max(0, Math.floor(view.col));
    const c1 = Math.min(Math.ceil(view.col + drawW / cp), 2000);
    const r0 = Math.max(0, Math.floor(view.row));
    const r1 = Math.min(Math.ceil(view.row + drawH / cp), 2000);

    // Clip to draw area
    ctx.save();
    ctx.beginPath();
    ctx.rect(LM, 0, drawW, drawH);
    ctx.clip();

    // Draw cells
    for (let col = c0; col < c1; col++) {
      for (let row = r0; row < r1; row++) {
        const sx = g2sx(col);
        const sy = g2sy(row);
        if (sx + cp < LM || sx > size.w || sy + cp < 0 || sy > drawH) continue;

        const w = (col + 1) * step;
        const h = (row + 1) * step;
        const fullD = effectiveTile > 1 ? Math.min(gtd(w, effectiveTile), gtd(h, effectiveTile)) : Math.min(gsd(w), gsd(h));

        // Cell background — uses same tier colors as the legend
        ctx.fillStyle = getMatrixColor(fullD, effectiveTile);
        ctx.fillRect(sx, sy, cp - 0.5, cp - 0.5);

        // Selected highlight
        if (selectedCell && selectedCell.col === col && selectedCell.row === row) {
          ctx.strokeStyle = "#007aff";
          ctx.lineWidth = 2.5;
          ctx.strokeRect(sx + 1, sy + 1, cp - 2.5, cp - 2.5);
        }
        // Hover highlight
        else if (hover && hover.col === col && hover.row === row) {
          ctx.strokeStyle = "rgba(0,0,0,0.3)";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(sx + 0.5, sy + 0.5, cp - 1.5, cp - 1.5);
        }

        // Cell text
        if (cp > 22) {
          const isP2 = isPow2(col + 1) && isPow2(row + 1);
          const isDiag = col === row;

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          if (cp > 52 && isDiag) {
            // Large cells on diagonal: show count + depth
            ctx.font = `bold ${Math.min(cp * 0.3, 14)}px ${m.mono}`;
            ctx.fillStyle = isP2 ? "#d32f2f" : m.text;
            ctx.fillText(String(col + 1), sx + cp / 2, sy + cp / 2 - 6);
            ctx.font = `${Math.min(cp * 0.2, 10)}px ${m.mono}`;
            ctx.fillStyle = m.text2;
            ctx.fillText(`深${fullD}`, sx + cp / 2, sy + cp / 2 + 8);
          } else {
            // Show depth number
            const fontSize = Math.min(cp * 0.4, 13);
            ctx.font = `${isP2 ? "bold " : ""}${fontSize}px ${m.mono}`;
            ctx.fillStyle = isP2 ? "#d32f2f" : (fullD >= 4 ? m.text : m.text2);
            ctx.fillText(String(fullD), sx + cp / 2, sy + cp / 2 + 1);
          }
        }
      }
    }

    // Diagonal line (subtle)
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    const diagStart = Math.max(c0, r0);
    const diagEnd = Math.min(c1, r1);
    for (let i = diagStart; i < diagEnd; i++) {
      const sx = g2sx(i);
      const sy = g2sy(i);
      if (i === diagStart) ctx.moveTo(sx + cp / 2, sy + cp / 2);
      else ctx.lineTo(sx + cp / 2, sy + cp / 2);
    }
    ctx.stroke();

    // Selected area visualization — rectangle from (0,0) to selected cell
    if (selectedCell) {
      const sc = selectedCell.col, sr = selectedCell.row;
      const areaX = g2sx(0);
      const areaY = g2sy(sr);
      const areaW = (sc + 1) * cp;
      const areaH = (sr + 1) * cp;

      // Semi-transparent fill
      ctx.fillStyle = "rgba(0, 122, 255, 0.06)";
      ctx.fillRect(areaX, areaY, areaW, areaH);

      // Border
      ctx.strokeStyle = "rgba(0, 122, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(areaX, areaY, areaW, areaH);

      // Cross guide lines through selected cell (full width/height of visible area)
      ctx.strokeStyle = "rgba(0, 122, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      // Horizontal line through selected row
      const selCenterY = g2sy(sr) + cp / 2;
      ctx.beginPath();
      ctx.moveTo(LM, selCenterY);
      ctx.lineTo(size.w, selCenterY);
      ctx.stroke();
      // Vertical line through selected col
      const selCenterX = g2sx(sc) + cp / 2;
      ctx.beginPath();
      ctx.moveTo(selCenterX, 0);
      ctx.lineTo(selCenterX, drawH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dimension label on the area border
      if (areaW > 60 && areaY > 16) {
        const labelW = (sc + 1) * step;
        const labelH = (sr + 1) * step;
        const lblX = areaX + areaW / 2;
        const lblY = areaY - 6;
        ctx.font = `bold 11px ${m.mono}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        // Background for readability
        const lblText = `${labelW} × ${labelH}`;
        const tw = ctx.measureText(lblText).width + 10;
        ctx.fillStyle = "rgba(0, 122, 255, 0.85)";
        ctx.beginPath();
        ctx.roundRect(lblX - tw / 2, lblY - 14, tw, 17, 4);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.fillText(lblText, lblX, lblY);
      }
    }

    ctx.restore();

    // Axis labels
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, size.h - BM, size.w, BM); // bottom bg
    ctx.fillRect(0, 0, LM, size.h - BM); // left bg
    ctx.strokeStyle = m.sep;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(LM, 0); ctx.lineTo(LM, size.h - BM);
    ctx.moveTo(LM, size.h - BM); ctx.lineTo(size.w, size.h - BM);
    ctx.stroke();

    // X-axis labels
    const labelStep = Math.max(1, Math.ceil(50 / cp));
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = `10px ${m.mono}`;
    for (let col = c0; col < c1; col += labelStep) {
      const sx = g2sx(col) + cp / 2;
      if (sx < LM || sx > size.w) continue;
      const val = (col + 1) * step;
      ctx.fillStyle = isPow2(col + 1) ? "#d32f2f" : m.text2;
      ctx.fillText(String(val), sx, size.h - BM + 5);
      if (cp > 40) {
        ctx.fillStyle = m.text3;
        ctx.fillText(`(${col + 1})`, sx, size.h - BM + 18);
      }
    }

    // Y-axis labels
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let row = r0; row < r1; row += labelStep) {
      const sy = g2sy(row) + cp / 2;
      if (sy < 0 || sy > size.h - BM) continue;
      const val = (row + 1) * step;
      ctx.fillStyle = isPow2(row + 1) ? "#d32f2f" : m.text2;
      ctx.fillText(String(val), LM - 6, sy);
    }

    // Corner label
    ctx.fillStyle = m.text3;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `9px ${m.mono}`;
    ctx.fillText("W↗", LM / 2, size.h - BM + 12);
    ctx.fillText("H↑", LM / 2, size.h - BM + 24);
  }, [size, view, hover, selectedCell, effectiveTile, step, g2sx, g2sy]);

  // Mouse handlers
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const oldPx = view.cellPx;
    const newPx = e.deltaY < 0 ? Math.min(oldPx * 1.12, 120) : Math.max(oldPx / 1.12, 4);
    const mc = view.col + (mx - LM) / oldPx;
    const mr = view.row + ((size.h - BM) - my) / oldPx;
    setView({
      col: mc - (mx - LM) / newPx,
      row: mr - ((size.h - BM) - my) / newPx,
      cellPx: newPx,
    });
  }, [view, size.h]);

  const handleMouseDown = useCallback((e) => {
    setDrag({ x: e.clientX, y: e.clientY, col: view.col, row: view.row });
  }, [view]);

  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (drag) {
      const dx = (e.clientX - drag.x) / view.cellPx;
      const dy = (e.clientY - drag.y) / view.cellPx;
      setView(v => ({ ...v, col: drag.col - dx, row: drag.row + dy }));
    } else {
      // Hover
      if (mx > LM && my < size.h - BM) {
        const col = Math.floor(s2gc(mx));
        const row = Math.floor(s2gr(my));
        if (col >= 0 && row >= 0) {
          setHover({ col, row, x: mx, y: my });
        } else setHover(null);
      } else setHover(null);
    }
  }, [drag, view.cellPx, size.h, s2gc, s2gr]);

  const handleMouseUp = useCallback((e) => {
    if (drag) {
      const moved = Math.hypot(e.clientX - drag.x, e.clientY - drag.y);
      if (moved < 4 && hover) {
        onSelectCell({ col: hover.col, row: hover.row });
      }
    }
    setDrag(null);
  }, [drag, hover, onSelectCell]);

  // Tooltip data
  const tooltipData = useMemo(() => {
    if (!hover) return null;
    const w = (hover.col + 1) * step;
    const h = (hover.row + 1) * step;
    const dw = effectiveTile > 1 ? gtd(w, effectiveTile) : gsd(w);
    const dh = effectiveTile > 1 ? gtd(h, effectiveTile) : gsd(h);
    const md = Math.min(dw, dh);
    return { w, h, dw, dh, md, col: hover.col + 1, row: hover.row + 1 };
  }, [hover, step, effectiveTile]);

  return (
    <div ref={containerRef} style={{ position:"relative", width:"100%", height:"100%", overflow:"hidden", cursor: drag ? "grabbing" : "crosshair" }}>
      <canvas ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setHover(null); setDrag(null); }}
        style={{ display:"block" }}
      />
      {/* Tooltip */}
      {tooltipData && !drag && (
        <div style={{
          position:"absolute",
          left: Math.min(hover.x + 16, size.w - 240),
          top: Math.max(hover.y - 90, 8),
          background:"rgba(255,255,255,0.96)", border:`1px solid ${m.sep}`,
          borderRadius:8, padding:"8px 12px", boxShadow:"0 4px 16px rgba(0,0,0,0.15)",
          pointerEvents:"none", zIndex:10, minWidth:200,
        }}>
          <div style={{ fontFamily:m.mono, fontSize:14, fontWeight:700, color:m.text, marginBottom:4 }}>
            {tooltipData.w} × {tooltipData.h}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
            <DBadge depth={tooltipData.md} ts={effectiveTile} />
            <span style={{ fontSize:10, color:m.text2 }}>{(tooltipData.w * tooltipData.h / 1e6).toFixed(1)} MP</span>
          </div>
          <div style={{ fontSize:10, color:m.text2, fontFamily:m.mono }}>
            宽: {tooltipData.dw}级 · 高: {tooltipData.dh}级 · 同步: {tooltipData.md}级
          </div>
          {effectiveTile > 1 && (
            <div style={{ fontSize:10, color:"#e8710a", fontFamily:m.mono, marginTop:2 }}>
              {tooltipData.col}×{tooltipData.row} tiles
            </div>
          )}
          <div style={{ fontSize:9, color:m.text3, marginTop:4 }}>点击选中查看详情</div>
        </div>
      )}
      {/* Help overlay */}
      <div style={{ position:"absolute", top:8, right:8, background:"rgba(255,255,255,0.85)",
        borderRadius:6, padding:"4px 10px", fontSize:10, color:m.text2 }}>
        滚轮缩放 · 拖拽平移 · 点击选中
      </div>
    </div>
  );
}

/* ═══ GRID PREVIEW ═══ */
function GridPreview({ width, height, level, cW, cH, image, imageOpacity, imageFit, tileSize }) {
  const pad=28, innerW=cW-pad*2, innerH=cH-pad*2;
  const aspect=width/height;
  let drawW,drawH;
  if(aspect>=innerW/innerH){drawW=innerW;drawH=innerW/aspect}else{drawH=innerH;drawW=innerH*aspect}
  const ox=(cW-drawW)/2,oy=(cH-drawH)/2;
  const cols=Math.pow(2,level),rows=Math.pow(2,level);
  const cellW=drawW/cols,cellH=drawH/rows;
  let imgX=ox,imgY=oy,imgW=drawW,imgH=drawH;
  if(image){
    const iA=image.naturalWidth/image.naturalHeight;
    if(imageFit==="width"){imgW=drawW;imgH=drawW/iA;imgX=ox;imgY=oy+(drawH-imgH)/2}
    else if(imageFit==="height"){imgH=drawH;imgW=drawH*iA;imgX=ox+(drawW-imgW)/2;imgY=oy}
    else{const s=Math.max(drawW/image.naturalWidth,drawH/image.naturalHeight);imgW=image.naturalWidth*s;imgH=image.naturalHeight*s;imgX=ox+(drawW-imgW)/2;imgY=oy+(drawH-imgH)/2}
  }
  const cropX=image&&imgW>drawW?Math.round(((imgW-drawW)/imgW)*100):0;
  const cropY=image&&imgH>drawH?Math.round(((imgH-drawH)/imgH)*100):0;
  const padX=image&&imgW<drawW?Math.round(((drawW-imgW)/drawW)*100):0;
  const padY=image&&imgH<drawH?Math.round(((drawH-imgH)/drawH)*100):0;
  const showTG=tileSize>1&&width%tileSize===0&&height%tileSize===0;
  const tc=showTG?width/tileSize:0,tr=showTG?height/tileSize:0;
  const tcW=showTG?drawW/tc:0,tcH=showTG?drawH/tr:0;
  const showTL=showTG&&tcW>3&&tcH>3;
  return (
    <svg width={cW} height={cH} style={{ display:"block",background:"#e8e8e8",borderRadius:6,border:`1px solid ${m.sep}` }}>
      <defs><clipPath id="cC"><rect x={ox} y={oy} width={drawW} height={drawH} rx={1}/></clipPath>
        <pattern id="ck" patternUnits="userSpaceOnUse" width={10} height={10}><rect width={5} height={5} fill="#d8d8d8"/><rect x={5} y={5} width={5} height={5} fill="#d8d8d8"/><rect x={5} width={5} height={5} fill="#e8e8e8"/><rect y={5} width={5} height={5} fill="#e8e8e8"/></pattern></defs>
      <rect x={ox} y={oy} width={drawW} height={drawH} fill="url(#ck)" rx={1}/>
      {image&&<g clipPath="url(#cC)"><image href={image.src} x={imgX} y={imgY} width={imgW} height={imgH} opacity={imageOpacity} preserveAspectRatio="none"/></g>}
      <g clipPath="url(#cC)">
        {Array.from({length:cols-1}).map((_,i)=>{const x=ox+cellW*(i+1);const mm=(i+1)%4===0;return <line key={`v${i}`} x1={x} y1={oy} x2={x} y2={oy+drawH} stroke={mm?"rgba(0,122,255,0.5)":"rgba(0,122,255,0.18)"} strokeWidth={mm?1.2:0.5}/>})}
        {Array.from({length:rows-1}).map((_,i)=>{const y=oy+cellH*(i+1);const mm=(i+1)%4===0;return <line key={`h${i}`} x1={ox} y1={y} x2={ox+drawW} y2={y} stroke={mm?"rgba(0,122,255,0.5)":"rgba(0,122,255,0.18)"} strokeWidth={mm?1.2:0.5}/>})}
      </g>
      {showTL&&<g clipPath="url(#cC)" opacity={0.3}>
        {Array.from({length:tc-1}).map((_,i)=><line key={`tv${i}`} x1={ox+tcW*(i+1)} y1={oy} x2={ox+tcW*(i+1)} y2={oy+drawH} stroke="#ff9500" strokeWidth={0.3}/>)}
        {Array.from({length:tr-1}).map((_,i)=><line key={`th${i}`} x1={ox} y1={oy+tcH*(i+1)} x2={ox+drawW} y2={oy+tcH*(i+1)} stroke="#ff9500" strokeWidth={0.3}/>)}
      </g>}
      <rect x={ox} y={oy} width={drawW} height={drawH} fill="none" stroke="#007aff" strokeWidth={1.5} rx={1}/>
      <text x={ox+drawW/2} y={oy-8} textAnchor="middle" fontSize={11} fontFamily={m.mono} fill={m.text2} fontWeight="500">{width}px</text>
      <text x={ox-8} y={oy+drawH/2} textAnchor="middle" fontSize={11} fontFamily={m.mono} fill={m.text2} fontWeight="500" transform={`rotate(-90,${ox-8},${oy+drawH/2})`}>{height}px</text>
      {image&&<g>
        {cropX>0&&<><rect x={ox+3} y={oy+drawH/2-9} width={72} height={16} rx={3} fill="rgba(255,59,48,0.85)"/><text x={ox+39} y={oy+drawH/2+2} textAnchor="middle" fontSize={9} fill="#fff" fontWeight="500" fontFamily={m.mono}>左右裁切 {cropX}%</text></>}
        {cropY>0&&<><rect x={ox+drawW/2-36} y={oy+3} width={72} height={16} rx={3} fill="rgba(255,59,48,0.85)"/><text x={ox+drawW/2} y={oy+14} textAnchor="middle" fontSize={9} fill="#fff" fontWeight="500" fontFamily={m.mono}>上下裁切 {cropY}%</text></>}
        {padX>0&&<><rect x={ox+drawW-75} y={oy+drawH/2-9} width={72} height={16} rx={3} fill="rgba(255,149,0,0.85)"/><text x={ox+drawW-39} y={oy+drawH/2+2} textAnchor="middle" fontSize={9} fill="#fff" fontWeight="500" fontFamily={m.mono}>左右留白 {padX}%</text></>}
        {padY>0&&<><rect x={ox+drawW/2-36} y={oy+drawH-19} width={72} height={16} rx={3} fill="rgba(255,149,0,0.85)"/><text x={ox+drawW/2} y={oy+drawH-8} textAnchor="middle" fontSize={9} fill="#fff" fontWeight="500" fontFamily={m.mono}>上下留白 {padY}%</text></>}
      </g>}
    </svg>
  );
}

/* ═══ RESULT ROW ═══ */
function ResultRow({ width, height, isSelected, isTarget, onClick, index, ts }) {
  const dw=ts>1?gtd(width,ts):gsd(width),dh=ts>1?gtd(height,ts):gsd(height);
  const minD=Math.min(dw,dh),mp=(width*height/1e6).toFixed(1);
  const [hover,setHover]=useState(false);
  const ti=ts>1?`${width/ts}×${height/ts}`:"";
  let bg; if(isSelected)bg="#d2e3fc"; else if(isTarget)bg=m.targetBg; else if(hover)bg="#edf2f9"; else bg=index%2===0?"#fff":"#fafafa";
  return (<div onClick={onClick} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
    style={{ display:"grid",gridTemplateColumns:ts>1?"28px 155px 54px 58px 50px 80px 1fr":"28px 155px 54px 58px 50px 1fr",
      alignItems:"center",gap:5,padding:"6px 10px",background:bg,borderBottom:"1px solid #eee",
      borderLeft:isTarget?`3px solid ${m.targetBd}`:"3px solid transparent",cursor:"pointer" }}>
    <span style={{ fontFamily:m.mono,fontSize:9,color:m.text3,textAlign:"center" }}>{index+1}</span>
    <span style={{ fontFamily:m.mono,fontWeight:600,color:m.text,fontSize:12 }}>{width} × {height}</span>
    <DBadge depth={minD} ts={ts}/>
    <span style={{ fontFamily:m.mono,fontSize:10,color:m.text2,textAlign:"right" }}>{mp} MP</span>
    <span style={{ fontFamily:m.mono,fontSize:9,color:m.text3,textAlign:"right" }}>W{dw} H{dh}</span>
    {ts>1&&<span style={{ fontFamily:m.mono,fontSize:9,color:"#e8710a",textAlign:"right" }}>{ti} tiles</span>}
    <span style={{ fontFamily:m.mono,fontSize:9,color:m.text3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
      {ts>1?gtc(width,ts).slice(0,6).join("→"):gsc(width).slice(0,6).join("→")}
    </span>
  </div>);
}

/* ═══════════════════ MAIN APP ═══════════════════ */
export default function App() {
  const [mode,setMode]=useState("ratio");
  const [selRatio,setSelRatio]=useState(0);
  const [custW,setCustW]=useState(1);
  const [custH,setCustH]=useState(1);
  const [targetSize,setTargetSize]=useState(8192);
  const [minDepth,setMinDepth]=useState(9);
  const [freeW,setFreeW]=useState(8192);
  const [freeH,setFreeH]=useState(6144);
  const [anaW,setAnaW]=useState(12288);
  const [anaH,setAnaH]=useState(8192);
  const [selResult,setSelResult]=useState(null);
  const [showCount,setShowCount]=useState(30);
  const [tileSize,setTileSize]=useState(1);
  const [custTile,setCustTile]=useState(512);
  const [image,setImage]=useState(null);
  const [imgOp,setImgOp]=useState(0.5);
  const [imgFit,setImgFit]=useState("cover");
  const [imgName,setImgName]=useState("");
  const fileRef=useRef(null);
  const [viewLevel,setViewLevel]=useState(2);
  const [sortField,setSortField]=useState("default");
  const [sortDir,setSortDir]=useState("desc");
  const [matrixCell,setMatrixCell]=useState(null);

  const et=tileSize===-1?custTile:tileSize;
  const ratio=ASPECT_RATIOS[selRatio];
  const isCust=ratio.label==="自定义";
  const rw=isCust?(custW||1):ratio.w, rh=isCust?(custH||1):ratio.h;

  useEffect(()=>{if(et>1&&minDepth>8)setMinDepth(2);if(et<=1&&minDepth<5)setMinDepth(9)},[et]);
  const handleImg=useCallback(e=>{const f=e.target.files?.[0];if(!f)return;setImgName(f.name);const r=new FileReader();r.onload=ev=>{const img=new Image();img.onload=()=>setImage(img);img.src=ev.target.result};r.readAsDataURL(f)},[]);
  const calcD=useCallback((w,h)=>{if(et>1){const dw=gtd(w,et),dh=gtd(h,et);if(dw<0||dh<0)return -1;return Math.min(dw,dh)}return Math.min(gsd(w),gsd(h))},[et]);
  const calcDW=useCallback(w=>et>1?gtd(w,et):gsd(w),[et]);
  const calcDH=useCallback(h=>et>1?gtd(h,et):gsd(h),[et]);
  const handleSort=useCallback(f=>{if(sortField===f){if(sortDir==="desc")setSortDir("asc");else{setSortField("default");setSortDir("desc")}}else{setSortField(f);setSortDir("desc")}},[sortField,sortDir]);

  const ratioRaw=useMemo(()=>{
    if(mode!=="ratio")return[];const res=[];const mx=Math.max(targetSize*4,65536);const bu=et>1?et:1;
    const kStart=et>1?0:9, kEnd=et>1?16:20;
    for(let k=kStart;k<=kEnd;k++){for(let odd=1;odd<=300;odd+=2){
      const base=et>1?bu*odd*Math.pow(2,k):odd*Math.pow(2,k);
      if(base>mx)break;if(base<512)continue;
      const h=Math.round(base*rh/rw);
      if(h>=512&&h<=mx&&(et<=1||h%bu===0)){const md=calcD(base,h);if(md>=minDepth&&Math.abs((base/h)-(rw/rh))/(rw/rh)<0.001)res.push({width:base,height:h,minDepth:md})}
      if(rw!==rh){const w2=Math.round(base*rw/rh);if(w2>=512&&w2<=mx&&(et<=1||w2%bu===0)){const md2=calcD(w2,base);if(md2>=minDepth&&Math.abs((w2/base)-(rw/rh))/(rw/rh)<0.001)res.push({width:w2,height:base,minDepth:md2})}}
    }}
    const seen=new Set();return res.filter(r=>{const k=`${r.width}x${r.height}`;if(seen.has(k))return false;seen.add(k);return true}).slice(0,500);
  },[mode,rw,rh,targetSize,minDepth,et,calcD]);

  const freeRaw=useMemo(()=>{
    if(mode!=="free")return[];const res=[];const range=0.3;const bu=et>1?et:1;
    if(et>1){for(let k=0;k<=16;k++)for(let ow=1;ow<=300;ow+=2){const w=bu*ow*Math.pow(2,k);if(w<freeW*(1-range)||w>freeW*(1+range)||w>200000)continue;for(let oh=1;oh<=300;oh+=2)for(let kh=Math.max(0,k-3);kh<=Math.min(16,k+3);kh++){const h=bu*oh*Math.pow(2,kh);if(h<freeH*(1-range)||h>freeH*(1+range)||h>200000)continue;const md=calcD(w,h);if(md>=minDepth)res.push({width:w,height:h,minDepth:md})}}}
    else{for(let k=9;k<=20;k++)for(let ow=1;ow<=200;ow+=2){const w=ow*Math.pow(2,k);if(w<freeW*(1-range)||w>freeW*(1+range)||w>200000)continue;for(let oh=1;oh<=200;oh+=2){const h=oh*Math.pow(2,k>11?k-2:k);if(h<freeH*(1-range)||h>freeH*(1+range)||h>200000)continue;const md=calcD(w,h);if(md>=minDepth)res.push({width:w,height:h,minDepth:md})}}}
    const seen=new Set();return res.filter(r=>{const k=`${r.width}x${r.height}`;if(seen.has(k))return false;seen.add(k);return true}).slice(0,500);
  },[mode,freeW,freeH,minDepth,et,calcD]);

  const curResults=useMemo(()=>{
    const raw=mode==="ratio"?ratioRaw:mode==="free"?freeRaw:[];const arr=[...raw];
    if(sortField==="size")arr.sort((a,b)=>{const sa=Math.max(a.width,a.height),sb=Math.max(b.width,b.height);return sortDir==="desc"?sb-sa:sa-sb});
    else if(sortField==="depth")arr.sort((a,b)=>sortDir==="desc"?b.minDepth-a.minDepth:a.minDepth-b.minDepth);
    else{if(mode==="ratio")arr.sort((a,b)=>{const ad=Math.abs(Math.max(a.width,a.height)-targetSize),bd=Math.abs(Math.max(b.width,b.height)-targetSize);return Math.abs(ad-bd)<targetSize*0.1?b.minDepth-a.minDepth:ad-bd});
      else arr.sort((a,b)=>{const ad=Math.hypot(a.width-freeW,a.height-freeH),bd=Math.hypot(b.width-freeW,b.height-freeH);return b.minDepth!==a.minDepth&&Math.abs(ad-bd)<Math.hypot(freeW,freeH)*0.05?b.minDepth-a.minDepth:ad-bd})}
    return arr.slice(0,300);
  },[ratioRaw,freeRaw,mode,sortField,sortDir,targetSize,freeW,freeH]);

  const targetResult=useMemo(()=>{
    let best=null,bd=Infinity;
    if(mode==="ratio")for(const r of curResults){const d=Math.abs(Math.max(r.width,r.height)-targetSize);if(d<bd||(d===bd&&r.minDepth>(best?.minDepth||0))){bd=d;best=r}}
    if(mode==="free")for(const r of curResults){const d=Math.hypot(r.width-freeW,r.height-freeH);if(d<bd){bd=d;best=r}}
    return best;
  },[curResults,mode,targetSize,freeW,freeH]);

  // Preview dims — from selected result, matrix cell, or first result
  const step = et > 1 ? et : 512;
  const matrixDims = matrixCell ? { width: (matrixCell.col + 1) * step, height: (matrixCell.row + 1) * step } : null;
  const previewDims = mode==="analyze" ? {width:anaW,height:anaH}
    : mode==="matrix" ? (matrixDims || {width:4096,height:4096})
    : selResult || curResults[0] || {width:4096,height:4096};

  const pDW=calcDW(previewDims.width), pDH=calcDH(previewDims.height);
  const pMD=Math.min(Math.max(pDW,0),Math.max(pDH,0));
  const pML=et>1?Math.min(pMD,10):Math.min(Math.min(gsd(previewDims.width),gsd(previewDims.height)),10);
  useEffect(()=>{if(viewLevel>pML)setViewLevel(Math.max(1,pML))},[pML,viewLevel]);
  const mdOpts=et>1?Array.from({length:8},(_,i)=>({value:String(i+1),label:`≥ ${i+1} 级`})):Array.from({length:12},(_,i)=>({value:String(i+5),label:`≥ ${i+5} 级`}));
  const tiW=et>1&&previewDims.width%et===0?previewDims.width/et:null;
  const tiH=et>1&&previewDims.height%et===0?previewDims.height/et:null;

  return (
    <div style={{ height:"100vh",display:"flex",flexDirection:"column",background:m.bg,fontFamily:m.font,color:m.text,fontSize:13,overflow:"hidden" }}>
      {/* Title Bar */}
      <div style={{ background:m.bg,borderBottom:`1px solid ${m.sep}`,padding:"8px 18px",display:"flex",alignItems:"center",justifyContent:"center",userSelect:"none",position:"relative",flexShrink:0 }}>
        <MSeg options={[{value:"ratio",label:"按比例查找"},{value:"free",label:"自由查找"},{value:"analyze",label:"尺寸分析"},{value:"matrix",label:"矩阵热力图"}]}
          value={mode} onChange={v=>{setMode(v);setSelResult(null);setShowCount(30);setSortField("default")}}/>
        <span style={{ position:"absolute",right:18,fontSize:10,color:m.text3,fontFamily:m.mono }}>v4.0</span>
      </div>

      {/* Body */}
      <div style={{ display:"flex",flex:1,overflow:"hidden",minHeight:0 }}>
        {/* LEFT SIDEBAR */}
        <div style={{ width:320,minWidth:320,borderRight:`1px solid ${m.sep}`,background:"#f0f0f0",overflowY:"auto",padding:12,display:"flex",flexDirection:"column",gap:10 }}>
          <Panel title="Tile 尺寸 Tile Size">
            <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginBottom:8 }}>
              {TILE_PRESETS.map(t=><MBtn key={t} small active={tileSize===t} primary={tileSize===t} onClick={()=>setTileSize(t)}>{t===1?"像素":`${t}px`}</MBtn>)}
              <MBtn small active={tileSize===-1} primary={tileSize===-1} onClick={()=>setTileSize(-1)}>自定义</MBtn>
            </div>
            {tileSize===-1&&<MInput label="Tile" value={custTile} onChange={setCustTile} width={100} suffix="px"/>}
            <div style={{ fontSize:10,color:m.text3,marginTop:6,lineHeight:1.5 }}>
              {et>1?`细分级数 = 画布被 ${et}px tile 铺满后，tile数可递归二分次数`:"像素模式：细分级数 = 尺寸中因子2的幂次"}
            </div>
          </Panel>

          {mode!=="matrix" && (
            <Panel title="搜索参数 Search Parameters">
              {mode==="ratio"&&<>
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:11,color:m.text2,marginBottom:5 }}>宽高比</div>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:3 }}>
                    {ASPECT_RATIOS.map((r,i)=><button key={i} onClick={()=>setSelRatio(i)} style={{
                      padding:"2px 7px",borderRadius:4,fontSize:10,fontFamily:m.mono,
                      background:selRatio===i?m.accent:"#e8e8e8",color:selRatio===i?"#fff":m.text,
                      border:selRatio===i?"none":"1px solid #d0d0d0",cursor:"pointer",fontWeight:selRatio===i?600:400
                    }}>{r.label}</button>)}
                  </div>
                </div>
                {isCust&&<div style={{ display:"flex",gap:6,marginBottom:8,alignItems:"center" }}>
                  <MInput label="W" value={custW} onChange={setCustW} width={70}/>
                  <span style={{ color:m.text3 }}>:</span>
                  <MInput label="H" value={custH} onChange={setCustH} width={70}/>
                </div>}
                <MSlider label="目标尺寸" value={targetSize} min={1024} max={131072} step={et>1?et:512} onChange={setTargetSize} displayValue={targetSize} suffix="px"/>
                <div style={{ height:6 }}/>
                <MSel label="最低细分" value={String(minDepth)} onChange={v=>setMinDepth(parseInt(v))} options={mdOpts}/>
              </>}
              {mode==="free"&&<>
                <div style={{ display:"flex",gap:6,marginBottom:8,alignItems:"center",flexWrap:"wrap" }}>
                  <MInput label="宽" value={freeW} onChange={setFreeW} width={110} suffix="px"/>
                  <span style={{ color:m.text3 }}>×</span>
                  <MInput label="高" value={freeH} onChange={setFreeH} width={110} suffix="px"/>
                </div>
                <MSel label="最低细分" value={String(minDepth)} onChange={v=>setMinDepth(parseInt(v))} options={mdOpts}/>
              </>}
              {mode==="analyze"&&<div style={{ display:"flex",gap:6,alignItems:"center" }}>
                <MInput label="宽" value={anaW} onChange={setAnaW} width={110} suffix="px"/>
                <span style={{ color:m.text3 }}>×</span>
                <MInput label="高" value={anaH} onChange={setAnaH} width={110} suffix="px"/>
              </div>}
            </Panel>
          )}

          {mode==="matrix"&&(
            <Panel title="矩阵导航 Matrix Navigation">
              <div style={{ fontSize:11,color:m.text2,lineHeight:1.8 }}>
                <div><strong>滚轮</strong> · 缩放矩阵</div>
                <div><strong>拖拽</strong> · 平移视图</div>
                <div><strong>点击</strong> · 选中格子查看详情</div>
                <div style={{ marginTop:6,fontSize:10,color:m.text3 }}>
                  X轴 = 画布宽度，Y轴 = 画布高度<br/>
                  每格代表一个宽高组合<br/>
                  颜色按细分深度着色<br/>
                  <span style={{ color:"#d32f2f" }}>红色数字</span> = 纯2的幂尺寸<br/>
                  对角线 = 正方形尺寸<br/>
                  步进: {step}px · 无分辨率上限
                </div>
              </div>
            </Panel>
          )}

          <Panel title="主图叠加 Source Image Overlay">
            <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:8 }}>
              <MBtn onClick={()=>fileRef.current?.click()} primary small>📁 导入主图</MBtn>
              {image&&<MBtn onClick={()=>{setImage(null);setImgName("")}} small>✕ 清除</MBtn>}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display:"none" }}/>
            </div>
            {imgName&&<div style={{ fontSize:10,color:m.text2,marginBottom:6,fontFamily:m.mono }}>🖼 {imgName} {image?`(${image.naturalWidth}×${image.naturalHeight})`:""}</div>}
            <MSlider label="透明度" value={imgOp} min={0} max={1} step={0.05} onChange={setImgOp} displayValue={Math.round(imgOp*100)} suffix="%"/>
            <div style={{ height:6 }}/>
            <div style={{ display:"flex",alignItems:"center",gap:6 }}>
              <span style={{ fontSize:12,color:m.text,minWidth:55 }}>适配方式</span>
              <MSeg options={[{value:"width",label:"适配宽度"},{value:"height",label:"适配高度"},{value:"cover",label:"填满"}]} value={imgFit} onChange={setImgFit}/>
            </div>
          </Panel>

          <Panel title="细分等级 Subdivision Tiers">
            <div style={{ display:"flex",flexDirection:"column",gap:3 }}>
              {getTierThresholds(et).map(({tier,min,desc})=>{const t=getDepthTier(min||0,et);return(
                <div key={tier} style={{ display:"flex",alignItems:"center",gap:6,fontSize:10 }}>
                  <span style={{ width:18,height:16,borderRadius:3,background:t.bg,color:t.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:9,fontFamily:m.mono }}>{tier}</span>
                  <span style={{ color:m.text2,flex:1 }}>{desc}</span>
                  <span style={{ fontFamily:m.mono,color:m.text3 }}>≥{min}级</span>
                </div>)})}
            </div>
          </Panel>
        </div>

        {/* CENTER: Results (ratio & free modes only) */}
        {(mode==="ratio"||mode==="free")&&(
          <div style={{ width:et>1?530:470,minWidth:400,borderRight:`1px solid ${m.sep}`,display:"flex",flexDirection:"column",background:"#fafafa" }}>
            <div style={{ padding:"6px 10px",borderBottom:`1px solid ${m.sep}`,background:"#f5f5f5",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,color:m.text2 }}>
              <span>找到 <strong style={{ color:m.text }}>{curResults.length}</strong> 个候选{mode==="ratio"&&` · ${rw}:${rh}`}{et>1&&<span style={{ color:"#e8710a" }}> · tile {et}px</span>}</span>
              <span style={{ fontFamily:m.mono,fontSize:9 }}>{sortField!=="default"?`按${sortField==="size"?"尺寸":"等级"}${sortDir==="desc"?"↓":"↑"}`:"默认排序"}</span>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:et>1?"28px 155px 54px 58px 50px 80px 1fr":"28px 155px 54px 58px 50px 1fr",gap:5,padding:"5px 10px",fontSize:9,fontWeight:600,color:m.text3,borderBottom:`1px solid ${m.sep}`,background:"#f0f0f0" }}>
              <span style={{ textAlign:"center" }}>#</span>
              <SortHeader label="尺寸" field="size" sf={sortField} sd={sortDir} onSort={handleSort}/>
              <SortHeader label="等级" field="depth" sf={sortField} sd={sortDir} onSort={handleSort}/>
              <span style={{ textAlign:"right" }}>像素</span><span style={{ textAlign:"right" }}>深度</span>
              {et>1&&<span style={{ textAlign:"right" }}>Tile数</span>}<span>细分链</span>
            </div>
            <div style={{ flex:1,overflowY:"auto" }}>
              {curResults.slice(0,showCount).map((r,i)=><ResultRow key={`${r.width}x${r.height}`} width={r.width} height={r.height}
                isSelected={selResult?.width===r.width&&selResult?.height===r.height}
                isTarget={targetResult&&targetResult.width===r.width&&targetResult.height===r.height}
                onClick={()=>setSelResult(r)} index={i} ts={et}/>)}
              {curResults.length>showCount&&<div style={{ padding:10,textAlign:"center" }}><MBtn onClick={()=>setShowCount(showCount+30)} small>加载更多 ({curResults.length-showCount})</MBtn></div>}
              {curResults.length===0&&<div style={{ padding:30,textAlign:"center",color:m.text3 }}>未找到符合条件的候选尺寸</div>}
            </div>
            <div style={{ padding:"3px 10px",borderTop:`1px solid ${m.sep}`,background:"#f0f0f0",fontSize:9,color:m.text3,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span>Total: {curResults.length}</span>
              <span style={{ display:"flex",alignItems:"center",gap:4 }}><span style={{ width:10,height:10,background:m.targetBg,border:`1px solid ${m.targetBd}`,borderRadius:2 }}/>=最接近目标</span>
              <span>Showing: {Math.min(showCount,curResults.length)}</span>
            </div>
          </div>
        )}

        {/* MATRIX MODE */}
        {mode==="matrix"&&(
          <div style={{ flex:1,display:"flex",flexDirection:"column",background:"#f4f4f4",overflow:"hidden" }}>
            <div style={{ flex:1,position:"relative" }}>
              <MatrixView effectiveTile={et} selectedCell={matrixCell} onSelectCell={setMatrixCell}/>
            </div>
            {/* Cell detail bar / default info bar */}
            {matrixCell ? (()=>{
              const w=(matrixCell.col+1)*step, h=(matrixCell.row+1)*step;
              const dw=calcDW(w),dh=calcDH(h),md=Math.min(Math.max(dw,0),Math.max(dh,0));
              return (
                <div style={{ padding:"10px 14px",borderTop:`1px solid ${m.sep}`,background:"#f0f0f0",flexShrink:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:8,flexWrap:"wrap" }}>
                    <span style={{ fontFamily:m.mono,fontSize:16,fontWeight:700 }}>{w} × {h}</span>
                    <DBadge depth={md} ts={et}/>
                    <span style={{ fontSize:11,color:m.text2 }}>{(w*h/1e6).toFixed(1)} MP · 比例 {(w/h).toFixed(4)}</span>
                    {et>1&&w%et===0&&h%et===0&&<span style={{ fontSize:11,color:"#e8710a",fontFamily:m.mono }}>{w/et}×{h/et} tiles</span>}
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                    <div style={{ padding:8,background:"#fff",borderRadius:6,border:`1px solid ${m.sep}` }}>
                      <div style={{ fontSize:9,color:m.text3,marginBottom:3 }}>宽 {w}px · {dw>=0?dw:"N/A"}级{et>1&&w%et===0?` · ${w/et} tiles`:""}</div>
                      <FullChain value={w} ts={et}/>
                    </div>
                    <div style={{ padding:8,background:"#fff",borderRadius:6,border:`1px solid ${m.sep}` }}>
                      <div style={{ fontSize:9,color:m.text3,marginBottom:3 }}>高 {h}px · {dh>=0?dh:"N/A"}级{et>1&&h%et===0?` · ${h/et} tiles`:""}</div>
                      <FullChain value={h} ts={et}/>
                    </div>
                  </div>
                </div>);
            })() : (
              <div style={{ padding:"10px 14px",borderTop:`1px solid ${m.sep}`,background:"#f0f0f0",flexShrink:0 }}>
                <div style={{ display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",fontSize:11,color:m.text2 }}>
                  <span>模式: <strong style={{ color:m.text }}>矩阵热力图</strong></span>
                  <span>步进: <strong style={{ color:m.text,fontFamily:m.mono }}>{step}px</strong></span>
                  {et>1&&<span>Tile: <strong style={{ color:"#e8710a",fontFamily:m.mono }}>{et}px</strong></span>}
                  <span style={{ color:m.text3 }}>点击矩阵中的格子查看宽高细分详情</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RIGHT: Preview (ratio, free, analyze modes) */}
        {mode!=="matrix"&&(
          <div style={{ flex:1,display:"flex",flexDirection:"column",background:"#f4f4f4",overflow:"hidden",minWidth:500 }}>
            <div style={{ padding:"7px 14px",borderBottom:`1px solid ${m.sep}`,background:"#f0f0f0",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",flexShrink:0 }}>
              <span style={{ fontSize:11,fontWeight:600,color:m.text2 }}>递归细分预览</span>
              <span style={{ fontFamily:m.mono,fontSize:13,fontWeight:700 }}>{previewDims.width} × {previewDims.height}</span>
              <DBadge depth={pMD} ts={et}/>
              <span style={{ fontFamily:m.mono,fontSize:10,color:m.text3 }}>{(previewDims.width*previewDims.height/1e6).toFixed(1)} MP</span>
              {et>1&&tiW&&tiH&&<span style={{ fontFamily:m.mono,fontSize:10,color:"#e8710a" }}>{tiW}×{tiH} tiles</span>}
            </div>
            <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,gap:14,minHeight:0,overflowY:"auto" }}>
              <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",width:"100%",minHeight:300 }}>
                <GridPreview width={previewDims.width} height={previewDims.height} level={viewLevel} cW={600} cH={480} image={image} imageOpacity={imgOp} imageFit={imgFit} tileSize={et}/>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <MBtn small onClick={()=>setViewLevel(Math.max(1,viewLevel-1))}>−</MBtn>
                <span style={{ fontFamily:m.mono,fontSize:14,fontWeight:600,minWidth:28,textAlign:"center" }}>L{viewLevel}</span>
                <MBtn small onClick={()=>setViewLevel(Math.min(pML,viewLevel+1))}>+</MBtn>
                <span style={{ fontSize:10,color:m.text3 }}>
                  {Math.pow(2,viewLevel)}×{Math.pow(2,viewLevel)} · 每格 {Math.round(previewDims.width/Math.pow(2,viewLevel))}×{Math.round(previewDims.height/Math.pow(2,viewLevel))}px
                  {et>1&&tiW&&<span style={{ color:"#e8710a" }}> · {Math.round(tiW/Math.pow(2,viewLevel))}×{Math.round(tiH/Math.pow(2,viewLevel))} tiles/格</span>}
                </span>
              </div>
              <div style={{ display:"flex",gap:3,flexWrap:"wrap",justifyContent:"center",maxWidth:600 }}>
                {Array.from({length:pML}).map((_,i)=>{const lv=i+1;return(
                  <button key={lv} onClick={()=>setViewLevel(lv)} style={{
                    padding:"2px 7px",borderRadius:4,fontSize:9,fontFamily:m.mono,
                    background:viewLevel===lv?m.accent:"#e8e8e8",color:viewLevel===lv?"#fff":m.text2,
                    border:viewLevel===lv?"none":"1px solid #d0d0d0",cursor:"pointer"
                  }}>L{lv} ({Math.round(previewDims.width/Math.pow(2,lv))}×{Math.round(previewDims.height/Math.pow(2,lv))})</button>)})}
              </div>
            </div>
            <div style={{ padding:"10px 14px",borderTop:`1px solid ${m.sep}`,background:"#f0f0f0",flexShrink:0 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                <div style={{ padding:10,background:"#fff",borderRadius:6,border:`1px solid ${m.sep}` }}>
                  <div style={{ fontSize:10,color:m.text3,marginBottom:4 }}>宽 {previewDims.width}px · {pDW>=0?pDW:"N/A"}级{et>1&&tiW?` · ${tiW} tiles`:""}</div>
                  <FullChain value={previewDims.width} ts={et}/>
                </div>
                <div style={{ padding:10,background:"#fff",borderRadius:6,border:`1px solid ${m.sep}` }}>
                  <div style={{ fontSize:10,color:m.text3,marginBottom:4 }}>高 {previewDims.height}px · {pDH>=0?pDH:"N/A"}级{et>1&&tiH?` · ${tiH} tiles`:""}</div>
                  <FullChain value={previewDims.height} ts={et}/>
                </div>
              </div>
              <div style={{ marginTop:6,fontSize:10,color:m.text2,display:"flex",gap:14,flexWrap:"wrap" }}>
                <span>同步细分: <strong>{pMD}级</strong></span>
                <span>比例: <strong>{(previewDims.width/previewDims.height).toFixed(4)}</strong></span>
                {et>1&&<span>Tile: <strong>{et}px</strong></span>}
                {image&&<span>主图: <strong>{image.naturalWidth}×{image.naturalHeight}</strong></span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
