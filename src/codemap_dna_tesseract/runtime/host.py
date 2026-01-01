"""Host process that dispatches function addresses to sandboxed worker subprocesses."""
import sys
import json
import subprocess
import os
from . import registry
import time

# Simple caching and metrics for demonstration
_registry_cache = None
_metrics = {
    "calls": 0,
    "cache_hits": 0,
    "registry_loads": 0,
    "total_worker_time": 0.0,
    "total_local_time": 0.0,
}


def _load_registry():
    global _registry_cache
    if _registry_cache is None:
        _registry_cache = registry.build_registry()
        _metrics["registry_loads"] += 1
    else:
        _metrics["cache_hits"] += 1
    return _registry_cache


def call_address(address: str, args=None, kwargs=None, timeout=5, allow_local=True):
    """Call the address. If allow_local is True and the module is importable in-process,
    the host will call it directly (simulating energy savings) instead of launching the worker.
    """
    _metrics["calls"] += 1
    reg = _load_registry()
    target = reg.get(address)
    if not target:
        raise KeyError(f"address not found: {address}")
    module_name, func_name = target

    # Try local call to avoid subprocess overhead (basic heuristic)
    if allow_local:
        try:
            start = time.perf_counter()
            mod = __import__(module_name, fromlist=[func_name])
            func = getattr(mod, func_name)
            res = func(* (args or []), **(kwargs or {}))
            _metrics["total_local_time"] += time.perf_counter() - start
            return res
        except Exception:
            # fallback to worker
            pass

    payload = {"module": module_name, "func": func_name, "args": args or [], "kwargs": kwargs or {}}
    cmd = [sys.executable, "-m", "codemap_dna_tesseract.runtime.sandbox_worker"]

    start = time.perf_counter()
    proc = subprocess.run(cmd, input=json.dumps(payload).encode(), stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout)
    elapsed = time.perf_counter() - start
    _metrics["total_worker_time"] += elapsed

    if proc.returncode != 0 and not proc.stdout:
        raise RuntimeError(f"worker failed: {proc.stderr.decode()}")

    try:
        out = json.loads(proc.stdout.decode())
    except Exception as e:
        raise RuntimeError(f"invalid worker output: {e}\n{proc.stdout.decode()}\n{proc.stderr.decode()}")

    if "error" in out:
        raise RuntimeError(out)
    return out.get("result")


def stats():
    reg = _load_registry()
    return {
        "registry_size": len(reg),
        **_metrics,
    }


def main_cli():
    # Usage: host.py <address|stats> [args json] [kwargs json]
    if len(sys.argv) < 2:
        print("Usage: host.py <address|stats> [args as json list] [kwargs as json dict]")
        sys.exit(1)
    if sys.argv[1] == "stats":
        print(json.dumps(stats(), indent=2))
        sys.exit(0)

    addr = sys.argv[1]
    args = json.loads(sys.argv[2]) if len(sys.argv) > 2 else []
    kwargs = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
    try:
        res = call_address(addr, args=args, kwargs=kwargs)
        print(json.dumps({"result": res}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))


if __name__ == "__main__":
    main_cli()
