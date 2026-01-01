"""Worker process: receives JSON on stdin specifying module/function and executes it.

Designed to be launched as a separate process for basic sandboxing.
"""
import sys
import json
import importlib
import traceback


def run_worker():
    try:
        payload = json.load(sys.stdin)
    except Exception as e:
        print(json.dumps({"error": f"invalid input: {e}"}))
        return 1

    module_name = payload.get("module")
    func_name = payload.get("func")
    args = payload.get("args", [])
    kwargs = payload.get("kwargs", {})

    try:
        mod = importlib.import_module(module_name)
    except Exception as e:
        print(json.dumps({"error": f"import failed: {e}"}))
        return 2

    func = getattr(mod, func_name, None)
    if not callable(func):
        print(json.dumps({"error": f"function not found: {func_name}"}))
        return 3

    try:
        result = func(*args, **kwargs)
        print(json.dumps({"result": result}))
        return 0
    except Exception:
        tb = traceback.format_exc()
        print(json.dumps({"error": "exception during execution", "trace": tb}))
        return 4


if __name__ == "__main__":
    sys.exit(run_worker())
