"""Build current privacy and terms pages from the approved legal sources."""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).with_name("build-legal-pages.py")),run_name="__main__")
