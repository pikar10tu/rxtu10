"""รอบ 5: ปรับกรอบหน้าบนตัวรอบ 4 — 4 แบบ"""
src = open(r"C:/Users/winusr/AppData/Local/Temp/claude/b3373d7e6c043e38/ea666185-e1d0-4e77-b1aa-b12ad1900898/scratchpad/dollasura/v4.py", encoding="utf-8").read()
src = src.split("\nims = {}", 1)[0]
ns = {}; exec(compile(src, "v4", "exec"), ns)
g, W, H = ns["g"], ns["W"], ns["H"]; v3 = ns["ns"]
from PIL import Image

FACES = {
 "V": g["FACE_V"],                                         # เดิม คางแหลม
 "heart": {10: "..........oSSSSS", 11: ".........oSSSSSS", 12: "........oSSSSSSS", 13: "........oSSSSSSS",
           14: "........oSSSSSSS", 15: "........oSSSSSSS", 16: ".........oSSSSSS", 17: ".........osSSSSS",
           18: "..........osSSSS", 19: "...........osSSS", 20: "............osSS", 21: ".............osS",
           22: ".............oSS"},                       # แก้มกว้างระดับตา คางยาวเรียว
 "egg": {10: "..........oSSSSS", 11: ".........oSSSSSS", 12: ".........oSSSSSS", 13: "........oSSSSSSS",
         14: "........oSSSSSSS", 15: "........oSSSSSSS", 16: "........oSSSSSSS", 17: "........osSSSSSS",
         18: ".........osSSSSS", 19: "..........ossSSS", 20: "............osss", 21: ".............oSS",
         22: ".............oSS"},                         # มนนุ่ม คางเล็กกลม
 "framed": g["FACE_V"],                                   # V + ปอยผมบังแก้มมากขึ้น
}

def fringe_for(kind, long_sides):
    d = v3["fringe_halo"](long_sides)
    if kind == "framed":
        d.update({13: "......oHHHhHh.h.", 14: "......oHHHo.....", 15: "......oHHHo.....", 16: "......oHHHo.....",
                  17: "......oHHHHo....", 18: "......oHHHHo....", 19: ".......oHHHo...." if long_sides else ".......ooo......",
                  20: ".......oHHo....." if long_sides else "................"})
    return d

ims = {}
for fk, face in FACES.items():
    for ck, (layers, pal, eye, long_sides, blush) in ns["CHARS"].items():
        body = g["body_with"](face)
        lay = []
        for L in layers:
            if L is None: lay.append((body, "over"))
            elif L == "FR": lay.append((fringe_for(fk, long_sides), "over"))
            else: lay.append(L)
        grid = g["compose"](lay)
        px = ns["render4"](grid, pal)
        v3["eyes_big"](px, eye); v3["mouth"](px, blush)
        g["shadow"](px)
        ims[(fk, ck)] = g["save"](px, f"v5_{fk}_{ck}")

# แผ่นซูมหน้า: แถว = กรอบหน้า, คอลัมน์ = ตัวละคร (ครอปหัว)
S = 8; cw, ch = 24, 26
sheet = Image.new("RGBA", (3*(cw*S+12)+12, 4*(ch*S+12)+12), (238, 243, 255, 255))
for r, fk in enumerate(FACES):
    for c, ck in enumerate(ns["CHARS"]):
        im = ims[(fk, ck)].crop((8, 9, 8+cw, 9+ch)).resize((cw*S, ch*S), Image.NEAREST)
        sheet.alpha_composite(im, (12 + c*(cw*S+12), 12 + r*(ch*S+12)))
sheet.save(g["HERE"] + "v5_faces.png"); print("ok")

