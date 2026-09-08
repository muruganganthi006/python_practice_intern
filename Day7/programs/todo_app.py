import json

tasks = []


def add_task():
    task = input("Enter task: ").strip()

    if task == "":
        print("Task cannot be empty.")
        return

    new_task = {
        "task": task,
        "completed": False
    }

    tasks.append(new_task)

    print("Task added successfully!")


add_task()
print(tasks)

def list_tasks():
    if len(tasks) == 0:
        print("No tasks found.")
        return

    print("\n--- TO-DO LIST ---")

    for index, task in enumerate(tasks, start=1):
        if task["completed"]:
            status = "Completed"
        else:
            status = "Pending"

        print(index, ".", task["task"], "-", status)
    enumerate(tasks, start=1)

add_task()
list_tasks()

def mark_complete():
    if len(tasks) == 0:
        print("No tasks found.")
        return

    list_tasks()

    try:
        task_number = int(input("Enter task number to mark complete: "))

        if task_number < 1 or task_number > len(tasks):
            print("Invalid task number.")
            return

        tasks[task_number - 1]["completed"] = True

        print("Task marked as completed!")

    except ValueError:
        print("Please enter a valid number.")
add_task()
add_task()
list_tasks()
mark_complete()
list_tasks()

def delete_task():
    if len(tasks) == 0:
        print("No tasks found.")
        return

    list_tasks()

    try:
        task_number = int(input("Enter task number to delete: "))

        if task_number < 1 or task_number > len(tasks):
            print("Invalid task number.")
            return

        deleted_task = tasks.pop(task_number - 1)

        print("Task deleted:", deleted_task["task"])

    except ValueError:
        print("Please enter a valid number.")
add_task()
add_task()
list_tasks()
delete_task()
list_tasks()

def save_tasks():
    with open("tasks.json", "w") as file:
        json.dump(tasks, file, indent=4)

    print("Tasks saved successfully!")

def load_tasks():
    global tasks

    try:
        with open("tasks.json", "r") as file:
            tasks = json.load(file)

    except FileNotFoundError:
        tasks = []

    except json.JSONDecodeError:
        tasks = []

add_task()
add_task()
save_tasks()