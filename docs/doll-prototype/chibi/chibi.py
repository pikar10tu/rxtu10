"""ลองแนว chibi พิกเซลใหญ่ เงาการ์ตูนเป็นก้อน (18 พ.ย. 2026) — ตัวละครของเราเอง ไม่ลอกจากภาพอ้างอิง
กรอบ 40x56 · ตัววาดครึ่งซ้ายแล้วสะท้อน · ผมกับหน้าวาดเต็ม (ไม่สมมาตร) · เงา = แถบเรียบ 2px ฝั่งขวาของแต่ละชิ้น + ไฮไลต์ผม"""
import os
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "out"); os.makedirs(OUT, exist_ok=True)
W, H, TOP, OX = 40, 56, 2, 4
INK = "#3B2418"

def hx(c): c = c.lstrip("#"); return tuple(int(c[i:i+2], 16) for i in (0, 2, 4)) + (255,)
def mix(a, b, t):
    a = hx(a) if isinstance(a, str) else a; b = hx(b) if isinstance(b, str) else b
    return tuple(round(a[i]+(b[i]-a[i])*t) for i in range(3)) + (255,)

BODY = {   # ครึ่งซ้าย 16 คอลัมน์
8: "........oSSSSSSS", 9: ".......oSSSSSSSS", 10: "......oSSSSSSSSS", 11: "......oSSSSSSSSS",
12: "......oSSSSSSSSS", 13: ".....ooSSSSSSSSS", 14: "....oSsoSSSSSSSS", 15: "....oSsoSSSSSSSS",
16: ".....ooSSSSSSSSS", 17: "......oSSSSSSSSS", 18: "......oSSSSSSSSS", 19: ".......oSSSSSSSS",
20: "........ooSSSSSS", 21: "..........oooSSS",
22: "............osss", 23: "............oSSS", 24: "............oSSS",   # คอกว้างเท่ากันตลอด + เงาใต้คาง
25: ".........ooooTTT", 26: ".......ooTTTTTTT", 27: "......oTTTTTTTTT", 28: ".....oTTToTTTTTT",
29: ".....oTTToTTTTTT", 30: ".....oTTToTTTTTT", 31: "....oSSSooTTTTTT", 32: "....oSSSooTTTTTT",
33: "....oSSSooTTTTTT", 34: "...oSSSSooTTTTTT", 35: "...oSSSSo.oTTTTT", 36: "....oooo..oPPPPP",
37: "..........oPPPPP", 38: "..........oPPPPP", 39: "..........oPPPPo",
**{r: "..........oPPPo." for r in range(40, 44)},
**{r: ".........oPPPo.." for r in range(44, 48)},
48: "........oBBBBo..", 49: ".......oBBBBBo..", 50: ".......ooooooo..",
}
INNER = {r: "..............UU" for r in range(26, 36)} | {25: ".............oUU"}
BELT = {36: "..........oLLLLL"}

HAIR = [   # 32 คอลัมน์ (เต็ม) — ช่อผมไม่สมมาตร ปัดไปขวา
"...........oooooooo.............",
".........ooHHHHHHHHoo...........",
".......ooHHHHHLLHHHHHoo.........",
"......oHHHHHLLLHHHHHHHHo........",
".....oHHHHHHHLHHHHHHHHHHoo......",
"....oHHHHHHHHHHHHHHHHHHHHHo.....",
"....oHHHHHHHHHHHHHHHHHHHHHHo....",
"...oHHHHHhHHHHHHHHhHHHHHHHHo....",
"...oHHHHhHHHHHHHHhHHHHHHHHHHo...",
"...oHHHhHHHHHhHHhHHHHHhHHHHHo...",
"...oHHhSHHHHhSHhSSHHHHhSHHHHo...",
"...oHhSShHHhSSSSSSShHHhSShHHo...",
"...oHHo...................oHHo..",
"...oHHo...................oHHo..",
"...oHHo....................oHo..",
"....oHo....................oo...",
"....oo..........................",
]

def mirror(half): return {r: s + s[::-1] for r, s in half.items()}

def compose(layers):
    g = [["."]*W for _ in range(H)]
    for lay, full in layers:
        rows = lay if full else mirror(lay)
        for r, s in (enumerate(rows) if full else rows.items()):
            y = r + TOP
            for i, ch in enumerate(s):
                x = OX + i
                if ch != "." and 0 <= y < H and 0 <= x < W: g[y][x] = ch
    return g

def render(g, pal):
    """เงาการ์ตูน: แถบเงาเรียบ 2px ที่ขอบขวา/ล่างของแต่ละชิ้น · ไฮไลต์ L ของผมคงไว้ · เส้นนอกน้ำตาลเข้มหนา"""
    out = [[None]*W for _ in range(H)]
    filled = lambda x, y: 0 <= x < W and 0 <= y < H and g[y][x] != "."
    for y in range(H):
        for x in range(W):
            ch = g[y][x]
            if ch == ".": continue
            if ch == "o":
                n4 = [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]
                mats = [g[q][p] for p, q in n4 if filled(p, q) and g[q][p] != "o"]
                out[y][x] = mix(pal[mats[0]], INK, .55) if all(filled(*p) for p in n4) and mats else hx(INK)
                continue
            base = pal[ch]
            same = lambda dx, dy: filled(x+dx, y+dy) and g[y+dy][x+dx] == ch
            if ch in "Lh": out[y][x] = hx(base); continue
            # ผิวไม่ลงเงาขอบล่าง (เดิมทำให้เห็นกรามซ้อนสองชั้น)
            shade = (not same(1, 0)) or (not same(2, 0) and ch not in "S") or (not same(0, 1) and ch not in "Ss")
            out[y][x] = mix(base, "#5A2E4A" if ch not in "Ss" else "#B85A5A", .30) if shade else hx(base)
    return out

def stamp(px, x0, y0, rows, m):
    for j, r in enumerate(rows):
        for i, ch in enumerate(r):
            if ch != ".": px[TOP+y0+j][OX+x0+i] = hx(m[ch])

def face(px, iris, brows=False):
    m = {"k": "#2A1810", "W": "#FFFFFF", "X": "#FFFFFF", "I": iris, "i": "#" + "".join(f"{v:02X}" for v in mix(iris, "#000000", .45)[:3]), "m": "#B0524A", "n": "#E8A890"}
    stamp(px, 8, 13, ["kkkk", "WXIk", "WIIk", "Wiik"], m)       # ตาซ้าย (ตาขาวฝั่งนอก)
    stamp(px, 19, 13, ["kkkk", "kXIW", "kIIW", "kiiW"], m)      # ตาขวา ประกายมุมซ้ายบนเหมือนกัน
    stamp(px, 16, 18, ["n"], m)                                  # จมูก
    stamp(px, 15, 20, ["mm"], m)                                 # ปาก
    if brows:
        stamp(px, 8, 11, ["..kk"], {"k": "#2A1810"}); stamp(px, 19, 11, ["kk.."], {"k": "#2A1810"})

def ground(px):
    for y in range(H):
        for x in range(W):
            if px[y][x] is None and ((x+.5-20)/11)**2 + ((y+.5-53)/1.4)**2 <= 1: px[y][x] = (60, 40, 30, 70)

def save(px, name):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for y in range(H):
        for x in range(W):
            if px[y][x]: im.putpixel((x, y), px[y][x])
    im.save(os.path.join(OUT, name + ".png")); return im

SKIN = {"S": "#FFD7B5", "s": "#F0B48E"}
LOOKS = {
 "casual": ({**SKIN, "H": "#7A4A2A", "h": "#4E2C18", "L": "#B07A48", "T": "#4F79B0", "U": "#F4F1EA", "P": "#3D5A8C", "L2": "", "B": "#5A3A2A"}, "#3A6FB0", False),
 "pharm":  ({**SKIN, "H": "#2F2A3A", "h": "#1A1622", "L": "#5E5674", "T": "#F6F7FB", "U": "#52BFA6", "P": "#2E3550", "B": "#4A3428"}, "#3A7BD5", False),
 "dark":   ({**SKIN, "H": "#E2E2EE", "h": "#9C9AB8", "L": "#FFFFFF", "T": "#2A2638", "U": "#C93A4A", "P": "#1E1B2A", "B": "#1E1B2A"}, "#D93A4A", True),
}
for k in LOOKS: LOOKS[k][0]["L"] = LOOKS[k][0]["L"]; LOOKS[k][0].pop("L2", None)
# เข็มขัดใช้ตัว L ซ้ำกับไฮไลต์ผมไม่ได้ → ใช้ G
BELT = {36: "..........oGGGGG"}
ims = {}
for k, (pal, iris, brows) in LOOKS.items():
    pal = {**pal, "G": "#5A3A2A" if k != "dark" else "#C9A040"}
    g = compose([(BODY, False), (INNER, False), (BELT, False), (HAIR, True)])
    px = render(g, pal); face(px, iris, brows); ground(px)
    ims[k] = save(px, k)
S = 6
sheet = Image.new("RGBA", (3*(W*S+16)+16, H*S+32), (200, 228, 245, 255))
for i, im in enumerate(ims.values()):
    sheet.alpha_composite(im.resize((W*S, H*S), Image.NEAREST), (16 + i*(W*S+16), 16))
sheet.save(os.path.join(OUT, "_preview.png")); print("ok")
