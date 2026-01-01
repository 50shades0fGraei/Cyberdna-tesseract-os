"""Entrypoint with system library initialization on first run."""
from codemap_dna_tesseract.system_indexer import load_library, get_library_path
from codemap_dna_tesseract.main import main as run_main
from codemap_dna_tesseract.installer import run_installer
import sys


def init_library():
    """Check if system library exists; if not, run installer."""
    lib_path = get_library_path() / "system_library.json"
    if not lib_path.exists():
        print("📦 System library not found. Running installer...\n")
        run_installer()
    else:
        lib = load_library()
        print(f"📦 Loaded system library: {len(lib)} functions")


if __name__ == "__main__":
    # Check for installer flag
    if "--install" in sys.argv:
        run_installer()
        sys.exit(0)

    if "--rebuild" in sys.argv:
        from codemap_dna_tesseract.system_indexer import build_system_library, save_library, get_common_program_paths
        print("🔄 Rebuilding system library...")
        lib = build_system_library(scan_paths=get_common_program_paths())
        save_library(lib)
        print("✅ Rebuilt")
        sys.exit(0)

    # Initialize on first run
    init_library()

    # Run main
    run_main()
