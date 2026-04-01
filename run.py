import webview
import os
dist = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist', 'index.html')
webview.create_window('Zobell Mosaic Canvas Calculator', url=dist, width=1600, height=1000, resizable=True, min_size=(1200, 700))
webview.start()
