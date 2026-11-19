"""โครงหน้าใหม่ 3 แบบ: หน้าแคบ หน้าม้าต่ำ ปอยข้างแก้ม ตาชิดกัน คางเรียว"""
src = open(r"C:/Users/winusr/AppData/Local/Temp/claude/b3373d7e6c043e38/ea666185-e1d0-4e77-b1aa-b12ad1900898/scratchpad/dollasura/build.py", encoding="utf-8").read()
src = src.split("SKIN = dict(")[0]
ns = {}; exec(compile(src, "build", "exec"), ns)
from PIL import Image
g = ns

def body_with(face_rows):
    b = dict(g["BODY"])
    for r in range(10, 23): b.pop(r, None)
    b.update(face_rows)
    return b

# หน้าเรียว (V) กับหน้ามน (round) — ครึ่งซ้าย แกนกลางอยู่ระหว่างคอลัมน์ 15|16
FACE_V = {10: "..........oSSSSS", 11: ".........oSSSSSS", 12: ".........oSSSSSS", 13: ".........oSSSSSS",
          14: ".........oSSSSSS", 15: ".........oSSSSSS", 16: ".........oSSSSSS", 17: ".........osSSSSS",
          18: "..........osSSSS", 19: "...........osSSS", 20: "............ossS", 21: ".............oSS",
          22: ".............oSS"}
FACE_R = {10: "..........oSSSSS", 11: ".........oSSSSSS", 12: "........oSSSSSSS", 13: "........oSSSSSSS",
          14: "........oSSSSSSS", 15: "........oSSSSSSS", 16: "........oSSSSSSS", 17: "........osSSSSSS",
          18: ".........osSSSSS", 19: "..........ossSSS", 20: "............osss", 21: ".............oSS",
          22: ".............oSS"}

# ผมหน้า: หน้าม้าลงถึงคิ้ว (แถว 12) + ปอยข้างแก้มยาวถึงคาง
def fringe(long_sides=True):
    d = {4: "..........oooooo", 5: "........ooHHHHHH", 6: ".......oHHHHHLLH", 7: "......oHHHHHLLHH",
         8: ".....oHHHHHHHHHH", 9: ".....oHHHHHHHHHH", 10: ".....oHHHHHHHHHH", 11: ".....oHHHHHhHHHH",
         12: ".....oHHHHhHHhHh", 13: "......oHHh.Hh.h.", 14: "......oHHo......", 15: "......oHHo......",
         16: "......oHHo......", 17: "......oHHHo.....", 18: "......oHHHo.....", 19: "......oHHHo.....",
         20: ".......oHHo.....", 21: ".......oHo......"}
    if not long_sides:
        for r in (19, 20, 21): d.pop(r)
        d[18] = ".......oo......."
    return d

def back_long():
    return g["HAIR_LONG_BACK"]

def eyes_tall(px, eye):       # A: แท่งตั้ง 2x4 ชิดกัน
    m = {"k": "#2A1620", "I": eye, "X": "#FFFFFF"}
    for x0 in (12, 18):
        g["stamp"](px, x0, 13, ["kk", "Xk", "kI", "kk"], m)

def eyes_anime(px, eye):      # B: 3x4 มีตาดำสี + ประกาย
    m = {"k": "#2A1620", "I": eye, "i": g["mix"](eye, "#000", .45), "X": "#FFFFFF"}
    for x0 in (11, 18):
        g["stamp"](px, x0, 13, ["kkk", "kXI", "kIi", ".kk"], m)

def mouth(px, blush=True):
    g["stamp"](px, 15, 19, ["mm"], {"m": "#C9807A"})
    if blush:
        g["stamp"](px, 11, 17, ["b"], {"b": "#F4A6A6"}); g["stamp"](px, 20, 17, ["b"], {"b": "#F4A6A6"})

SKIN = dict(S="#FFE3CF", s="#EDBBA0")
CHARS = {
 "girl": (lambda body, fr: [(g["HAIR_LONG_BACK"], "back"), (body, "over"), (g["DRESS"], "over"), (fr, "over"), (g["BUNNY"], "over")],
          {**SKIN, "H": "#F2A6C0", "h": "#D07A9C", "L": "#FFE0EA", "D": "#FFFFFF", "d": "#E6D6EE", "R": "#E86A8A",
           "B": "#E86A8A", "b": "#B84A6A", "E": "#FFFFFF", "e": "#F7B6C8"}, "#C04A8A", True),
 "pharm": (lambda body, fr: [(body, "over"), (g["PANTS"], "over"), (g["COAT"], "over"), (fr, "over")],
          {**SKIN, "H": "#3A3550", "h": "#26223A", "L": "#6A6490", "W": "#F7F8FC", "w": "#D3D8E8", "T": "#52BFA6", "t": "#2F8C7A",
           "P": "#34405E", "B": "#5A3A2A", "b": "#3A261C"}, "#3A7BD5", False),
 "knight": (lambda body, fr: [(g["WINGS"], "back"), (g["CAPE"], "back"), (body, "over"), (g["ARMOR"], "over"), (fr, "over"), (g["CROWN"], "over")],
          {**SKIN, "H": "#DCDCEC", "h": "#A6A4C4", "L": "#FFFFFF", "A": "#2E2A40", "a": "#1C1928", "M": "#5A5674", "m": "#3A3650",
           "R": "#C93A4A", "G": "#C9CFDB", "C": "#7A1E30", "V": "#2A2236", "v": "#4A3E5E", "Y": "#F6C453", "y": "#C08A2A",
           "B": "#2E2A40", "b": "#1C1928"}, "#D93A4A", False),
}
VARIANTS = {
 "A": (FACE_V, eyes_tall),     # เหมือนในเกมที่สุด
 "B": (FACE_V, eyes_anime),    # หน้าเรียว ตาอนิเมะ
 "C": (FACE_R, eyes_anime),    # หน้ามน ตาอนิเมะ
}
ims = {}
for vk, (face, eyes) in VARIANTS.items():
    for ck, (layers, pal, eye, long_sides) in CHARS.items():
        body = body_with(face)
        grid = g["compose"](layers(body, fringe(long_sides)))
        px = g["render"](grid, pal)
        eyes(px, eye); mouth(px, blush=(ck == "girl"))
        g["shadow"](px)
        ims[vk+ck] = g["save"](px, f"face{vk}_{ck}")
# ของเดิมไว้เทียบ
S = 5; W, H = g["W"], g["H"]
sheet = Image.new("RGBA", (3*(W*S+16)+16, 3*(H*S+16)+16), (238, 243, 255, 255))
for r, vk in enumerate("ABC"):
    for c, ck in enumerate(CHARS):
        sheet.alpha_composite(ims[vk+ck].resize((W*S, H*S), Image.NEAREST), (16 + c*(W*S+16), 16 + r*(H*S+16)))
sheet.save(g["HERE"] + "faces_sheet.png"); print("ok")
