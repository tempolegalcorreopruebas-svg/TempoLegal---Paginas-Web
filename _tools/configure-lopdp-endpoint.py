#!/usr/bin/env python3
"""Configure one Google Apps Script endpoint in all three standalone tools."""
from pathlib import Path
from urllib.parse import urlsplit
import argparse
import json
import re

ROOT = Path(__file__).resolve().parents[1]

def valid_endpoint(value):
    url = urlsplit(value)
    if url.scheme != 'https' or url.netloc != 'script.google.com' or not re.fullmatch(r'/macros/s/[A-Za-z0-9_-]+/exec',url.path) or url.query or url.fragment:
        raise argparse.ArgumentTypeError('Use the deployed https://script.google.com/macros/s/.../exec URL.')
    return value

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('endpoint',type=valid_endpoint)
    args = parser.parse_args()
    manifest = json.loads((ROOT/'lopdp-tools-manifest.json').read_text())
    changes=[]
    for tool in manifest['tools']:
        path=ROOT/tool['file']
        html=path.read_text()
        updated,count=re.subn(r'(LEAD_ENDPOINT\s*:\s*|endpoint\s*:\s*)([\"\'])([^\"\']*)([\"\'])',lambda m:m[1]+m[2]+args.endpoint+m[4],html,count=1)
        if count != 1:raise SystemExit('Endpoint slot missing in '+tool['file'])
        changes.append((path,updated))
    for path,html in changes:path.write_text(html)
    print('Configured all three tools. Live spreadsheet rows and notification emails still require verification.')

if __name__=='__main__':main()
