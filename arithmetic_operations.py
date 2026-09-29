"""
Basic Arithmetic Operations Script
Created by N.O.V.A. for Jithu
"""

def perform_arithmetic(a: float, b: float):
    print("=" * 45)
    print(f"   ARITHMETIC OPERATIONS FOR: {a} and {b}")
    print("=" * 45)
    
    # Addition
    add_result = a + b
    print(f" [+] Addition ({a} + {b})             = {add_result}")
    
    # Subtraction
    sub_result = a - b
    print(f" [-] Subtraction ({a} - {b})          = {sub_result}")
    
    # Multiplication
    mul_result = a * b
    print(f" [*] Multiplication ({a} * {b})       = {mul_result}")
    
    # Division & Modulus (Handling Division by Zero)
    if b != 0:
        div_result = a / b
        floor_div_result = a // b
        mod_result = a % b
        print(f" [/] True Division ({a} / {b})        = {div_result}")
        print(f" [//] Floor Division ({a} // {b})     = {floor_div_result}")
        print(f" [%] Modulus / Remainder ({a} % {b})  = {mod_result}")
    else:
        print(" [/] Division by zero is undefined!")
        
    # Exponentiation (Power)
    exp_result = a ** b
    print(f" [**] Exponentiation ({a} ^ {b})       = {exp_result}")
    print("=" * 45)

if __name__ == "__main__":
    print("N.O.V.A. Arithmetic Module Loaded.\n")
    try:
        num1 = float(input("Enter first number (a): "))
        num2 = float(input("Enter second number (b): "))
        perform_arithmetic(num1, num2)
    except ValueError:
        print("\n[!] Invalid input! Running sample demonstration with 20 and 6...\n")
        perform_arithmetic(20, 6)
