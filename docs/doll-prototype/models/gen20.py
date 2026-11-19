"""20 โมเดลตัวละคร avatar ต่างสัดส่วน/เส้น/เงา/ตา/ผม — ให้ user เลือก (18 พ.ย. 2026)
ตัวละครของเราเองทั้งหมด สร้างจากพารามิเตอร์ ไม่ลอกจากเกมใด"""
import os, math
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "out"); os.makedirs(OUT, exist_ok=True)

def hx(c): c = c.lstrip("#"); return tuple(int(c[i:i+2], 16) for i in (0, 2, 4)) + (255,)
def mix(a, b, t):
    a = hx(a) if isinstance(a, str) else a; b = hx(b) if isinstance(b, str) else b
    return tuple(round(a[i]+(b[i]-a[i])*t) for i in range(3)) + (255,)

class G:
    def __init__(s, w, h): s.w, s.h = w, h; s.L = [[None]*w for _ in range(h)]; s.fix = {}
    def put(s, x, y, lab):
        if 0 <= x < s.w and 0 <= y < s.h: s.L[y][x] = lab
    def ell(s, cx, cy, rx, ry, lab):
        for y in range(int(cy-ry)-1, int(cy+ry)+2):
            for x in range(int(cx-rx)-1, int(cx+rx)+2):
                if ((x+.5-cx)/rx)**2 + ((y+.5-cy)/ry)**2 <= 1: s.put(x, y, lab)
    def rect(s, x0, y0, x1, y1, lab):
        for y in range(round(y0), round(y1)+1):
            for x in range(round(x0), round(x1)+1): s.put(x, y, lab)
    def trap(s, y0, y1, xl0, xr0, xl1, xr1, lab):   # สี่เหลี่ยมคางหมู (บน→ล่าง)
        for y in range(round(y0), round(y1)+1):
            t = (y-y0)/max(1, y1-y0)
            s.rect(xl0+(xl1-xl0)*t, y, xr0+(xr1-xr0)*t, y, lab)
    def px(s, x, y, c): s.fix[(x, y)] = c

def render(g, pal, outline, shading, ink):
    W, H, L = g.w, g.h, g.L
    out = [[None]*W for _ in range(H)]
    filled = lambda x, y: 0 <= x < W and 0 <= y < H and L[y][x] is not None
    for y in range(H):
        for x in range(W):
            lab = L[y][x]
            if lab is None: continue
            base = pal[lab]; z = ZORDER.get(lab, 5)
            n4 = [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]
            edge_out = any(not filled(*p) for p in n4)
            edge_in = any(filled(*p) and L[p[1]][p[0]] != lab and ZORDER.get(L[p[1]][p[0]], 5) < z for p in n4)
            if outline != "none" and edge_out:
                out[y][x] = hx(ink) if outline in ("black", "brown", "sticker") else mix(base, "#1A1028", .62); continue
            if outline != "none" and edge_in and outline != "thin":
                out[y][x] = mix(base, "#1A1028", .5); continue
            same = lambda dx, dy: filled(x+dx, y+dy) and L[y+dy][x+dx] == lab
            c = hx(base)
            dark = "#B85A6A" if lab in ("skin", "hand") else "#3E2A66"
            if shading == "flat":
                pass
            elif shading == "cel":
                if not same(2, 0) or not same(1, 2): c = mix(base, dark, .28)
            elif shading == "soft":
                # ไล่ 4 เฉดตามระยะจากขอบขวา
                d = next((k for k in range(1, 6) if not same(k, 0)), 6)
                c = mix(base, dark, {1: .34, 2: .22, 3: .1}.get(d, 0))
                if not same(-1, -1) and not same(0, -1): c = mix(base, "#FFF6E6", .35)
            elif shading == "rim":
                if not same(1, 0): c = mix(base, dark, .3)
                elif not same(-1, 0) or not same(0, -1): c = mix(base, "#FFF6E6", .35)
            out[y][x] = c
    if outline == "sticker":     # ขอบขาวหนารอบนอก
        add = []
        for y in range(H):
            for x in range(W):
                if out[y][x] is None and any(0 <= x+dx < W and 0 <= y+dy < H and out[y+dy][x+dx] not in (None, "W")
                                             for dx in (-2, -1, 0, 1, 2) for dy in (-2, -1, 0, 1, 2) if abs(dx)+abs(dy) <= 2):
                    add.append((x, y))
        for x, y in add: out[y][x] = (255, 255, 255, 255)
    for (x, y), c in g.fix.items():
        if 0 <= x < W and 0 <= y < H: out[y][x] = hx(c)
    return out

ZORDER = {"hairb": 0, "cape": 0, "wing": 0, "leg": 1, "boot": 2, "pants": 2, "body": 2, "skirt": 3, "top": 3,
          "coat": 4, "arm": 5, "sleeve": 5, "hand": 6, "neck": 2, "skin": 6, "hair": 9, "hat": 10, "item": 11}

def build(p):
    """p: พารามิเตอร์ของโมเดล"""
    W = p.get("W", 44); Hh = p["H"]
    g = G(W, Hh)
    cx = W/2
    head_h = p["head"]                 # ความสูงหัว (ไม่รวมผมฟู)
    top = 3
    hy = top + head_h/2 + 1           # ศูนย์กลางหัว
    body_top = top + head_h + p.get("neck", 1)
    torso = p["torso"]; legs = p["legs"]; tw = p["tw"]; lw = p.get("lw", 2.5); gap = p.get("gap", 2.5)
    hw = p.get("hw", head_h*0.5)
    # ผมหลัง
    hs = p.get("hair", "bob")
    if hs in ("long", "twin"):
        if hs == "long": g.trap(hy-1, hy+head_h*0.4+torso*0.8, cx-hw-2, cx+hw+2, cx-hw-3, cx+hw+3, "hairb")
        else:
            g.ell(cx-hw-3, hy+2, 3, head_h*0.7, "hairb"); g.ell(cx+hw+3, hy+2, 3, head_h*0.7, "hairb")
    if p.get("cape"): g.trap(body_top+1, body_top+torso+legs*0.7, cx-tw-1, cx+tw+1, cx-tw-4, cx+tw+4, "cape")
    if p.get("wings"):
        for sgn in (-1, 1):
            g.trap(body_top-2, body_top+torso*0.8, cx+sgn*(tw+1), cx+sgn*(tw+1), cx+sgn*(tw+9), cx+sgn*(tw+3), "wing") if False else None
            for k in range(8):
                g.rect(cx+sgn*(tw+1+k) if sgn > 0 else cx-(tw+1+k), body_top-3+k*0.5, cx+sgn*(tw+1+k) if sgn > 0 else cx-(tw+1+k), body_top+torso*0.6-k, "wing")
    # ขา
    ly0 = body_top + torso
    for sgn in (-1, 1):
        lx = cx + sgn*(gap/2 + lw/2)
        spread = p.get("spread", 0)*sgn
        g.trap(ly0, ly0+legs, lx-lw/2, lx+lw/2, lx-lw/2+spread, lx+lw/2+spread, "leg")
        bh = p.get("boot", 2)
        g.rect(lx-lw/2+spread-(1 if bh > 3 else 0), ly0+legs-bh+1, lx+lw/2+spread+(1 if bh > 3 else 0)+ (0), ly0+legs+1, "boot")
    # ลำตัว
    waist = p.get("waist", tw)
    g.trap(body_top, body_top+torso, cx-tw, cx+tw-1, cx-waist, cx+waist-1, "top")
    if p.get("skirt"):
        g.trap(body_top+torso-2, body_top+torso+p["skirt"], cx-waist, cx+waist-1, cx-waist-3, cx+waist+2, "skirt")
    else:
        g.trap(body_top+torso-1, body_top+torso+2, cx-waist, cx+waist-1, cx-waist, cx+waist-1, "pants")
    if p.get("coat"):
        g.trap(body_top, body_top+torso+p["coat"], cx-tw, cx-tw+2, cx-waist-1, cx-tw+3, "coat")
        g.trap(body_top, body_top+torso+p["coat"], cx+tw-3, cx+tw-1, cx+tw-4, cx+waist, "coat")
    # แขน
    arm = p.get("arm", torso*0.95); aw = p.get("aw", 2)
    for sgn in (-1, 1):
        ax0 = cx + sgn*(tw + aw/2 - 0.5) - (0 if sgn > 0 else 0)
        ax1 = ax0 + sgn*p.get("armout", 1)
        g.trap(body_top+1, body_top+arm, ax0-aw/2, ax0+aw/2, ax1-aw/2, ax1+aw/2, "sleeve")
        g.ell(ax1, body_top+arm+1, aw/2+0.6, 1.4, "hand")
    g.rect(cx-1.5, body_top-1, cx+0.5, body_top, "neck")
    # หัว
    g.ell(cx-0.5, hy, hw, head_h/2, "skin")
    # ผมหน้า
    cap_h = head_h*p.get("fringe", 0.45)
    g.ell(cx-0.5, hy-head_h*0.12, hw+1.2, head_h/2+0.6, "hairb") if hs != "bald" else None
    g.ell(cx-0.5, hy, hw, head_h/2, "skin")
    for x in range(int(cx-hw-1), int(cx+hw+1)):
        depth = top + cap_h + (2 if (x // 2) % 2 == 0 else 0) if hs != "spiky" else top + cap_h + (3 if x % 3 == 0 else 0)
        for y in range(top-1, int(depth)+1):
            if g.L[y][x] in ("skin", "hairb") or y < hy - head_h/2 + 1: g.put(x, y, "hair")
    if hs == "spiky":
        for k, dx in enumerate(range(-int(hw), int(hw)+1, 3)):
            for t in range(4): g.put(int(cx+dx+(t if k % 2 else -t)//2), top-1-t, "hair")
    if hs in ("bob", "long", "twin"):
        for sgn in (-1, 1):
            sx = int(cx-0.5+sgn*(hw-0.5))
            g.rect(sx-1 if sgn < 0 else sx, hy-2, sx if sgn < 0 else sx+1, hy+head_h*0.35, "hair")
    if p.get("hat") == "witch":
        g.trap(top-9, top-1, cx-1, cx, cx-hw-1, cx+hw, "hat"); g.rect(cx-hw-4, top, cx+hw+3, top+1, "hat")
    elif p.get("hat") == "cap":
        g.trap(top-1, top+2, cx-hw, cx+hw-1, cx-hw-1, cx+hw+3, "hat")
    elif p.get("hat") == "ears":
        for sgn in (-1, 1): g.trap(top-9, top, cx+sgn*3-1, cx+sgn*3+1, cx+sgn*3-1.5, cx+sgn*3+1.5, "hat")
    if p.get("item") == "staff":
        sx = int(cx+tw+3+p.get("armout", 1))
        g.rect(sx, body_top-6, sx, body_top+torso+legs, "item"); g.ell(sx, body_top-7, 1.6, 1.6, "item")
    # ตา
    ey = int(hy + head_h*p.get("eyey", 0.12)); ex = p.get("eyex", 2.5)
    et = p.get("eyes", "anime"); iris = p.get("iris", "#3A7BD5")
    for sgn in (-1, 1):
        x0 = int(cx-0.5 + sgn*ex) - (1 if sgn < 0 else 0)
        if et == "dot":
            g.px(x0, ey, "#2A1820"); g.px(x0, ey+1, "#2A1820")
        elif et == "bar":
            for dy in range(3): g.px(x0, ey+dy, "#2A1820")
        elif et == "anime":
            for dy in range(4):
                for dx in range(2): g.px(x0+dx, ey+dy, "#2A1820" if dy in (0,) else iris)
            g.px(x0, ey+1, "#FFFFFF")
        elif et == "big":
            for dy in range(5):
                for dx in range(3): g.px(x0+dx-1, ey+dy, "#2A1820" if dy == 0 or dx == (2 if sgn > 0 else 0) else iris)
            g.px(x0, ey+1, "#FFFFFF"); g.px(x0-1 if sgn < 0 else x0+1, ey+4, "#FFFFFF")
        elif et == "smile":
            g.px(x0-1, ey+1, "#2A1820"); g.px(x0, ey, "#2A1820"); g.px(x0+1, ey+1, "#2A1820")
        elif et == "sharp":
            g.px(x0-1 if sgn < 0 else x0+1, ey-1, "#2A1820")
            for dx in range(2): g.px(x0+dx-(1 if sgn < 0 else 0), ey, "#2A1820"); g.px(x0+dx-(1 if sgn < 0 else 0), ey+1, iris)
    if p.get("mouth", True):
        g.px(int(cx-0.5), int(ey + head_h*0.28), p.get("mouthc", "#C0605A"))
    if p.get("blush", True) and et != "dot":
        g.px(int(cx-0.5-ex-1.5), int(ey+3), "#F2A0A0"); g.px(int(cx-0.5+ex+1.5), int(ey+3), "#F2A0A0")
    return g

C = lambda **k: k
PALS = {
 "pharm": dict(hair="#2F2A3A", hairb="#1F1B28", skin="#FFDCC2", hand="#FFDCC2", neck="#EDB596", top="#F6F7FB", coat="#F6F7FB",
               sleeve="#F6F7FB", pants="#2E3550", leg="#2E3550", boot="#4A3428", skirt="#2E3550", hat="#2B2B3A", item="#8A5A3C",
               cape="#7A1E30", wing="#FFFFFF"),
}
def pal(**over): d = dict(PALS["pharm"]); d.update(over); return d

MODELS = [
 ("ตัวจิ๋ว 1.5 หัว",        C(H=30, head=14, hw=7.5, torso=6, legs=4, tw=4, eyes="dot", hair="bob", lw=2), pal(), "brown", "flat"),
 ("chibi กลม 2 หัว",        C(H=40, head=17, hw=8.5, torso=9, legs=7, tw=5, eyes="anime", hair="bob"), pal(hair="#7A4B2A", hairb="#5A3620", top="#4F79B0", sleeve="#4F79B0"), "brown", "cel"),
 ("สติกเกอร์ 2.5 หัว",      C(H=46, head=16, hw=7.5, torso=11, legs=10, tw=5, eyes="anime", hair="long"), pal(hair="#F4A8C4", hairb="#D47AA0", top="#FFFFFF", sleeve="#FFFFFF", skirt="#E86A8A", leg="#FFE6D4"), "sticker", "cel"),
 ("chibi ตาโต",              C(H=44, head=19, hw=9, torso=10, legs=8, tw=5, eyes="big", hair="twin", eyey=0.1), pal(hair="#F2D27A", hairb="#C9A04A", top="#F7B6C8", sleeve="#F7B6C8", skirt="#E86A8A", leg="#FFE6D4", boot="#E86A8A"), "brown", "soft"),
 ("หัวโตตัวสั้น บูทใหญ่",  C(H=46, head=18, hw=9, torso=8, legs=11, tw=5, eyes="big", hair="long", boot=5, eyey=0.18, skirt=4), pal(hair="#6BB8E8", hairb="#4A93C4", top="#F6F0E2", sleeve="#F6F0E2", skirt="#34406E", leg="#FFFFFF", boot="#8A5A3C"), "brown", "soft"),
 ("RPG 2.5 หัว ยืนกางขา",   C(H=48, head=17, hw=8, torso=12, legs=12, tw=6, eyes="anime", hair="spiky", spread=1.5, armout=2), pal(hair="#D9533F", hairb="#B03D2C", top="#3B4A6B", sleeve="#3B4A6B"), "black", "cel"),
 ("ฮีโร่ผ้าคลุม",           C(H=50, head=16, hw=7.5, torso=13, legs=14, tw=6, eyes="sharp", hair="spiky", cape=True, iris="#D93A4A"), pal(hair="#E0E0F0", hairb="#A6A4C4", top="#2A2638", sleeve="#2A2638", pants="#1E1B2A", leg="#1E1B2A", boot="#1E1B2A"), "black", "cel"),
 ("แม่มดหมวกแหลม",          C(H=54, head=16, hw=7.5, torso=12, legs=12, tw=5, eyes="anime", hair="long", hat="witch", skirt=6, item="staff", iris="#9A4AD0"), pal(hair="#9A7AD0", hairb="#7356A8", top="#3B3168", sleeve="#3B3168", skirt="#3B3168", hat="#3B3168", leg="#2A2244", boot="#2A2244"), "brown", "soft"),
 ("หูกระต่าย",              C(H=52, head=16, hw=7.5, torso=12, legs=13, tw=5, eyes="big", hair="long", hat="ears", skirt=5), pal(hair="#F4A8C4", hairb="#D47AA0", hat="#FFFFFF", top="#FFFFFF", sleeve="#FFFFFF", skirt="#FFFFFF", leg="#FFE6D4", boot="#E86A8A"), "selout", "soft"),
 ("MMO เพรียว 3 หัว",       C(H=56, head=16, hw=6.5, torso=14, legs=16, tw=5, waist=4, eyes="big", hair="bob", coat=6), pal(), "selout", "soft"),
 ("ตัวสูง 4 หัว",           C(H=62, head=14, hw=6, torso=17, legs=22, tw=6, waist=4, eyes="anime", hair="bob", coat=8), pal(hair="#383452", hairb="#24203A"), "brown", "soft"),
 ("ฮีโร่ 5 หัว",            C(H=70, head=13, hw=5.5, torso=20, legs=27, tw=7, waist=5, eyes="sharp", hair="spiky", cape=True, iris="#3A7BD5"), pal(hair="#2F2A3A", top="#3B4A6B", sleeve="#3B4A6B", cape="#C93A4A"), "black", "cel"),
 ("หมวกแก๊ป สตรีท",          C(H=48, head=17, hw=8, torso=12, legs=12, tw=6, eyes="smile", hair="bob", hat="cap"), pal(hat="#E0524A", top="#F6A04D", sleeve="#F6A04D", pants="#3B4A6B", leg="#3B4A6B", boot="#F2F2F2"), "brown", "cel"),
 ("ไร้เส้น โทนนุ่ม",         C(H=46, head=17, hw=8.5, torso=11, legs=10, tw=5, eyes="anime", hair="long", skirt=4), pal(hair="#C9A0DC", hairb="#A07AB8", top="#BFE3F2", sleeve="#BFE3F2", skirt="#9EC6E0", leg="#FFE6D4", boot="#9EC6E0"), "none", "soft"),
 ("เส้นบาง แสงขอบ",          C(H=50, head=16, hw=7.5, torso=13, legs=13, tw=5, eyes="anime", hair="spiky"), pal(hair="#4FA36A", hairb="#357A4E", top="#2E2A40", sleeve="#2E2A40", pants="#2E2A40", leg="#2E2A40"), "thin", "rim"),
 ("8-bit คลาสสิก",           C(H=36, head=12, hw=6, torso=10, legs=8, tw=5, eyes="dot", hair="bob", lw=2, mouth=False, blush=False), pal(hair="#7A4B2A", top="#E0524A", sleeve="#E0524A", pants="#3B4A6B", leg="#3B4A6B"), "black", "flat"),
 ("ตาปิดยิ้ม",               C(H=44, head=17, hw=8.5, torso=10, legs=9, tw=5, eyes="smile", hair="twin", skirt=4), pal(hair="#7A4B2A", hairb="#5A3620", top="#FFD86A", sleeve="#FFD86A", skirt="#F6A04D", leg="#FFE6D4", boot="#E0524A"), "brown", "cel"),
 ("ปีกนางฟ้า",               C(H=52, head=16, hw=7.5, torso=12, legs=13, tw=5, eyes="big", hair="long", wings=True, skirt=6), pal(hair="#F2D27A", hairb="#C9A04A", top="#FFFFFF", sleeve="#FFFFFF", skirt="#FFFFFF", leg="#FFE6D4", boot="#F7B6C8", wing="#FFFFFF"), "brown", "soft"),
 ("ปีกปีศาจ ดาร์ก",          C(H=52, head=16, hw=7.5, torso=13, legs=13, tw=6, eyes="sharp", hair="spiky", wings=True, iris="#D93A4A"), pal(hair="#E0E0F0", hairb="#A6A4C4", top="#2A2638", sleeve="#2A2638", pants="#1E1B2A", leg="#1E1B2A", boot="#1E1B2A", wing="#3A2E4E"), "black", "soft"),
 ("หน้าตรงเพรียว ไม่มีปาก",  C(H=58, head=15, hw=6, torso=15, legs=18, tw=5, waist=4, eyes="bar", hair="long", mouth=False, skirt=7), pal(hair="#2F2A3A", hairb="#1F1B28", top="#8C2433", sleeve="#8C2433", skirt="#2A2638", leg="#FFE6D4", boot="#2A2638"), "selout", "soft"),
]

ims = []
for i, (name, p, pl, ol, sh) in enumerate(MODELS, 1):
    g = build(p)
    px = render(g, pl, ol, sh, "#2A1820" if ol == "black" else "#3B2418")
    im = Image.new("RGBA", (g.w, g.h), (0, 0, 0, 0))
    for y in range(g.h):
        for x in range(g.w):
            if px[y][x]: im.putpixel((x, y), px[y][x])
    bbox = im.getbbox(); im = im.crop((0, max(0, bbox[1]-2), g.w, g.h))
    im.save(os.path.join(OUT, f"m{i:02d}.png")); ims.append((name, im))
S = 4; cw, ch = 44*S, 72*S
sheet = Image.new("RGBA", (5*(cw+10)+10, 4*(ch+10)+10), (232, 238, 250, 255))
for k, (name, im) in enumerate(ims):
    r, c = divmod(k, 5)
    big = im.resize((im.width*S, im.height*S), Image.NEAREST)
    sheet.alpha_composite(big, (10 + c*(cw+10) + (cw-big.width)//2, 10 + r*(ch+10) + ch - big.height))
sheet.save(os.path.join(OUT, "_sheet.png")); print("ok", len(ims))

