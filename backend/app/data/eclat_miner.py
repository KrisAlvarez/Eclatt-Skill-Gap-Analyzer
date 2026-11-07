"""Backward-compatibility shim for backend.app.data.eclat_miner.

Redirects directly to eclat_algorithm.miner.ECLATMiner.
"""

from eclat_algorithm.miner import ECLATMiner

__all__ = ["ECLATMiner"]
