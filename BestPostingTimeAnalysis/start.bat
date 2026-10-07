@echo off
echo Starting local web server...
echo The dashboard will open in your default browser.
echo Press Ctrl+C in this window to stop the server when you are done.

start http://localhost:8000
python -m http.server 8000
