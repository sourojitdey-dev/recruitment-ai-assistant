"""
Helper script to bundle and minify frontend JS and CSS assets.
Produces code-split ESM modules in app/static/js/dist/ and minified CSS in app/static/css/style.min.css
"""
import subprocess
import sys

def bundle():
    print("1. Minifying CSS: app/static/css/style.css -> app/static/css/style.min.css ...")
    cmd_css = [
        "npx", "--yes", "esbuild",
        "app/static/css/style.css",
        "--minify",
        "--outfile=app/static/css/style.min.css"
    ]
    res_css = subprocess.run(cmd_css, capture_output=True, text=True, shell=True)
    if res_css.returncode != 0:
        print("CSS minification failed:", res_css.stderr)
        sys.exit(1)
    print("   CSS minification complete!")

    print("2. Bundling & Code-Splitting JS: app/static/js/app.js -> app/static/js/dist/ ...")
    cmd_js = [
        "npx", "--yes", "esbuild",
        "app/static/js/app.js",
        "--bundle",
        "--splitting",
        "--format=esm",
        "--outdir=app/static/js/dist",
        "--minify"
    ]
    res_js = subprocess.run(cmd_js, capture_output=True, text=True, shell=True)
    if res_js.returncode != 0:
        print("JS bundle failed:", res_js.stderr)
        sys.exit(1)
    print("   JS code-split bundling complete!")
    print(res_js.stdout)

if __name__ == "__main__":
    bundle()
