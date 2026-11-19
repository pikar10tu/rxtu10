"""ปรับสัดส่วนตามตัวเลขที่วัดจากภาพอ้างอิง (ไม่ลอกภาพ): ลำตัวสั้นลง ขา/ถุงเท้ายาวขึ้น บูทใหญ่ขึ้น ตาต่ำลง หน้าม้ายาวลง"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import base as B
import starter as ST
from PIL import Image

def shifted(d, start, by):
    """เลื่อนแถวตั้งแต่ start ลงไป by แถว (ลบได้)"""
    return {(r + by if r >= start else r): s for r, s in d.items()}

# ── หัว: เลื่อนหน้าทั้งหน้าลง 2 แถว (ตาต่ำลง) แล้วให้ผมด้านบนเติมช่อง ──
FACE = shifted({r: B.BODY[r] for r in range(10, 23)}, 10, 2)
# ── ลำตัว: ตัดแถวกลางลำตัว 3 แถว (27–29) ออก แล้วต่อทุกอย่างด้านล่างขึ้นมา ──
def cut(d, rows):
    out = {}
    for r, s in d.items():
        if r in rows: continue
        out[r - sum(1 for x in rows if x < r)] = s
    return out
body_low = {r: s for r, s in ST.BODY.items() if r >= 23}
body_low = cut(body_low, {27, 28, 29})
outfit = cut(ST.OUTFIT, {27, 28, 29})
# ขาเปล่า + ถุงเท้ายาวขึ้น 4 แถว, บูทใหญ่ขึ้น
legs = {r: "..........oSSSo." for r in range(33, 50)}
LOWER = {**{r: s for r, s in outfit.items() if r <= 36},
         **{r: "..........oKKKo." for r in range(37, 42)},
         42: ".........oBBBBo..", 43: ".........oBBBBo..", 44: "........oBBBBBo..", 45: "........oBBBBBo..",
         46: "........oBBBBBBo.", 47: "........oBBBBBBo.", 48: "........oBBbbBBo.", 49: "........oooooooo."}
BODY = {**FACE, **{r + 2: s for r, s in body_low.items() if r + 2 < 33}, **legs}
OUTFIT = {r + 2 if r <= 31 else r: s for r, s in LOWER.items()}

def fringe2():
    d = shifted(B.fringe(True), 9, 2)
    d.update({3: "...........ooooo", 4: ".........ooHHHHH", 5: ".......ooHHHHHHH", 6: "......oHHHLLLLHH", 7: ".....oHHLLHHHHLL",
              8: "....oHHLHHHHHHHH", 9: "....oHHHHHHHHHHH", 10: "....oHHHHHHHHHHH", 11: "....oHHHHHHhHHHH",
              12: "....oHHHHHhHHHhH", 13: "....oHHHhHHHhHHh", 14: ".....oHHHhhSHhSh"})
    return d
HAIR_BACK = shifted(ST.HAIR_BACK, 11, 2)

def face(px, eye):
    m = {"k": "#2A1428", "I": eye, "i": B.mix(eye, "#000000", .5), "X": "#FFFFFF"}
    for x0 in (11, 18):
        B.stamp(px, x0, 15, ["kkk", "kXk", "kik", "kIi", ".kk"], m)
    B.stamp(px, 15, 21, ["m"], {"m": "#D98A84"})
    B.stamp(px, 10, 20, ["bb"], {"b": "#F7B0B0"}); B.stamp(px, 20, 20, ["bb"], {"b": "#F7B0B0"})

def make(hair="c6", skin="s2", eye="e1", extra=None):
    S, s = B.SKINS[skin]; Hh, hh, L = B.HAIRS[hair]
    pal = {"S": S, "s": s, "H": Hh, "h": hh, "L": L, "J": "#F6F0E2", "R": "#34406E", "C": "#34406E",
           "Q": "#34406E", "K": "#FFFFFF", "B": "#8A5A3C", "b": "#6A4430", "x": "#F6C453", **(extra or {})}
    grid = B.compose([(HAIR_BACK, "back"), (BODY, "over"), (OUTFIT, "over"), (fringe2(), "over")])
    px = B.render(grid, pal); face(px, B.EYES[eye]); B.ground(px, cy=58)
    im = Image.new("RGBA", (B.W, B.H), (0, 0, 0, 0))
    for y in range(B.H):
        for x in range(B.W):
            if px[y][x]: im.putpixel((x, y), px[y][x])
    return im.crop((0, 0, B.W, 62))

if __name__ == "__main__":
    shots = {
        "starter2_a": make(),
        "starter2_b": make("c2", "s3", "e4", {"J": "#FFFFFF", "R": "#3F9E86", "C": "#3F9E86", "Q": "#2E3550", "B": "#4A3428", "b": "#33241A"}),
        "starter2_c": make("c7", "s1", "e3", {"J": "#2A2638", "R": "#C93A4A", "C": "#C93A4A", "Q": "#1E1B2A", "K": "#2A2638", "B": "#1E1B2A", "b": "#110F18", "x": "#C9CFDB"}),
    }
    for k, im in shots.items(): im.save(os.path.join(B.OUT, k + ".png"))
    S = 6
    old = [Image.open(os.path.join(B.OUT, f"starter_{c}.png")) for c in "abc"]
    sheet = Image.new("RGBA", (3*(B.W*S+16)+16, 2*(62*S+16)+16), (120, 170, 90, 255))
    for i, im in enumerate(list(shots.values()) + old):
        r, c = divmod(i, 3)
        sheet.alpha_composite(im.resize((B.W*S, im.height*S), Image.NEAREST), (16 + c*(B.W*S+16), 16 + r*(62*S+16)))
    sheet.save(os.path.join(B.OUT, "_starter2.png")); print("ok")
