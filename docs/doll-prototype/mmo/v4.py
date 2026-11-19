"""รอบ 4: เงาไล่ 4 เฉดแบบทรงกระบอกต่อชิ้น + ลายชุด (ลูกไม้ กระดุม กระเป๋า ขอบเกราะ)"""
src = open(r"C:/Users/winusr/AppData/Local/Temp/claude/b3373d7e6c043e38/ea666185-e1d0-4e77-b1aa-b12ad1900898/scratchpad/dollasura/v3.py", encoding="utf-8").read()
src = src.split("\nims = {}", 1)[0]
ns = {"__file__": "v3"}; exec(compile(src, "v3", "exec"), ns)
g = ns["g"]; mix, rgba, W, H = ns["mix"], ns["rgba"], ns["W"], ns["H"]
from PIL import Image

FLAT = set("xX")          # ลาย/ประกาย ไม่ต้องไล่เงา

def render4(grid, pal, outline="#3A2028"):
    out = [[None]*W for _ in range(H)]
    filled = lambda x, y: 0 <= x < W and 0 <= y < H and grid[y][x] != "."
    # ไล่ทีละแถว: หาช่วงต่อเนื่องของวัสดุเดียวกัน (นับลาย x เป็นส่วนของผืนผ้า) แล้วไล่เฉดตามตำแหน่งในช่วง
    for y in range(H):
        x = 0
        while x < W:
            ch = grid[y][x]
            if ch in ".o" or ch in FLAT:
                x += 1; continue
            x1 = x
            while x1 + 1 < W and (grid[y][x1+1] == ch or grid[y][x1+1] in FLAT): x1 += 1
            n = x1 - x + 1
            base = pal[ch]
            dark = "#C8607A" if ch in "Ss" else "#3E2A66"
            ramp = [mix(base, "#FFF8EC", .38), base, mix(base, dark, .18), mix(base, dark, .36)]
            for i in range(x, x1+1):
                c = grid[y][i]
                if c in FLAT:
                    out[y][i] = rgba(pal[c]); continue
                t = (i - x) / max(1, n - 1)
                k = 0 if t < .18 else 1 if t < .58 else 2 if t < .84 else 3
                if n <= 2: k = 1 if i == x else 2
                # แสงจากบน: แถวบนสุดของชิ้นสว่างขึ้นหนึ่งขั้น · แถวล่างสุดมืดขึ้นหนึ่งขั้น
                if not (filled(i, y-1) and grid[y-1][i] == c): k = max(0, k-1)
                elif not (filled(i, y+1) and grid[y+1][i] == c): k = min(3, k+1)
                out[y][i] = rgba(ramp[k])
            x = x1 + 1
    for y in range(H):
        for x in range(W):
            if grid[y][x] != "o": continue
            n4 = [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]
            mats = [grid[q][p] for p, q in n4 if filled(p, q) and grid[q][p] not in "o"]
            if all(filled(*p) for p in n4) and mats:
                out[y][x] = rgba(mix(pal[mats[0]], "#4A2440", .40))
            else:
                out[y][x] = rgba(outline)
    return out

def patch(layer, edits):
    lay = dict(layer)
    for r, c, s in edits:
        row = lay.get(r, "." * 16)
        lay[r] = row[:c] + s + row[c+len(s):]
    return lay

# ลูกไม้ชายกระโปรง + โบว์คาดเอว
DRESS = patch(ns["DRESS"], [(39, 5, "DxDDxDDxDDx"), (40, 4, "oXdXdXdXdXdX"), (41, 4, "o.o.o.o.o.o."), (31, 11, "RRRXR")])
# กาวน์: กระดุม 2 เม็ด กระเป๋าอก กระเป๋าล่าง ปกพับ
COAT = patch(ns["COAT"], [(26, 10, "oo"), (27, 10, "Xo"), (37, 9, "oooo"), (38, 9, "oXWW"), (28, 14, "X"), (32, 14, "X")])
# เกราะ: ขอบบ่าเงาวาว ทับทรวง เข็มขัดหัวเพชร
ARMOR = patch(ns["ARMOR"], [(24, 6, "MXMM"), (26, 13, "GGG"), (27, 13, "GXG"), (30, 13, "RXR")])

CHARS = dict(ns["CHARS"])
CHARS["girl"] = ([(ns["g"]["HAIR_LONG_BACK"], "back"), None, (DRESS, "over"), "FR", (ns["BIG_BUNNY"], "over")],
                 {**CHARS["girl"][1], "X": "#FFFFFF"}, *CHARS["girl"][2:])
CHARS["pharm"] = ([None, (ns["g"]["PANTS"], "over"), (COAT, "over"), "FR"], {**CHARS["pharm"][1], "X": "#7FC8B5"}, *CHARS["pharm"][2:])
CHARS["knight"] = ([(ns["g"]["WINGS"], "back"), (ns["g"]["CAPE"], "back"), None, (ARMOR, "over"), "FR", (ns["BIG_CROWN"], "over")],
                   {**CHARS["knight"][1], "X": "#FFFFFF"}, *CHARS["knight"][2:])

ims = {}
for ck, (layers, pal, eye, long_sides, blush) in CHARS.items():
    body = g["body_with"](g["FACE_V"])
    lay = []
    for L in layers:
        if L is None: lay.append((body, "over"))
        elif L == "FR": lay.append((ns["fringe_halo"](long_sides), "over"))
        else: lay.append(L)
    grid = g["compose"](lay)
    px = render4(grid, pal)
    ns["eyes_big"](px, eye); ns["mouth"](px, blush)
    g["shadow"](px)
    ims[ck] = g["save"](px, f"v4_{ck}")
S = 5
sheet = Image.new("RGBA", (3*(W*S+16)+16, H*S+32), (238, 243, 255, 255))
for c, im in enumerate(ims.values()):
    sheet.alpha_composite(im.resize((W*S, H*S), Image.NEAREST), (16 + c*(W*S+16), 16))
sheet.save(g["HERE"] + "v4_sheet.png"); print("ok")
