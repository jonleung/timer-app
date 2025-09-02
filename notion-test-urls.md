# URLs to Test in Notion

## These SHOULD work (no X-Frame-Options):

### Your Timer App (GitHub Pages)
- http://jonl.org/timer-app/
- https://jonl.org/timer-app/

### Other Timer Sites
- https://e.ggtimer.com/
- https://www.online-stopwatch.com/

## These WON'T work:

### Vercel (Returns 401 + X-Frame-Options: DENY)
- https://timer-app-notion.vercel.app

## The Pattern:

Notion embeds work when:
1. **No X-Frame-Options header** (or set to SAMEORIGIN/ALLOWALL)
2. **Site is accessible** (no auth walls)
3. **Proper protocol** (HTTPS preferred)

GitHub Pages by default has NO X-Frame-Options, making it perfect for Notion embeds!

## Test in Notion:
1. Type `/embed`
2. Paste: `http://jonl.org/timer-app/`
3. Click "Create embed"

If it shows as a bookmark instead of an embed, try:
- Adding a trailing slash
- Using HTTPS instead of HTTP
- Checking if Notion is defaulting to bookmark view (you can switch it)