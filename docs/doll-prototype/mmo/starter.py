"""ลองสัดส่วนแบบตัวเริ่มเกม MMO (18 พ.ย. 2026): ผมฟูใหญ่ หน้าเล็ก ตัวสั้น แขนเสื้อพอง ปลอกข้อมือ บูทใหญ่
ใช้ตัวไล่เงา/หน้า/ตาจาก base.py · ชุดออกแบบเอง ไม่ลอกตัวละครในเกม"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import base as B
from PIL import Image

FACE = {r: B.BODY[r] for r in range(10, 23)}
BODY = {**FACE,
23: "..........oooSSS", 24: "........ooSSSSSS", 25: ".......oSSSSSSSS", 26: "......oSSooSSSSS",
**{r: "......oSso.oSSSS" for r in range(27, 33)},
33: "......oSSo.oSSSS", 34: "......osso.oSSSS", 35: ".......oo..oSSSS", 36: "...........oSSSo",
**{r: "..........oSSSo." for r in range(37, 46)},
}
# ชุด: แจ็กเก็ตแขนพอง (J) ปกกรม (R) · ปลอกข้อมือ (C) · กระโปรงบาน (Q) · ถุงเท้ายาว (K) · บูทใหญ่ (B)
OUTFIT = {
24: "........ooJJoRRR", 25: ".......oJJJJoRRR", 26: ".....oJJJJoJJoRR", 27: ".....oJJJJoJJJoR",
28: ".....oJJJJoJJJJx", 29: "......oJJJoJJJJJ", 30: "......oJJJoJJJJx", 31: ".....oCCCCoJJJJJ",
32: ".....oCxCCoQQQQQ", 33: "......oooo.oQQQQ", 34: "..........oQQQQQ", 35: ".........oQQQQQQ",
36: ".........oQQQQQQ", 37: "........oQQQQQQQ", 38: "........oQxQQxQQ", 39: "........oooooooo",
40: "..........oKKKo.", 41: "..........oKKKo.", 42: ".........oBBBBo..",
43: ".........oBBBBo..", 44: "........oBBBBBo..", 45: "........oBBBBBBo.", 46: "........oBBBBBBo.",
47: "........oooooooo.",
}
HAIR_BACK = {11: "....oHHHHH......", 12: "...oHHHHHH......", 13: "...oHHHHHH......", 14: "..oHHHHHHH......",
             **{r: "..oHHhHHHH......" for r in range(15, 24)}, 24: "..oHHhHHH.......", 25: "..oHhHHH........",
             26: "..oHhHHo........", 27: "...oHHo.........", 28: "...ooo.........."}

def make(hair="c6", skin="s2", eye="e1", pal_extra=None):
    S, s = B.SKINS[skin]; Hh, hh, L = B.HAIRS[hair]
    pal = {"S": S, "s": s, "H": Hh, "h": hh, "L": L, "J": "#F6F0E2", "R": "#34406E", "C": "#34406E",
           "Q": "#34406E", "K": "#FFFFFF", "B": "#8A5A3C", "x": "#F6C453", **(pal_extra or {})}
    big_fringe = B.fringe(True)
    big_fringe.update({4: ".........ooooooo", 5: ".......ooHHHHHHH", 3: "...........ooooo"})   # ผมฟูสูงขึ้น
    grid = B.compose([(HAIR_BACK, "back"), (BODY, "over"), (OUTFIT, "over"), (big_fringe, "over")])
    px = B.render(grid, pal)
    B.face(px, B.EYES[eye]); B.ground(px, cy=56)
    im = Image.new("RGBA", (B.W, B.H), (0, 0, 0, 0))
    for y in range(B.H):
        for x in range(B.W):
            if px[y][x]: im.putpixel((x, y), px[y][x])
    return im.crop((0, 0, B.W, 60))

if __name__ == "__main__":
    shots = {
        "starter_a": make(),
        "starter_b": make("c2", "s3", "e4", {"J": "#FFFFFF", "R": "#3F9E86", "C": "#3F9E86", "Q": "#2E3550", "B": "#4A3428"}),
        "starter_c": make("c7", "s1", "e3", {"J": "#2A2638", "R": "#C93A4A", "C": "#C93A4A", "Q": "#1E1B2A", "K": "#2A2638", "B": "#1E1B2A", "x": "#C9CFDB"}),
    }
    for k, im in shots.items(): im.save(os.path.join(B.OUT, k + ".png"))
    S = 6
    sheet = Image.new("RGBA", (3*(B.W*S+16)+16, 60*S+32), (120, 170, 90, 255))
    for i, im in enumerate(shots.values()):
        sheet.alpha_composite(im.resize((B.W*S, 60*S), Image.NEAREST), (16 + i*(B.W*S+16), 16))
    sheet.save(os.path.join(B.OUT, "_starter.png")); print("ok")
