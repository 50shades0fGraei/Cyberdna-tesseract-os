#!/usr/bin/env python3
"""
Python host process for Electron bridge.
Receives JSON requests over stdin and responds with JSON over stdout.
"""

import json
import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../src'))

from codemap_dna_tesseract.runtime.host import Host
from codemap_dna_tesseract.data_binding import get_binding, bind_data
from codemap_dna_tesseract.file_acl import get_all_acls, set_file_acl_rule
from codemap_dna_tesseract.process_mapper import get_all_process_mappings, register_process


class ElectronHost:
    def __init__(self):
        self.host = Host()
        self.stats = {
            'total_functions': 0,
            'function_calls': 0,
            'data_bindings': 0,
            'acl_rules': 0,
            'subprocess_calls': 0,
            'local_calls': 0,
            'avg_exec_time': 0.0,
            'library_size': 0,
        }

    def get_functions(self):
        """Get all available functions from registry."""
        try:
            registry = self.host.registry
            functions = []
            for address, (module_name, func_name) in registry.items():
                functions.append({
                    'address': address,
                    'name': func_name,
                    'module': module_name,
                    'purpose': address.split(':')[1] if ':' in address else 'unknown',
                })
            self.stats['total_functions'] = len(functions)
            self.stats['library_size'] = len(functions)
            return functions
        except Exception as e:
            return {'error': str(e)}

    def call_function(self, address, args):
        """Call a function by address."""
        try:
            result = self.host.call_address(address, args)
            self.stats['function_calls'] += 1
            return result
        except Exception as e:
            return {'error': str(e)}

    def get_bindings(self):
        """Get all data bindings."""
        try:
            bindings = []
            # Load from file
            bindings_file = os.path.expandvars('%APPDATA%/CodemapOS/data_bindings.json')
            if os.path.exists(bindings_file):
                with open(bindings_file, 'r') as f:
                    data = json.load(f)
                    bindings = [{'data_id': k, 'function_address': v} for k, v in data.items()]
            self.stats['data_bindings'] = len(bindings)
            return bindings
        except Exception as e:
            return {'error': str(e)}

    def set_binding(self, data_id, function_address):
        """Set a data binding."""
        try:
            bind_data(data_id, function_address)
            return {'success': True}
        except Exception as e:
            return {'error': str(e)}

    def get_data(self, data_id):
        """Get data by ID."""
        try:
            from codemap_dna_tesseract.virtual_data_store import get_data
            data = get_data(data_id)
            return {'data_id': data_id, 'value': data}
        except Exception as e:
            return {'error': str(e)}

    def get_file_acl(self):
        """Get all file ACL rules."""
        try:
            acls = get_all_acls()
            self.stats['acl_rules'] = len(acls)
            return acls
        except Exception as e:
            return {'error': str(e)}

    def set_file_acl(self, file_path, operation, function_address):
        """Set a file ACL rule."""
        try:
            set_file_acl_rule(file_path, operation, function_address)
            return {'success': True}
        except Exception as e:
            return {'error': str(e)}

    def get_process_mappings(self):
        """Get all process mappings."""
        try:
            mappings = get_all_process_mappings()
            return mappings
        except Exception as e:
            return {'error': str(e)}

    def set_process_mapping(self, process_name, function_address):
        """Set a process mapping."""
        try:
            register_process(process_name, function_address)
            return {'success': True}
        except Exception as e:
            return {'error': str(e)}

    def get_stats(self):
        """Get runtime statistics."""
        return self.stats

    def process_request(self, request):
        """Process a single JSON-RPC request."""
        method = request.get('method', '')
        args = request.get('args', {})

        handlers = {
            'get_functions': lambda: self.get_functions(),
            'call_function': lambda: self.call_function(args.get('address'), args.get('args')),
            'get_bindings': lambda: self.get_bindings(),
            'set_binding': lambda: self.set_binding(args.get('data_id'), args.get('function_address')),
            'get_data': lambda: self.get_data(args.get('data_id')),
            'get_file_acl': lambda: self.get_file_acl(),
            'set_file_acl': lambda: self.set_file_acl(args.get('file_path'), args.get('operation'), args.get('function_address')),
            'get_process_mappings': lambda: self.get_process_mappings(),
            'set_process_mapping': lambda: self.set_process_mapping(args.get('process_name'), args.get('function_address')),
            'get_stats': lambda: self.get_stats(),
        }

        handler = handlers.get(method)
        if handler:
            return handler()
        else:
            return {'error': f'Unknown method: {method}'}


def main():
    """Main entry point."""
    electron_host = ElectronHost()

    # Signal ready
    print(json.dumps({'type': 'ready'}), flush=True)

    # Read and process requests
    try:
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue

            try:
                request = json.loads(line)
                response = electron_host.process_request(request)
                print(json.dumps({'type': 'response', 'data': response}), flush=True)
            except json.JSONDecodeError as e:
                print(json.dumps({'type': 'response', 'data': {'error': f'Invalid JSON: {str(e)}'}}), flush=True)
            except Exception as e:
                print(json.dumps({'type': 'response', 'data': {'error': str(e)}}), flush=True)
    except KeyboardInterrupt:
        pass
    except Exception as e:
        print(json.dumps({'type': 'error', 'data': str(e)}), file=sys.stderr, flush=True)


if __name__ == '__main__':
    main()
