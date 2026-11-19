"""รอบ 3 ตามการ์ด 006: ตาใหญ่ 3x5 ต่ำชิด · ผมมีแถบเงาวาว · ของบนหัวสูงเท่าหัว · เส้นในอมสีวัสดุ (บางลง) · ชุดมีประกาย · ผิวเงาอุ่น"""
src = open(r"C:/Users/winusr/AppData/Local/Temp/claude/b3373d7e6c043e38/ea666185-e1d0-4e77-b1aa-b12ad1900898/scratchpad/dollasura/faces.py", encoding="utf-8").read()
src = src.rsplit("\nSKIN = dict(", 1)[0]
ns = {}; exec(compile(src, "faces", "exec"), ns)
g = {**ns["g"], **ns}
from PIL import Image
mix, rgba, W, H = g["mix"], g["rgba"], g["W"], g["H"]

def render(grid, pal, outline="#3A2028"):
    out = [[None]*W for _ in range(H)]
    filled = lambda x, y: 0 <= x < W and 0 <= y < H and grid[y][x] != "."
    for y in range(H):
        for x in range(W):
            ch = grid[y][x]
            if ch == ".": continue
            if ch == "o":
                n4 = [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]
                mats = [grid[q][p] for p, q in n4 if filled(p, q) and grid[q][p] != "o"]
                if all(filled(*p) for p in n4) and mats:
                    out[y][x] = rgba(mix(pal[mats[0]], "#4A2440", .38))   # เส้นในบาง อมสีวัสดุ
                else:
                    out[y][x] = rgba(outline)
                continue
            base = pal[ch]
            same = lambda dx, dy: filled(x+dx, y+dy) and grid[y+dy][x+dx] == ch
            if ch in "Ss": warm = "#C8607A"
            else: warm = "#4A2E6E"
            c = base
            if not same(1, 0) or not same(1, 1) or not same(0, 2):
                c = mix(base, warm, .24)
            elif not same(-1, -1) and not same(0, -1):
                c = mix(base, "#FFF6E6", .32)
            out[y][x] = rgba(c)
    return out

def fringe_halo(long_sides=True):
    d = g["fringe"](long_sides)
    d[6] = ".......oHHLLLLHH"      # แถบเงาวาวโค้งบนหัว
    d[7] = "......oHLLHHHHLL"
    d[8] = ".....oHLHHHHHHHH"
    return d

def eyes_big(px, eye):
    m = {"k": "#2A1428", "I": eye, "i": mix(eye, "#000", .5), "X": "#FFFFFF"}
    for x0 in (11, 18):
        g["stamp"](px, x0, 13, ["kkk", "kXk", "kik", "kIi", ".kk"], m)

def mouth(px, blush):
    g["stamp"](px, 15, 19, ["m"], {"m": "#D98A84"})
    if blush:
        g["stamp"](px, 10, 18, ["bb"], {"b": "#F7B0B0"}); g["stamp"](px, 20, 18, ["bb"], {"b": "#F7B0B0"})

BIG_BUNNY = {-12: "......oo........", -11: ".....oEEo.......", -10: ".....oEEEo......", -9: "....oEEeEo......",
             -8: "....oEeeEo......", -7: "....oEeeEEo.....", -6: "....oEeeEEo.....", -5: "....oEeeEEo.....",
             -4: "....oEeeEEo.....", -3: ".....oEeEEo.....", -2: ".....oEeEEo.....", -1: "......oEEEo.....",
             0: "......oEEEo.....", 1: ".......oEEo.....", 2: ".......oEo......", 3: "........o.......",
             4: "........oFFRRRRR", 5: ".......oFxFRRRRR", 6: "........oFFRRRRR"}
BIG_CROWN = {-6: "...........o...o", -5: "..........oYo.oY", -4: "..........oYo.oY", -3: ".........oYYYoYYY",
             -2: ".........oYYYYYYY", -1: ".........oYGYYYYR", 0: ".........oYYYYYYY", 1: ".........oyyyyyyy",
             2: ".........ooooooooo"}
BIG_CROWN = {k + 3: v for k, v in BIG_CROWN.items()}   # ให้ฐานมงกุฎนั่งบนผม

def sparkle(layer, ch="D", spark="x", every=((26, 12), (29, 14), (33, 11), (36, 13), (38, 9), (39, 14), (35, 15), (31, 12))):
    lay = dict(layer)
    for r, c in every:
        if r in lay and c < len(lay[r]) and lay[r][c] == ch:
            s = lay[r]; lay[r] = s[:c] + spark + s[c+1:]
    return lay

SKIN = dict(S="#FFE6D4", s="#F2B9A8")
DRESS = sparkle(g["DRESS"])
COAT = sparkle(g["COAT"], "W", "x", ((26, 7), (30, 10), (37, 10), (40, 11)))
ARMOR = sparkle(g["ARMOR"], "A", "x", ((26, 12), (29, 14), (33, 13), (36, 11), (41, 13), (45, 13)))
CHARS = {
 "girl": ([(g["HAIR_LONG_BACK"], "back"), None, (DRESS, "over"), "FR", (BIG_BUNNY, "over")],
          {**SKIN, "H": "#F4A8C4", "h": "#D47AA0", "L": "#FFE6F0", "D": "#FFFFFF", "d": "#EAD8F2", "x": "#F7B6D0", "R": "#E86A8A",
           "F": "#FFD86A", "B": "#E86A8A", "b": "#B84A6A", "E": "#FFFFFF", "e": "#F9B8CC"}, "#B83C88", True, True),
 "pharm": ([None, (g["PANTS"], "over"), (COAT, "over"), "FR"],
          {**SKIN, "H": "#383452", "h": "#24203A", "L": "#7A74A8", "W": "#F8F9FD", "w": "#D3D8E8", "x": "#DCEFF0", "T": "#52BFA6",
           "t": "#2F8C7A", "P": "#34405E", "B": "#5A3A2A", "b": "#3A261C"}, "#3A7BD5", False, False),
 "knight": ([(g["WINGS"], "back"), (g["CAPE"], "back"), None, (ARMOR, "over"), "FR", (BIG_CROWN, "over")],
          {**SKIN, "H": "#E0E0F0", "h": "#A6A4C4", "L": "#FFFFFF", "A": "#2E2A40", "a": "#1C1928", "x": "#5E5880", "M": "#5A5674",
           "m": "#3A3650", "R": "#C93A4A", "G": "#7FE0F0", "C": "#7A1E30", "V": "#2A2236", "v": "#4A3E5E", "Y": "#F6C453",
           "y": "#C08A2A", "B": "#2E2A40", "b": "#1C1928"}, "#D93A4A", False, False),
}
ims = {}
for ck, (layers, pal, eye, long_sides, blush) in CHARS.items():
    body = g["body_with"](g["FACE_V"])
    lay = []
    for L in layers:
        if L is None: lay.append((body, "over"))
        elif L == "FR": lay.append((fringe_halo(long_sides), "over"))
        else: lay.append(L)
    if ck != "girl" and ck != "knight": lay.insert(0, (body, "over")) if not any(l[0] is body for l in lay) else None
    grid = g["compose"](lay)
    px = render(grid, pal)
    eyes_big(px, eye); mouth(px, blush)
    g["shadow"](px)
    ims[ck] = g["save"](px, f"v3_{ck}")
S = 5
sheet = Image.new("RGBA", (3*(W*S+16)+16, H*S+32), (238, 243, 255, 255))
for c, im in enumerate(ims.values()):
    sheet.alpha_composite(im.resize((W*S, H*S), Image.NEAREST), (16 + c*(W*S+16), 16))
sheet.save(g["HERE"] + "v3_sheet.png"); print("ok")
