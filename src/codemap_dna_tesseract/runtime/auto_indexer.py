"""Auto-indexer: discovers functions from source files and generates device-specific collision-free addresses.

Address format: {program_prefix}:{purpose_prefix}:{line_number}:{function_index}
Example: GI:C:42:3 means github (GI), config (C), line 42, function 3 in that file.
"""
import ast
import os
from pathlib import Path
from typing import Dict, List, Tuple


def infer_purpose(func_name: str) -> str:
    """Infer function purpose from name. Examples: configure -> C, handle_click -> H."""
    return func_name[0].upper() if func_name else "X"


def expand_prefix(base: str, taken: set) -> str:
    """Expand prefix until unique. E.g. G -> Gi -> Gic if G and Gi are taken."""
    candidate = base
    for i in range(1, len(base) + 1):
        candidate = base[:i]
        if candidate not in taken:
            return candidate
    return base


def get_program_prefix(file_path: str) -> str:
    """Extract program name from file path. E.g. src/github/api.py -> G (from github)."""
    parts = Path(file_path).parts
    for part in parts:
        if part.lower() not in ("src", "codemap_dna_tesseract", "runtime", "modules"):
            name = part.replace(".py", "").replace("_", "").lower()
            if name and name != "main":
                return name[0].upper()
    return "X"


def discover_python_functions(file_path: str) -> List[Tuple[str, int, str]]:
    """Parse Python file and return list of (func_name, line_number, module_path)."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            tree = ast.parse(f.read(), filename=file_path)
    except Exception:
        return []

    funcs = []
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            funcs.append((node.name, node.lineno, file_path))
    return funcs


def index_repository(root_path: str = "src") -> Dict[str, Tuple[str, str]]:
    """Scan repo and return mapping address -> (module_name, func_name).

    Addresses are auto-generated with collision avoidance.
    """
    all_funcs = []
    program_used = {}  # program_name -> set of used prefixes

    # Walk directory and discover functions
    for root, dirs, files in os.walk(root_path):
        dirs[:] = [d for d in dirs if d not in ("__pycache__", ".git", "node_modules", ".venv")]
        for file in files:
            if file.endswith(".py"):
                file_path = os.path.join(root, file)
                funcs = discover_python_functions(file_path)
                for func_name, line_no, fpath in funcs:
                    if not func_name.startswith("_"):  # skip private
                        all_funcs.append((func_name, line_no, fpath))

    # Assign addresses with collision avoidance
    addresses = {}
    for idx, (func_name, line_no, fpath) in enumerate(all_funcs):
        prog = get_program_prefix(fpath)
        purpose = infer_purpose(func_name)

        if prog not in program_used:
            program_used[prog] = set()

        prog_prefix = expand_prefix(prog, program_used[prog])
        purpose_prefix = expand_prefix(purpose, program_used[prog])
        program_used[prog].add(prog_prefix)
        program_used[prog].add(purpose_prefix)

        # Convert file path to module name
        module_path = fpath.replace("\\", "/").replace("src/", "").replace(".py", "").replace("/", ".")
        if not module_path.startswith("codemap_dna_tesseract"):
            module_path = f"codemap_dna_tesseract.{module_path}"

        address = f"{prog_prefix}:{purpose_prefix}:{line_no}:{idx}"
        addresses[address] = (module_path, func_name)

    return addresses


if __name__ == "__main__":
    import json
    idx = index_repository()
    print(json.dumps(idx, indent=2))
