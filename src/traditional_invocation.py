# traditional_invocation.py

import os
import importlib.util

def traditional_invocation():
    """
    This function simulates the traditional method of discovering and running scripts.
    It reads the 'traditional_scripts' directory, dynamically imports each script,
    and then executes the 'run()' function within each one.
    """
    script_dir = "traditional_scripts"
    for filename in os.listdir(script_dir):
        if filename.endswith(".py"):
            module_name = filename[:-3]
            spec = importlib.util.spec_from_file_location(module_name, os.path.join(script_dir, filename))
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            module.run()

if __name__ == "__main__":
    traditional_invocation()