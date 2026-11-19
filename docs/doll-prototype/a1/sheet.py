import json, sys
from PIL import Image
src, out, S = sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 5
d = json.load(open(src, encoding="utf-8"))
cols = 8
w, h = 48 * S, 52 * S
sheet = Image.new("RGBA", (cols * (w + 6) + 6, ((len(d) + cols - 1) // cols) * (h + 6) + 6), (207, 226, 242, 255))
for k, o in enumerate(d):
    px = o["px"]; im = Image.new("RGBA", (48, 52))
    for y in range(52):
        for x in range(48):
            c = px[y][x]
            if c: im.putpixel((x, y), tuple(int(c[i:i+2], 16) for i in (1, 3, 5)) + (255,))
    r, c = divmod(k, cols)
    sheet.alpha_composite(im.resize((w, h), Image.NEAREST), (6 + c * (w + 6), 6 + r * (h + 6)))
sheet.save(out)
