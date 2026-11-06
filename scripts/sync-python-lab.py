"""Mirror the public Python lab; stage every download before changing the checkout."""
import json, pathlib, re, shutil, tempfile, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
BASE = "https://python-evening-lab.dendy88.chatgpt.site/"
ROOT = pathlib.Path("python-lab")
paths = set(json.loads(pathlib.Path("scripts/python-lab-files.json").read_text()))
# Include previously discovered assets on subsequent synchronizations.
paths.update(p.relative_to(ROOT).as_posix() for p in ROOT.rglob("*") if p.is_file())
suffixes = (".html", ".css", ".js", ".mjs", ".py", ".json", ".svg", ".webp", ".png", ".jpg", ".mp3", ".ttf", ".woff2", ".zip", ".wasm", ".txt")
def fetch(name):
    url = BASE + urllib.parse.quote(name, safe="/")
    with urllib.request.urlopen(url, timeout=90) as response:
        body = response.read()
        if response.headers.get_content_type() == "text/html" and not name.endswith(".html"):
            raise RuntimeError("Unexpected HTML for " + name)
        return name, body
with tempfile.TemporaryDirectory() as temp:
    stage = pathlib.Path(temp)
    done = set()
    while paths - done:
        batch = sorted(paths - done)
        with ThreadPoolExecutor(max_workers=6) as pool:
            results = list(pool.map(fetch, batch))
        for name, body in results:
            target = stage / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(body)
            done.add(name)
            if name.endswith((".html", ".css", ".js", ".mjs")) and not name.startswith("python/"):
                text = body.decode("utf-8")
                for ref in re.findall(r"""['"\(]([^'"\s<>\)]+)['"\)]""", text):
                    if not ref.startswith(("./", "../", "assets/", "audio/", "fonts/", "qa/")): continue
                    parsed = urllib.parse.urlparse(urllib.parse.urljoin(BASE + name, ref))
                    if parsed.netloc != urllib.parse.urlparse(BASE).netloc: continue
                    candidate = urllib.parse.unquote(parsed.path).lstrip("/")
                    if candidate.endswith(suffixes) and not any(c in candidate for c in "${}*") and ".." not in pathlib.PurePosixPath(candidate).parts:
                        paths.add(candidate)
    for name in done:
        target = ROOT / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(stage / name, target)
print("Synchronized", len(done), "files.")
