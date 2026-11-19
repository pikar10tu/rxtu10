"""แนว MMO 2D หน้าตรง ตัวเพรียว 3 หัว (ดูลักษณะจาก Asura Online) — ประกอบจากชิ้นแบบระบบแต่งตัว
วาดครึ่งซ้าย 16 คอลัมน์แล้วสะท้อนเป็น 32 · ชิ้นที่ไม่สมมาตร (ตา ประกายตา ปาก ไอเท็ม) วางทับหลังสะท้อน"""
import sys, math
sys.path.insert(0, r"D:/RXTU/rxtu10-v2/.claude/skills/pixel-art-studio/scripts")
from pixelstudio import mix, hex2rgba
from PIL import Image
HERE = r"C:/Users/winusr/AppData/Local/Temp/claude/b3373d7e6c043e38/ea666185-e1d0-4e77-b1aa-b12ad1900898/scratchpad/dollasura/"
W, H, TOP = 40, 66, 8          # กรอบ 40x66 ตัว 32 กว้างอยู่กลาง (เผื่อปีก/หู)
OX = 4

def rgba(c): return tuple(hex2rgba(c))

# ── ตัวฐาน (ครึ่งซ้าย) ──
BODY = {
10: "........oSSSSSSS", 11: ".......oSSSSSSSS", 12: ".......oSSSSSSSS", 13: ".......oSSSSSSSS",
14: ".......oSSSSSSSS", 15: ".......oSSSSSSSS", 16: ".......oSSSSSSSS", 17: "........oSSSSSSS",
18: "........osSSSSSS", 19: ".........osSSSSS", 20: "..........ossSSS", 21: "............osSS",
22: "............osSS", 23: "........oooooSSS", 24: ".......oSSSSSSSS", 25: "......oSSSSSSSSS",
26: "......oSsoSSSSSS", 27: "......oSsoSSSSSS", 28: "......oSsoSSSSSS", 29: "......oSsoSSSSSS",
30: "......oSsosSSSSS", 31: "......oSsosSSSSS", 32: ".....oSSsosSSSSS", 33: ".....oSSso.sSSSS",
34: "......ooo.oSSSSS", 35: "..........oSSSSS", 36: "..........oSSSSS", 37: "..........oSSSSo",
**{r: "...........oSSSo" for r in range(38, 53)},
53: "..........oBBBBo", 54: "..........oBBBbo", 55: "..........oooooo",
}

# ── ผม ──
HAIR_LONG_BACK = {11: ".....oHHHH......", 12: "....oHHHHH......", 13: "....oHHHHH......", 14: "...oHHhHHH......",
    15: "...oHHhHHH......", 16: "...oHHhHHH......", 17: "...oHHhHHH......", 18: "..oHHHhHHH......", 19: "..oHHHhHHH......",
    20: "..oHHhHHHH......", 21: "..oHHhHHHH......", 22: "..oHHhHHH.......", 23: "..oHHhHHH.......", 24: "..oHhHHH........",
    25: "..oHhHHH........", 26: "..oHhHHo........", 27: "..oHhHHo........", 28: ".oHHhHHo........", 29: ".oHHhHHo........",
    30: ".oHhHHHo........", 31: ".oHhHHo.........", 32: ".oHhHHo.........", 33: ".oHhHHHo........", 34: "oHHhHHHHo.......",
    35: "oHhHoHHHo.......", 36: "oHhoooHo........", 37: "oHo...oHo.......", 38: "oo.....oo.......", 39: "o.......o......."}
HAIR_LONG_FRONT = {
4: "..........oooooo", 5: "........ooHHHHHH", 6: ".......oHHHHHLLH", 7: "......oHHHHHLLHH",
8: ".....oHHHHHHHHHH", 9: ".....oHHHHHHHHHH", 10: "....oHHHHHHhHHHH", 11: "....oHHHHHhHHHhH",
12: "....oHHHHhSHHHhS", 13: "....oHHHhSSShHhS", 14: "....oHHhS.......", 15: "....oHHh........",
16: "....oHHh........", 17: "....oHHh........", 18: "....oHHHo.......", 19: "....oHHHo.......",
20: "....oHHHHo......", 21: "....oHHHHo......", 22: "....oHHHHo......", 23: ".....oHHHo......",
}
HAIR_SHORT = {
4: "..........oooooo", 5: "........ooHHHHHH", 6: ".......oHHHHHLLH", 7: "......oHHHHHLLHH",
8: "......oHHHHHHHHH", 9: "......oHHHHHHHHH", 10: "......oHHHHHhHHH", 11: "......oHHHhHHhHH",
12: "......oHHhSHHhSH", 13: "......oHhSSShSSS", 14: ".......oh.......", 15: ".......oh.......",
16: "........o.......",
}
HAIR_SPIKY = {
2: "........o.......", 3: "........oHo.....", 4: ".......oHHo.oooo", 5: "......oHHHooHHHH",
6: ".....oHHHHHHHLLH", 7: "....oHHHHHHHLLHH", 8: "...oHHHHHHHHHHHH", 9: "....oHHHHHHHHHHH",
10: "...oHHHHHHhHHHHH", 11: "....oHHHHhHHHhHH", 12: "....oHHhhSHHhSSS", 13: ".....oHhSSShSSSS",
14: "......ohS.......", 15: ".....oHh........", 16: "......oh........",
}

# ── ชุด ──
DRESS = {
23: "........oooooDDD", 24: ".......oSSDDDDDD", 25: "......oSSSDDDDDD", 26: "......oSsoDDDDDD",
27: "......oSsoDDDDDD", 28: "......oSsoDdDDDD", 29: "......oSsoDdDDDD", 30: "......oSsodDDDDD",
31: "......oSsooRRRRR", 32: ".....oSSsoDDDDDD", 33: ".....oSSsoDDDDDD", 34: "......oooDDDDDDD",
35: "......oDDDDDDDDD", 36: ".....oDDDdDDDDDD", 37: ".....oDDDdDDDDDD", 38: "....oDDDdDDDDDDD",
39: "....oDDDdDDDDDDD", 40: "....oddddddddddd", 41: "....oooooooooooo",
}
COAT = {
23: "........oooooTTW", 24: ".......oWWWWoTTW", 25: "......oWWWWWoTTW", 26: "......oWWoWWoTTW",
27: "......oWWoWWoTTW", 28: "......oWWoWWoTTW", 29: "......oWWoWWoTTW", 30: "......oWWoWWoTtW",
31: "......oWWoWWoTtW", 32: ".....oWWWoWWWoWW", 33: ".....oSSSoWWWoWW", 34: "......oooWWWWoWW",
35: "........oWWWWoPP", 36: "........oWWWWoPP", 37: "........oWWWWoPP", 38: "........oWwWWoPP",
39: "........oWwWWoPP", 40: "........oWwWWoPP", 41: "........oWwWWoPP", 42: "........oTTTToPP",
43: "........ooooooPP",
}
PANTS = {r: "...........oPPPo" for r in range(35, 52)} | {35: "..........oPPPPP", 36: "..........oPPPPP", 37: "..........oPPPPo"}
ARMOR = {
22: "............oAAA", 23: "......ooooooAAAA", 24: ".....oMMMMoAAAAA", 25: "....oMmMMMoAAAAA",
26: "....oMmMMoAAAaAA", 27: ".....oooMoAAaAAA", 28: "......oAaoAAaAAA", 29: "......oAaoAAAaAA",
30: "......oAaoRRRRRR", 31: "......oAaoAAAAAA", 32: ".....oAAaoAaAAAA", 33: ".....oGGGoAaAAAA",
34: "......oooAAaAAAA", 35: "........oAAaAAAA", 36: "........oAaAAAAA", 37: "........oaaAAAAA",
38: "........ooooaAAo", **{r: "...........oAAAo" for r in range(39, 52)},
52: "..........oMMMMo", 53: "..........oMMMmo", 54: "..........oooooo",
}
CAPE = {r: "...oCCCCC......." for r in range(23, 50)} | {50: "...oooooo......."}
WINGS = {
14: "o...............", 15: "oo..............", 16: "oVo.............", 17: "oVVo............",
18: "oVvVo...........", 19: "oVVvVoo.........", 20: ".oVVvVVoo.......", 21: ".oVVVvVVVo......",
22: "..oVVVvVVVo.....", 23: "..oVVVVvVVo.....", 24: "...oVVVVvVo.....", 25: "...ooVVVVVo.....",
26: "....oVoVVVo.....", 27: "....o.oVVo......", 28: "......oVo.......", 29: "......oo........",
}
BUNNY = {-7: ".....oo.........", -6: "....oEEo........", -5: "....oEEEo.......", -4: "....oEeEo.......",
         -3: "....oEeEo.......", -2: "....oEeEEo......", -1: "....oEeEEo......", 0: ".....oEeEo......",
         1: ".....oEeEo......", 2: "......oEEo......", 3: "......oEEo......", 4: ".......oo.......",
         5: "........ooRRRRRR", 6: "........oRRRRRRR"}
CROWN = {-2: "..........o....o", -1: "..........oo..oY", 0: ".........oYo.oYY", 1: ".........oYYoYYY",
         2: ".........oYYYYYG", 3: ".........oYYYYYY", 4: ".........oyyyyyy"}

def mirror_half(half):
    return {r: (s + s[::-1]) for r, s in half.items()}

def compose(layers):
    """layers = [(half_or_full, mode)] mode: 'over' ทับ / 'back' วางเฉพาะที่ว่าง"""
    g = [["."]*W for _ in range(H)]
    for lay, mode in layers:
        full = lay if lay.get("_full") else mirror_half(lay)
        for r, s in full.items():
            if r == "_full": continue
            y = r + TOP
            for i, ch in enumerate(s):
                x = OX + i
                if ch == "." or not (0 <= y < H and 0 <= x < W): continue
                if mode == "back" and g[y][x] != ".": continue
                g[y][x] = ch
    return g

def render(g, pal, outline="#3A2420"):
    out = [[None]*W for _ in range(H)]
    filled = lambda x, y: 0 <= x < W and 0 <= y < H and g[y][x] != "."
    for y in range(H):
        for x in range(W):
            ch = g[y][x]
            if ch == ".": continue
            if ch == "o":
                n4 = [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]
                mats = [g[q][p] for p, q in n4 if filled(p, q) and g[q][p] != "o"]
                if all(filled(*p) for p in n4) and mats:
                    out[y][x] = rgba(mix(pal[mats[0]], "#2A1620", .5))      # เส้นในอมสีวัสดุ
                else:
                    out[y][x] = rgba(outline)
                continue
            base = pal[ch]
            same = lambda dx, dy: filled(x+dx, y+dy) and g[y+dy][x+dx] == ch
            c = base
            if not same(1, 0) or not same(1, 1):            # ขอบขวา/ล่าง = เงา (แสงซ้ายบน)
                c = mix(base, "#4A2E5E", .22)
            elif not same(-1, -1) and not same(0, -1):
                c = mix(base, "#FFF4DE", .30)
            out[y][x] = rgba(c)
    return out

def stamp(px, x0, y0, rows, m):
    for j, r in enumerate(rows):
        for i, ch in enumerate(r):
            if ch != ".": px[TOP+y0+j][OX+x0+i] = rgba(m[ch])

def face(px, eye, blush="#F4A6A6", mouth=True):
    m = {"k": "#2A1620", "I": eye, "i": mix(eye, "#000", .4), "X": "#FFFFFF", "b": blush, "m": "#C26A62"}
    for x0 in (10, 19):                      # ตาดำรีใหญ่ ประกายมุมซ้ายบนทั้งสองข้าง
        stamp(px, x0, 13, [".kk.", "kXIk", "kIik", "kiik", ".kk."], m)
    stamp(px, 9, 18, ["bb"], m); stamp(px, 21, 18, ["bb"], m)
    if mouth: stamp(px, 15, 19, ["mm"], m)

def shadow(px, cx=20, cy=64, rx=9, ry=1.4):
    for y in range(H):
        for x in range(W):
            if px[y][x] is None and ((x+.5-cx)/rx)**2 + ((y+.5-cy)/ry)**2 <= 1: px[y][x] = (40, 24, 40, 70)

def save(px, name):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for y in range(H):
        for x in range(W):
            if px[y][x]: im.putpixel((x, y), px[y][x])
    im.save(HERE + f"out/{name}.png"); return im

SKIN = dict(S="#FFE3CF", s="#EDBBA0")
LOOKS = {
 "girl":   ([(WINGS, "back")] * 0 + [(HAIR_LONG_BACK, "back"), (BODY, "over"), (DRESS, "over"), (HAIR_LONG_FRONT, "over"), (BUNNY, "over")],
            {**SKIN, "H": "#F2A6C0", "h": "#D07A9C", "L": "#FFE0EA", "D": "#FFFFFF", "d": "#E6D6EE", "R": "#E86A8A",
             "B": "#E86A8A", "b": "#B84A6A", "E": "#FFFFFF", "e": "#F7B6C8"}, "#C04A8A"),
 "pharm":  ([(BODY, "over"), (PANTS, "over"), (COAT, "over"), (HAIR_SHORT, "over")],
            {**SKIN, "H": "#3A3550", "h": "#26223A", "L": "#6A6490", "W": "#F7F8FC", "w": "#D3D8E8", "T": "#52BFA6", "t": "#2F8C7A",
             "P": "#34405E", "B": "#5A3A2A", "b": "#3A261C"}, "#3A7BD5"),
 "knight": ([(WINGS, "back"), (CAPE, "back"), (BODY, "over"), (ARMOR, "over"), (HAIR_SPIKY, "over"), (CROWN, "over")],
            {**SKIN, "H": "#DCDCEC", "h": "#A6A4C4", "L": "#FFFFFF", "A": "#2E2A40", "a": "#1C1928", "M": "#5A5674", "m": "#3A3650",
             "R": "#C93A4A", "G": "#C9CFDB", "C": "#7A1E30", "V": "#2A2236", "v": "#4A3E5E", "Y": "#F6C453", "y": "#C08A2A",
             "B": "#2E2A40", "b": "#1C1928"}, "#D93A4A"),
}
ims = {}
for name, (layers, pal, eye) in LOOKS.items():
    g = compose(layers)
    px = render(g, pal)
    face(px, eye, mouth=(name != "knight"))
    shadow(px)
    ims[name] = save(px, name)

S = 5
sheet = Image.new("RGBA", (3*(W*S+20)+20, H*S+40), (238, 243, 255, 255))
for k, im in enumerate(ims.values()):
    sheet.alpha_composite(im.resize((W*S, H*S), Image.NEAREST), (20 + k*(W*S+20), 20))
sheet.save(HERE + "sheet.png"); print("ok")
