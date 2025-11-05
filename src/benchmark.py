# benchmark.py

import cProfile
import pstats
import io
import time

from traditional_invocation import traditional_invocation
from codemap_dna_tesseract.codemap_tesseract import CodemapTesseract

def benchmark_traditional():
    """Runs the traditional invocation under the profiler."""
    profiler = cProfile.Profile()
    profiler.enable()
    traditional_invocation()
    profiler.disable()
    return pstats.Stats(profiler)

def benchmark_codemap(depth=5):
    """Runs the Codemap invocation under the profiler."""
    profiler = cProfile.Profile()
    profiler.enable()
    
    # --- Codemap Invocation Logic ---
    root = CodemapTesseract()
    root.invoke() 
    current = root
    for _ in range(depth - 1):
        current = current.build_next_tesseract()
        current.invoke()
    # --- End of Logic ---
    
    profiler.disable()
    return pstats.Stats(profiler)

def main():
    """Main function to run benchmarks multiple times and print a comparison."""
    print("--- Running Performance Benchmark (100 iterations) ---")
    
    num_iterations = 100
    
    total_traditional_calls = 0
    total_traditional_time = 0.0
    
    total_codemap_calls = 0
    total_codemap_time = 0.0

    for i in range(num_iterations):
        print(f"\n--- Running Iteration {i+1}/{num_iterations} ---")
        
        # Run and gather stats for traditional method
        traditional_stats = benchmark_traditional()
        total_traditional_calls += traditional_stats.total_calls
        total_traditional_time += traditional_stats.total_tt
        
        # Run and gather stats for codemap method
        codemap_stats = benchmark_codemap()
        total_codemap_calls += codemap_stats.total_calls
        total_codemap_time += codemap_stats.total_tt
        
        # Small delay to ensure clean separation between runs if needed
        time.sleep(0.1)

    # Calculate averages
    avg_traditional_calls = total_traditional_calls / num_iterations
    avg_traditional_time = total_traditional_time / num_iterations
    
    avg_codemap_calls = total_codemap_calls / num_iterations
    avg_codemap_time = total_codemap_time / num_iterations

    print("\n" + "="*50)
    print("--- Averaged Benchmark Results (100 iterations) ---")
    print("="*50)

    print("\n" + "-"*40)
    print("Traditional Invocation (The Old Way):")
    print(f"  - Average Function Calls: {avg_traditional_calls:.0f}")
    print(f"  - Average CPU Time: {avg_traditional_time:.6f} seconds")
    print("-"*40)
    
    print("\n" + "-"*40)
    print("Codemap Invocation (Your New Way):")
    print(f"  - Average Function Calls: {avg_codemap_calls:.0f}")
    print(f"  - Average CPU Time: {avg_codemap_time:.6f} seconds")
    print("-"*40)
    
    # Calculate and display the performance improvement
    calls_improvement = (1 - (avg_codemap_calls / avg_traditional_calls)) * 100
    time_improvement = (1 - (avg_codemap_time / avg_traditional_time)) * 100
    
    print("\n--- Conclusion (Averaged) ---")
    print(f"On average, Codemap Invocation resulted in:")
    print(f"  - {calls_improvement:.2f}% fewer function calls")
    print(f"  - {time_improvement:.2f}% less CPU time")
    print("\nThis provides a more reliable measure of the efficiency gains.")

if __name__ == "__main__":
    main()
