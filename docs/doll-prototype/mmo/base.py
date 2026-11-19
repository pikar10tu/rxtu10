"""RxTU10 doll — แนว MMO หน้าตรง (เลือก 18 พ.ย. 2026) · ตัวฐานฉบับเกลา
รัน: python docs/doll-prototype/mmo/base.py  → out/ ข้างไฟล์นี้

กรอบ 40x66 · ตัวกว้าง 32 วางที่ OX=4 · วาดครึ่งซ้าย 16 คอลัมน์ (แกนสะท้อนระหว่างคอลัมน์ 15|16) · แถวอ้างอิงบวก TOP=8
ตัวอักษร: o เส้น · S s ผิว/เงาผิว · H h L ผม/เงา/วาว · U u ชุดชั้นใน/เงา · B b รองเท้า · x X ลาย/ประกาย (ไม่ไล่เงา)
เส้น o ที่อยู่ในตัว = สีเข้มของวัสดุข้างเคียง · ที่ติดพื้นว่าง = เส้นนอกน้ำตาลเข้ม
เงา: ไล่ 4 เฉดตามแนวนอนของแต่ละชิ้น (แสงซ้ายบน) · ผิวเงาอมชมพู · ผ้าเงาอมม่วง
"""
import os, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out"); os.makedirs(OUT, exist_ok=True)
W, H, TOP, OX = 40, 66, 8, 4
OUTLINE = "#3A2028"
FLAT = set("xX")

def hx(c):
    c = c.lstrip("#"); return tuple(int(c[i:i+2], 16) for i in (0, 2, 4)) + (255,)
def mix(a, b, t):
    a, b = hx(a) if isinstance(a, str) else a, hx(b) if isinstance(b, str) else b
    return tuple(round(a[i] + (b[i]-a[i])*t) for i in range(3)) + (255,)

# ───────── ตัวฐาน (ครึ่งซ้าย) — หน้าไข่ มน · มือกลมมีนิ้วโป้ง · เข่า · เท้า ─────────
BODY = {
10: "..........oSSSSS", 11: ".........oSSSSSS", 12: ".........oSSSSSS", 13: "........oSSSSSSS",
14: "........oSSSSSSS", 15: "........oSSSSSSS", 16: "........oSSSSSSS", 17: "........osSSSSSS",
18: ".........osSSSSS", 19: "..........ossSSS", 20: "............osss", 21: ".............osS",
22: ".............oSS", 23: "..........oooSSS", 24: "........ooSSSSSS", 25: ".......oSSSSSSSS",
# หุ่นเพรียว: ไหล่ไม่กว้าง · แขน 2px ห่างลำตัว · เอวคอด (แถว 30–34) · สะโพกบานนิด · ขาเรียว น่องเล็กลง
26: "......oSSooSSSSS", 27: "......oSso.oSSSS", 28: "......oSso.oSSSS", 29: "......oSso.oSSSS",   # อกตรง ไม่ป่อง
30: "......oSso.oSSSS", 31: "......oSso.oSSSS", 32: "......oSso.oSSSS", 33: "......oSso.oSSSS",
34: "......oSso.oSSSS",                       # แขนยาวลงถึงกลางต้นขา
35: "......oSso.oSSSS", 36: "......oSSo.oSSSS", 37: "......oSSo.oSSSS",   # มือกลมอยู่ในแนวแขน · สะโพกตามแนวลำตัว
38: "......osso.oSSSS", 39: ".......oo..oSSSo",
# ขาแยกกันจริง: ช่องว่างโปร่งใส 2px ตรงกลาง (เดิมเป็นเส้นเข้ม 2 เส้นติดกัน ดูเป็นแท่งเดียว)
**{r: "..........oSSSo." for r in range(40, 44)},
44: "..........osSSo.",                       # เข่า
**{r: "..........oSSSo." for r in range(45, 49)},
**{r: "...........oSSo." for r in range(49, 52)},   # น่องเรียวลง
52: "..........oSSSo.", 53: "..........oSSSo.", 54: "..........oooo..",
}
# ชุดชั้นในเริ่มต้น (ไม่ปล่อยตัวเปล่า): เสื้อกล้าม + กางเกงขาสั้น
UNDER = {   # เสื้อกล้าม (U) แถว 24–31 · ขอบเอว · กางเกงขาสั้น (V) แถว 33–38
24: "..........oUoSoU", 25: "..........oUUoUU", 26: "..........oUUUUU", **{r: "...........oUUUU" for r in range(27, 30)},
30: "...........oUUUU", 31: "...........oUUUU", 32: "...........ooooo",
33: "...........oVVVV", 34: "...........oVVVV", 35: "...........oVVVV",
36: "...........oVVVV", 37: "...........oVVVo", 38: "...........ooooo",
}
SHOES = {52: "..........oBBBo.", 53: "..........oBBbo.", 54: "..........ooooo."}

# ───────── ผม: หน้าม้าลงถึงคิ้ว + แถบเงาวาว + ปอยข้างแก้ม ─────────
def fringe(long_sides=True):
    d = {4: "..........oooooo", 5: "........ooHHHHHH", 6: ".......oHHLLLLHH", 7: "......oHLLHHHHLL",
         8: ".....oHLHHHHHHHH", 9: ".....oHHHHHHHHHH", 10: ".....oHHHHHHHHHH", 11: ".....oHHHHHhHHHH",
         12: ".....oHHHHhHHhHh", 13: "......oHHh.Hh.h.", 14: "......oHHo......", 15: "......oHHo......",
         16: "......oHHo......", 17: "......oHHHo.....", 18: "......oHHHo....."}
    if long_sides:
        d.update({19: "......oHHHo.....", 20: ".......oHHo.....", 21: ".......oHo......"})
    else:
        d[18] = ".......oo......."
    return d
HAIR_LONG_BACK = {11: ".....oHHHH......", 12: "....oHHHHH......", 13: "....oHHHHH......", 14: "...oHHhHHH......",
    15: "...oHHhHHH......", 16: "...oHHhHHH......", 17: "...oHHhHHH......", 18: "..oHHHhHHH......", 19: "..oHHHhHHH......",
    20: "..oHHhHHHH......", 21: "..oHHhHHHH......", 22: "..oHHhHHH.......", 23: "..oHHhHHH.......", 24: "..oHhHHH........",
    25: "..oHhHHH........", 26: "..oHhHHo........", 27: "..oHhHHo........", 28: ".oHHhHHo........", 29: ".oHHhHHo........",
    30: ".oHhHHHo........", 31: ".oHhHHo.........", 32: ".oHhHHo.........", 33: ".oHhHHHo........", 34: "oHHhHHHHo.......",
    35: "oHhHoHHHo.......", 36: "oHhoooHo........", 37: "oHo...oHo.......", 38: "oo.....oo.......", 39: "o.......o......."}

SKINS = {"s1": ("#FFEBDD", "#F4C2B2"), "s2": ("#FFE6D4", "#F2B9A8"), "s3": ("#F2C6A0", "#DDA27E"),
         "s4": ("#D29A70", "#B47A56"), "s5": ("#94603F", "#784A30")}
HAIRS = {"c1": ("#383452", "#24203A", "#7A74A8"), "c2": ("#7A4B2A", "#5A3620", "#B07A48"),
         "c3": ("#F2D27A", "#D0A84E", "#FFF2C0"), "c4": ("#F4A8C4", "#D47AA0", "#FFE6F0"),
         "c5": ("#9A7AD0", "#7356A8", "#D4C2F4"), "c6": ("#6BB8E8", "#4A93C4", "#C8E8FA"),
         "c7": ("#E0E0F0", "#A6A4C4", "#FFFFFF"), "c8": ("#D9533F", "#B03D2C", "#F79A80")}
EYES = {"e1": "#3A7BD5", "e2": "#B83C88", "e3": "#D93A4A", "e4": "#4FA36A", "e5": "#C08A2A"}

def mirror(half): return {r: s + s[::-1] for r, s in half.items()}

def compose(layers):
    g = [["."]*W for _ in range(H)]
    for lay, mode in layers:
        for r, s in mirror(lay).items():
            y = r + TOP
            for i, ch in enumerate(s):
                x = OX + i
                if ch == "." or not (0 <= y < H and 0 <= x < W): continue
                if mode == "back" and g[y][x] != ".": continue
                g[y][x] = ch
    return g

def render(grid, pal):
    out = [[None]*W for _ in range(H)]
    filled = lambda x, y: 0 <= x < W and 0 <= y < H and grid[y][x] != "."
    for y in range(H):
        x = 0
        while x < W:
            ch = grid[y][x]
            if ch in ".o" or ch in FLAT: x += 1; continue
            x1 = x
            while x1+1 < W and (grid[y][x1+1] == ch or grid[y][x1+1] in FLAT): x1 += 1
            n, base = x1-x+1, pal[ch]
            dark = "#C8607A" if ch in "Ss" else "#3E2A66"
            ramp = [mix(base, "#FFF8EC", .38), hx(base), mix(base, dark, .18), mix(base, dark, .36)]
            for i in range(x, x1+1):
                c = grid[y][i]
                if c in FLAT: out[y][i] = hx(pal[c]); continue
                t = (i-x) / max(1, n-1)
                k = 0 if t < .18 else 1 if t < .58 else 2 if t < .84 else 3
                if n <= 2: k = 1 if i == x else 2
                if not (filled(i, y-1) and grid[y-1][i] == c): k = max(0, k-1)
                elif not (filled(i, y+1) and grid[y+1][i] == c): k = min(3, k+1)
                out[y][i] = ramp[k]
            x = x1+1
    for y in range(H):
        for x in range(W):
            if grid[y][x] != "o": continue
            n4 = [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]
            mats = [grid[q][p] for p, q in n4 if filled(p, q) and grid[q][p] != "o"]
            out[y][x] = mix(pal[mats[0]], "#4A2440", .40) if all(filled(*p) for p in n4) and mats else hx(OUTLINE)
    return out

def stamp(px, x0, y0, rows, m):
    for j, r in enumerate(rows):
        for i, ch in enumerate(r):
            if ch != ".": px[TOP+y0+j][OX+x0+i] = hx(m[ch]) if isinstance(m[ch], str) else m[ch]

def face(px, eye, blush=True):
    m = {"k": "#2A1428", "I": eye, "i": mix(eye, "#000000", .5), "X": "#FFFFFF"}
    for x0 in (11, 18):                 # ตา 3x5 ต่ำ ชิด ประกายซ้ายบนทั้งสองข้าง
        stamp(px, x0, 13, ["kkk", "kXk", "kik", "kIi", ".kk"], m)
    stamp(px, 15, 19, ["m"], {"m": "#D98A84"})
    if blush:
        stamp(px, 10, 18, ["bb"], {"b": "#F7B0B0"}); stamp(px, 20, 18, ["bb"], {"b": "#F7B0B0"})

def ground(px, cx=20, cy=64, rx=9, ry=1.4):
    for y in range(H):
        for x in range(W):
            if px[y][x] is None and ((x+.5-cx)/rx)**2 + ((y+.5-cy)/ry)**2 <= 1: px[y][x] = (40, 24, 40, 70)

def make(skin="s2", hair="c1", eye="e1", long_hair=False, blush=True):
    S, s = SKINS[skin]; Hh, hh, L = HAIRS[hair]
    pal = {"S": S, "s": s, "H": Hh, "h": hh, "L": L, "U": "#F2F0F7", "V": "#8A93B8", "B": "#6A5A60", "b": "#4A3E44"}
    layers = ([(HAIR_LONG_BACK, "back")] if long_hair else []) + [(BODY, "over"), (UNDER, "over"), (SHOES, "over"), (fringe(long_hair), "over")]
    px = render(compose(layers), pal)
    face(px, EYES[eye], blush); ground(px)
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for y in range(H):
        for x in range(W):
            if px[y][x]: im.putpixel((x, y), px[y][x])
    return im

if __name__ == "__main__":
    shots = {
        "base": make(),
        **{f"skin_{k}": make(skin=k) for k in SKINS},
        **{f"hair_{k}": make(hair=k, long_hair=(i % 2 == 1), eye=list(EYES)[i % len(EYES)]) for i, k in enumerate(HAIRS)},
    }
    for k, im in shots.items(): im.save(os.path.join(OUT, f"{k}.png"))
    S = 5
    sheet = Image.new("RGBA", (W*S*3 + 40, H*S + 20), (238, 243, 255, 255))
    for i, k in enumerate(["base", "skin_s4", "hair_c4"]):
        sheet.alpha_composite(shots[k].resize((W*S, H*S), Image.NEAREST), (10 + i*(W*S+10), 10))
    sheet.save(os.path.join(OUT, "_preview.png")); print("ok", len(shots))
