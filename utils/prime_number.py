
def is_prime(n):
    if n <= 1:
        return False

    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False

    i = 2
    while i * i <= n:
        if is_prime[i]:
            for j in range(i * i, n + 1, i):
                is_prime[j] = False
        i += 1

    return is_prime[n]

def excute():
    count = 0
    for i in range(1, 4194304):
        if is_prime(i):
            count += 1
    print(count)

excute()