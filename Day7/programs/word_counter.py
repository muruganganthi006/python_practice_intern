with open("sample.txt", "r") as f:
    content = f.read()

words = content.split()
lines = content.splitlines()

print("Number of words:", len(words))
print("Number of lines:", len(lines))