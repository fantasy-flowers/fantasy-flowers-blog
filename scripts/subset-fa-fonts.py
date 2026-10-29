#!/usr/bin/env python3
"""
Font Awesome 字体子集化（A4）。

来源唯一：src/styles/fa-subset.css 里的 --fa:"\\xxxx" 码点。
任何新增图标只要写进该 CSS，重跑本脚本即可，无需手工维护码点表。

用法：
    pip install fonttools brotli
    python scripts/subset-fa-fonts.py
    # 或 npm run fonts:subset

产物：
    src/assets/fonts/fa-solid-900.subset.woff2
    src/assets/fonts/fa-regular-400.subset.woff2
    src/assets/fonts/fa-brands-400.subset.woff2
    src/assets/fonts/fa-subset.manifest.json   （供测试校验，勿手改）
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

try:
    from fontTools import subset
    from fontTools.ttLib import TTFont
except ImportError:  # pragma: no cover
    sys.exit(
        "缺少依赖：fontTools / brotli。\n"
        f'请执行："{sys.executable}" -m pip install fonttools brotli\n'
        "（必须装到当前这个解释器里；brotli 缺了无法产出 woff2）"
    )

ROOT = Path(__file__).resolve().parent.parent
CSS_PATH = ROOT / "src" / "styles" / "fa-subset.css"
SRC_DIR = ROOT / "node_modules" / "@fortawesome" / "fontawesome-free" / "webfonts"
OUT_DIR = ROOT / "src" / "assets" / "fonts"
MANIFEST = OUT_DIR / "fa-subset.manifest.json"

FONTS = [
    ("fa-solid-900.woff2", "fa-solid-900.subset.woff2"),
    ("fa-regular-400.woff2", "fa-regular-400.subset.woff2"),
    ("fa-brands-400.woff2", "fa-brands-400.subset.woff2"),
]

FA_PATTERN = re.compile(r'--fa\s*:\s*"\\([0-9a-fA-F]{4,6})"')


def parse_codepoints(css_text: str) -> set[int]:
    """从 CSS 提取全部 --fa 码点。"""
    cps = {int(m, 16) for m in FA_PATTERN.findall(css_text)}
    if not cps:
        sys.exit(f"未在 {CSS_PATH} 中找到任何 --fa 码点，脚本中止。")
    return cps


def subset_font(src: Path, dst: Path, codepoints: set[int]) -> dict:
    """按码点子集化，返回统计信息。"""
    if not src.exists():
        sys.exit(f"源字体不存在：{src}（先 npm install）")

    source = TTFont(src)
    available = source.getBestCmap() or {}
    missing = sorted(cp for cp in codepoints if cp not in available)
    keep = sorted(cp for cp in codepoints if cp in available)

    if not keep:
        sys.exit(f"{src.name} 中没有匹配到任何目标码点，检查 CSS 与字体版本是否一致。")

    options = subset.Options()
    options.flavor = "woff2"
    options.with_zopfli = False          # zopfli 慢且对 woff2 无益（woff2 用 brotli）
    options.layout_closure = False       # 图标走码点渲染，不需要 GSUB 闭包额外保留字形
    options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 16, 17]  # 保留族名/子族名，@font-face 才认得出
    options.name_legacy = True
    options.notdef_outline = True
    options.recalc_bounds = True
    options.drop_tables += ["DSIG"]

    font = subset.load_font(str(src), options)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=keep)
    subsetter.subset(font)
    dst.parent.mkdir(parents=True, exist_ok=True)
    subset.save_font(font, str(dst), options)
    font.close()
    source.close()

    # ---- 校验：每个码点都映射到有轮廓的字形 ----
    check = TTFont(dst)
    cmap = check.getBestCmap() or {}
    glyf = check["glyf"] if "glyf" in check else None
    broken = []
    for cp in keep:
        name = cmap.get(cp)
        if name is None:
            broken.append(f"U+{cp:04X} 无 cmap")
            continue
        if glyf is not None:
            g = glyf[name]
            if g.numberOfContours == 0:
                broken.append(f"U+{cp:04X} 字形为空")
    glyph_total = check["maxp"].numGlyphs
    check.close()

    if broken:
        sys.exit(f"{dst.name} 校验失败：\n  " + "\n  ".join(broken))

    return {
        "file": dst.name,
        "source": src.name,
        "codepoints": [f"U+{cp:04X}" for cp in keep],
        "glyphs": glyph_total,
        "bytes": dst.stat().st_size,
        "source_bytes": src.stat().st_size,
        "skipped": [f"U+{cp:04X}" for cp in missing],
    }


def main() -> None:
    css_text = CSS_PATH.read_text(encoding="utf-8")
    codepoints = parse_codepoints(css_text)
    print(f"CSS 码点 {len(codepoints)} 个：{' '.join(f'{cp:04X}' for cp in sorted(codepoints))}\n")

    results = []
    for src_name, dst_name in FONTS:
        stat = subset_font(SRC_DIR / src_name, OUT_DIR / dst_name, codepoints)
        results.append(stat)
        pct = (1 - stat["bytes"] / stat["source_bytes"]) * 100
        print(
            f"{dst_name:<28} {stat['source_bytes']:>7,} -> {stat['bytes']:>6,} B "
            f"(-{pct:.1f}%)  字形 {stat['glyphs']:>3}  码点 {len(stat['codepoints'])}"
        )
        if stat["skipped"]:
            print(f"  ⚠ 该字体不含：{', '.join(stat['skipped'])}（由其他字重承接，正常）")

    total_before = sum(r["source_bytes"] for r in results)
    total_after = sum(r["bytes"] for r in results)
    print(f"\n合计 {total_before:,} -> {total_after:,} B，节省 {total_before - total_after:,} B "
          f"({(1 - total_after / total_before) * 100:.1f}%)")

    MANIFEST.write_text(
        json.dumps(
            {
                "generator": "scripts/subset-fa-fonts.py",
                "css": "src/styles/fa-subset.css",
                "codepoints": sorted(f"U+{cp:04X}" for cp in codepoints),
                "fonts": results,
                "total_bytes": total_after,
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"清单已写入 {MANIFEST.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
