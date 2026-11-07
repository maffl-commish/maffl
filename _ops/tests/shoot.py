#!/usr/bin/env python3
"""Phone screenshots of the MAFFL REEL lab app (lab/index.html) against the local mock backend (mock.js).

  python3 shoot.py <name> [--tab home|team|match|league|chat|more] [--js "<js run after load>"] [--wait ms]
                          [--full] [--html PATH] [--repo DIR] [--fonts]

Writes $SHOTS_DIR/<name>.png (default /tmp/maffl-shots) (390x844 @2x, iPhone UA) and prints console errors, page errors, failed requests and the
app's own error log (You → App errors). Exit code 1 if any JS error was seen.

How it works: serves the repo over a local HTTP server (lab/index.html swapped for --html PATH if given), starts
`node mock.js` on a free port, signs in as Mike Murello (maffl_lab_owner / maffl_lab_pin / maffl_lab_api in
localStorage before the app boots), silences the beta feedback nudges, and also routes any request to
script.google.com to the mock. External fonts are blocked unless --fonts (the sandbox usually can't reach them).
--js runs after the app has booted; it may return a Promise. Handy globals it can use: `sleep(ms)`, `click(sel)`.
"""
import argparse, functools, http.server, json, os, socket, subprocess, sys, threading, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.environ.get("SHOTS_DIR", "/tmp/maffl-shots")
UA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 "
      "(KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1")
HELPERS = """
window.sleep = (ms) => new Promise(r => setTimeout(r, ms));
window.click = (sel) => { const el = typeof sel === 'string' ? document.querySelector(sel) : sel; if (!el) throw new Error('click: no element ' + sel); el.click(); return el; };
"""


def free_port():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close(); return p


class Handler(http.server.SimpleHTTPRequestHandler):
    html_override = None

    def log_message(self, *a):
        pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        path = self.path.split("?")[0].split("#")[0]
        if self.html_override and path in ("/lab/", "/lab/index.html"):
            data = open(self.html_override, "rb").read()
            self.send_response(200); self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(data))); self.end_headers(); self.wfile.write(data); return
        return super().do_GET()


def start_static(repo, html):
    Handler.html_override = os.path.abspath(html) if html else None
    port = free_port()
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Handler, directory=repo))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, port


def start_mock(repo, delay=""):
    port = free_port()
    env = dict(os.environ, MAFFL_REPO=repo, MOCK_QUIET=os.environ.get("MOCK_QUIET", "1"), MOCK_DELAY=delay)
    p = subprocess.Popen(["node", os.path.join(HERE, "mock.js"), str(port)], env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    line = p.stdout.readline()
    if "MOCK READY" not in line:
        raise SystemExit("mock.js didn't start:\n" + line + p.stderr.read())
    return p, port


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("name")
    ap.add_argument("--tab", default="home", choices=["home", "team", "match", "league", "chat", "more"])
    ap.add_argument("--js", default=None)
    ap.add_argument("--wait", type=int, default=1200, help="ms to wait after boot (and again after --js)")
    ap.add_argument("--full", action="store_true", help="full-page screenshot (the app scrolls inside #views, so this also unclips it)")
    ap.add_argument("--html", default=None, help="alternate copy of lab/index.html (default: the repo's)")
    ap.add_argument("--repo", default=os.environ.get("MAFFL_REPO", os.path.abspath(os.path.join(HERE, "..", ".."))))
    ap.add_argument("--tour", action="store_true", help="let the first-time tour run (suppressed by default)")
    ap.add_argument("--delay", default="", help="slow mock actions down, e.g. summary:1500,daily:800 (loading states, races)")
    ap.add_argument("--fonts", action="store_true", help="let Google Fonts load (blocked by default)")
    a = ap.parse_args()

    from playwright.sync_api import sync_playwright
    srv, sport = start_static(a.repo, a.html)
    mock, mport = start_mock(a.repo, a.delay)
    mock_url = f"http://127.0.0.1:{mport}/exec"
    os.makedirs(SHOTS, exist_ok=True)
    out = os.path.join(SHOTS, a.name + ".png")
    problems = {"console": [], "page": [], "failed": [], "blocked": []}
    try:
        with sync_playwright() as pw:
            br = pw.chromium.launch(executable_path="/usr/bin/google-chrome", headless=True, args=["--no-proxy-server"] if not a.fonts else [])
            ctx = br.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True, user_agent=UA,
                                 locale="en-US", timezone_id="America/New_York")
            pins = json.load(urllib.request.urlopen(f"http://127.0.0.1:{mport}/__pins"))
            ctx.add_init_script("""(() => { try {
              const day = new Date().toDateString(), seen = {}; ['a','b','c'].forEach(k => seen['harness:' + k] = { d: day, t: Date.now() });
              localStorage.setItem('maffl_lab_api', %s); localStorage.setItem('maffl_lab_owner', 'Mike Murello'); localStorage.setItem('maffl_lab_pin', %s);
              localStorage.setItem('maffl_lab_fbseen', JSON.stringify(seen)); localStorage.setItem('maffl_lab_sim', 'off');
              if (%s) ['home','team','match','chat','league','more'].forEach(t => localStorage.setItem('maffl_lab_tour_' + t + '_mike murello', '1'));
            } catch (e) {} })();""" % (json.dumps(mock_url), json.dumps(pins["Mike Murello"]), "false" if a.tour else "true") + HELPERS)

            def route(r):
                u = r.request.url
                if u.startswith("https://script.google.com") or u.startswith("https://script.googleusercontent.com"):
                    q = u.split("?", 1)[1] if "?" in u else ""
                    resp = r.fetch(url=mock_url + ("?" + q if q else ""), method=r.request.method, post_data=r.request.post_data)
                    return r.fulfill(response=resp)
                if u.startswith(f"http://127.0.0.1:"):
                    return r.continue_()
                if a.fonts and ("fonts.googleapis.com" in u or "fonts.gstatic.com" in u):
                    return r.continue_()
                problems["blocked"].append(u)
                return r.abort()
            ctx.route("**/*", route)
            page = ctx.new_page()
            page.on("console", lambda m: problems["console"].append(m.text) if m.type == "error" else None)
            page.on("pageerror", lambda e: problems["page"].append(str(e)))
            page.on("requestfailed", lambda r: problems["failed"].append(r.url) if r.url.startswith("http://127.0.0.1") else None)
            page.goto(f"http://127.0.0.1:{sport}/lab/index.html#{a.tab}", wait_until="load")
            page.wait_for_function("() => { const b = document.getElementById('boot'); return b && b.style.display === 'none'; }", timeout=20000)
            page.wait_for_timeout(a.wait)
            if a.js:
                try:
                    res = page.evaluate("async () => { %s\n }" % a.js if "return" in a.js or ";" in a.js else "async () => (%s)" % a.js)
                    if res is not None:
                        print("js →", json.dumps(res)[:500])
                except Exception as e:
                    problems["page"].append("--js failed: " + str(e).splitlines()[0])
                page.wait_for_timeout(a.wait)
            if a.full:  # the app scrolls inside its own containers; let them grow so a full-page shot shows everything
                page.add_style_tag(content="html,body,#app,.app,main,#views,.view.on{height:auto!important;max-height:none!important;overflow:visible!important} .psheet:not(.on),.sscrim:not(.on),.chat:not(.on),.cscrim:not(.on),.dk:not(.on),.tour:not(.on){display:none!important}")
                page.wait_for_timeout(200)
            page.screenshot(path=out, full_page=a.full)
            app_errs = page.evaluate("() => { try { return JSON.parse(localStorage.getItem('maffl_lab_errs') || '[]'); } catch (e) { return []; } }")
            br.close()
    finally:
        mock.terminate(); srv.shutdown()
    print("shot:", out)
    if problems["blocked"]:  # our own aborts (fonts etc.) show up as console "Failed to load resource"; drop those
        n = len(problems["blocked"])
        problems["console"] = [m for m in problems["console"] if not (m.startswith("Failed to load resource: net::ERR_FAILED") and (n := n - 1) >= 0)]
        print("blocked external:", ", ".join(sorted(set(u.split("/")[2] for u in problems["blocked"]))))
    bad = False
    for k, label in (("page", "page errors"), ("console", "console errors"), ("failed", "failed local requests")):
        if problems[k]:
            bad = bad or k != "failed"
            print(f"{label} ({len(problems[k])}):"); [print("  -", x[:300]) for x in problems[k]]
    if app_errs:
        bad = True
        print(f"app error log ({len(app_errs)}):"); [print("  -", e.get("where"), ":", e.get("msg"), "|", e.get("line", "")[:200]) for e in app_errs]
    if not bad:
        print("no JS errors")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
