import importlib
import pkgutil
from types import ModuleType
from typing import Dict, Tuple
from .auto_indexer import index_repository


def discover_modules(package_name: str) -> Dict[str, ModuleType]:
    pkg = importlib.import_module(package_name)
    found = {}
    if hasattr(pkg, "__path__"):
        for finder, name, ispkg in pkgutil.iter_modules(pkg.__path__, pkg.__name__ + "."):
            try:
                m = importlib.import_module(name)
                found[name] = m
            except Exception:
                continue
    return found


def build_registry(modules_package: str = "codemap_dna_tesseract.runtime.modules", use_auto_index: bool = True) -> Dict[str, Tuple[str, str]]:
    """Return mapping address -> (module_name, function_name).

    Modules can provide EXPORTS dict (manual) or be auto-indexed (device-specific auto-generated addresses).
    """
    registry = {}

    # Auto-index from repository (primary source)
    if use_auto_index:
        try:
            auto = index_repository()
            registry.update(auto)
        except Exception:
            pass  # fallback to manual if auto-index fails

    # Fallback: manual EXPORTS from modules
    modules = discover_modules(modules_package)
    for mod_name, mod in modules.items():
        exports = getattr(mod, "EXPORTS", None)
        if isinstance(exports, dict):
            for addr, func_name in exports.items():
                registry[addr] = (mod_name, func_name)

    return registry


if __name__ == "__main__":
    # quick CLI for debugging
    import json
    reg = build_registry()
    print(json.dumps(reg, indent=2))
