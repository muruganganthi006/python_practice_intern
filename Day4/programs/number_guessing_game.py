import random

while True:
    secret_number = random.randint(1, 100)
    attempts = 0

    print("\nNumber Guessing Game")
    print("I have chosen a number between 1 and 100.")

    for i in range(10):
        guess = int(input("Enter your guess: "))
        attempts += 1

        if guess > secret_number:
            print("Too high!")
        elif guess < secret_number:
            print("Too low!")
        elif guess == secret_number:
            print(f"Congratulations! You guessed the number {secret_number} in {attempts} attempts.")
            break
        if attempts == 10:
            print(f"Sorry, you've used all your attempts.")
    

    play_again = input("Play again? (y/n): ").lower()

    if play_again != "y":
        print("Thanks for playing!")
        break