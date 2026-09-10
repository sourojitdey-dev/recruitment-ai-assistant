"""
Helper script to bundle frontend vanilla JS modules into app.bundle.js
"""
import subprocess
import sys

def bundle():
    print("Bundling app/static/js/app.js -> app/static/js/app.bundle.js ...")
    cmd = ["npx", "--yes", "esbuild", "app/static/js/app.js", "--bundle", "--outfile=app/static/js/app.bundle.js", "--format=iife"]
    result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
    if result.returncode == 0:
        print("Successfully bundled app.bundle.js!")
        print(result.stdout)
    else:
        print("Bundle failed:", result.stderr)
        sys.exit(1)

if __name__ == "__main__":
    bundle()
