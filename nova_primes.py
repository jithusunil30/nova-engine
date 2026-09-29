import sys
if hasattr(sys.stdout, 'reconfigure'): sys.stdout.reconfigure(encoding='utf-8')

def sieve_primes(limit: int) -> list[int]:
    """Sieve of Eratosthenes prime generation."""
    if limit < 2: return []
    sieve = [True] * (limit + 1)
    sieve[0] = sieve[1] = False
    for i in range(2, int(limit**0.5) + 1):
        if sieve[i]:
            for j in range(i*i, limit + 1, i):
                sieve[j] = False
    return [i for i, prime in enumerate(sieve) if prime]

if __name__ == '__main__':
    limit = 30
    print(f"=== N.O.V.A. Universal Intelligence: Prime Number Sieve ===")
    primes = sieve_primes(limit)
    print(f"Found {len(primes)} prime numbers up to {limit}:")
    print(primes)
    print("Execution complete. Status: 0 (OK)")
