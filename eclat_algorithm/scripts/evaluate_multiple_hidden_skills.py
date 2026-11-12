"""Frozen validation assessment CLI; --verify reproduces existing results."""
import argparse
import sys
from pathlib import Path
BASE=Path(__file__).resolve().parents[2]
if str(BASE) not in sys.path:sys.path.insert(0,str(BASE))
from eclat_algorithm.assessment import assess

def run():
    return assess('validation',write=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--verify',action='store_true',help='Reproduce saved metrics without overwriting them')
    args=parser.parse_args()
    assess('validation',write=not args.verify)
