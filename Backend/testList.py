# Node class for the doubly linked list (representing each student)
class StudentNode:
    def __init__(self, student_id, courses):
        self.student_id = student_id  # Student ID
        self.courses = courses  # Courses for the student
        self.next = None  # Pointer to the next student node
        self.prev = None  # Pointer to the previous student node

# Doubly Linked List class to manage student nodes
class StudentDoublyLinkedList:
    def __init__(self):
        self.head = None  # Head of the student list

    # Method to insert a student at the end of the list
    def insert_student(self, student_id, courses):
        new_student = StudentNode(student_id, courses)
        if self.head is None:
            self.head = new_student
            return
        temp = self.head
        while temp.next:
            temp = temp.next
        temp.next = new_student
        new_student.prev = temp

    # Method to find and display the courses of a student by ID
    def show_courses(self, student_id):
        temp = self.head
        while temp:
            if temp.student_id == student_id:
                print(f"Student ID: {temp.student_id} Courses: {temp.courses}")
                return temp.courses
            temp = temp.next
        print("Student not found.")
        return None

    # Display all students and their courses
    def display_students(self):
        temp = self.head
        if temp is None:
            print("No students in the list.")
            return
        while temp:
            print(f"Student ID: {temp.student_id}, Courses: {temp.courses}")
            temp = temp.next

# Test the doubly linked list
if __name__ == "__main__":
    # Create the doubly linked list instance
    student_list = StudentDoublyLinkedList()
    
    # Add students to the list
    student_list.insert_student(1, ["Math", "Physics", "Chemistry"])
    student_list.insert_student(2, ["Biology", "English"])
    student_list.insert_student(3, ["History", "Geography"])
    
    # Display all students
    student_list.display_students()
    
    # Test the show_courses method with a valid student ID
    print("\nTesting with Student ID 2:")
    student_list.show_courses(2)
    
    # Test the show_courses method with an invalid student ID
    print("\nTesting with an invalid Student ID 4:")
    student_list.show_courses(4)
# Node class for the doubly linked list (representing each student)
class StudentNode:
    def __init__(self, student_id, courses):
        self.student_id = student_id  # Student ID
        self.courses = courses  # Courses for the student
        self.next = None  # Pointer to the next student node
        self.prev = None  # Pointer to the previous student node

# Doubly Linked List class to manage student nodes
class StudentDoublyLinkedList:
    def __init__(self):
        self.head = None  # Head of the student list

    # Method to insert a student at the end of the list
    def insert_student(self, student_id, courses):
        new_student = StudentNode(student_id, courses)
        if self.head is None:
            self.head = new_student
            return
        temp = self.head
        while temp.next:
            temp = temp.next
        temp.next = new_student
        new_student.prev = temp

    # Method to find and display the courses of a student by ID
    def show_courses(self, student_id):
        temp = self.head
        while temp:
            if temp.student_id == student_id:
                print(f"Student ID: {temp.student_id} Courses: {temp.courses}")
                return temp.courses
            temp = temp.next
        print("Student not found.")
        return None

    # Display all students and their courses
    def display_students(self):
        temp = self.head
        if temp is None:
            print("No students in the list.")
            return
        while temp:
            print(f"Student ID: {temp.student_id}, Courses: {temp.courses}")
            temp = temp.next

# Test the doubly linked list
if __name__ == "__main__":
    # Create the doubly linked list instance
    student_list = StudentDoublyLinkedList()
    
    # Add students to the list
    student_list.insert_student(1, ["Math", "Physics", "Chemistry"])
    student_list.insert_student(2, ["Biology", "English"])
    student_list.insert_student(3, ["History", "Geography"])
    
    # Display all students
    student_list.display_students()
    
    # Test the show_courses method with a valid student ID
    print("\nTesting with Student ID 2:")
    student_list.show_courses(2)
    
    # Test the show_courses method with an invalid student ID
    print("\nTesting with an invalid Student ID 4:")
    student_list.show_courses(4)
# Node class for the doubly linked list (representing each student)
class StudentNode:
    def __init__(self, student_id, courses):
        self.student_id = student_id  # Student ID
        self.courses = courses  # Courses for the student
        self.next = None  # Pointer to the next student node
        self.prev = None  # Pointer to the previous student node

# Doubly Linked List class to manage student nodes
class StudentDoublyLinkedList:
    def __init__(self):
        self.head = None  # Head of the student list

    # Method to insert a student at the end of the list
    def insert_student(self, student_id, courses):
        new_student = StudentNode(student_id, courses)
        if self.head is None:
            self.head = new_student
            return
        temp = self.head
        while temp.next:
            temp = temp.next
        temp.next = new_student
        new_student.prev = temp

    # Method to find and display the courses of a student by ID
    def show_courses(self, student_id):
        temp = self.head
        while temp:
            if temp.student_id == student_id:
                print(f"Student ID: {temp.student_id} Courses: {temp.courses}")
                return temp.courses
            temp = temp.next
        print("Student not found.")
        return None

    # Display all students and their courses
    def display_students(self):
        temp = self.head
        if temp is None:
            print("No students in the list.")
            return
        while temp:
            print(f"Student ID: {temp.student_id}, Courses: {temp.courses}")
            temp = temp.next

    def find_student(self, student_id):
        temp = self.head
        while temp:
            if temp.student_id == student_id:
                return temp
            temp = temp.next
        return None

# Instantiate the student list and add some data
student_list = StudentDoublyLinkedList()
student_list.insert_student(1, ["Math", "Physics", "Chemistry"])
student_list.insert_student(2, ["Biology", "English"])
student_list.insert_student(3, ["History", "Geography"])