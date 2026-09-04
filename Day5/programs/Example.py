def greet():
    print("Hello")

greet()
greet()
greet()
greet()
greet()
greet()

def hello():
    print("Hello, welcome to python!")

hello()
hello()
hello()

def add (a, b):
    return a + b
result = add(15, 25)
print(result)   

#def greet(name="Guest"):
   # print("Hello", name)

name = "Global name"

def show_name():
    name="Local name"
    print("Inside:", name)

show_name()
print("Outside:", name) 

def total(*numbers):
    return sum(numbers)

result1 = total(5, 10)
result2 = total(5, 10, 15, 20)
result3 = total(1, 2, 3, 4, 5, 6)

print(result1)
print(result2)
print(result3)


with open("notes.txt", "w") as f:
    f.write("Hello Python\n")
    f.write("I am learning files\n")
    f.write("Day 5 is interesting\n")
