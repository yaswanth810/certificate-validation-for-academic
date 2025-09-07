// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title VignanRegistry
 * @dev Central registry for managing students, courses, and institutional data
 * @author Vignan Institute
 */
contract VignanRegistry is AccessControl, Pausable {
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // State variables
    uint256 private _studentIdCounter;
    uint256 private _courseIdCounter;
    
    mapping(uint256 => Student) public students;
    mapping(address => uint256) public addressToStudentId;
    mapping(uint256 => Course) public courses;
    mapping(string => bool) public usedStudentNumbers;
    mapping(address => bool) public registeredStudents;
    
    // Events
    event StudentRegistered(
        uint256 indexed studentId,
        address indexed studentAddress,
        string studentNumber,
        string name,
        uint256 timestamp
    );
    
    event StudentUpdated(
        uint256 indexed studentId,
        address indexed studentAddress,
        string name,
        uint256 timestamp
    );
    
    event CourseCreated(
        uint256 indexed courseId,
        string courseCode,
        string courseName,
        uint256 credits,
        uint256 timestamp
    );
    
    event CourseUpdated(
        uint256 indexed courseId,
        string courseName,
        uint256 credits,
        uint256 timestamp
    );
    
    event StudentEnrolled(
        uint256 indexed studentId,
        uint256 indexed courseId,
        uint256 timestamp
    );
    
    event StudentGraduated(
        uint256 indexed studentId,
        string degree,
        uint256 timestamp
    );
    
    // Structs
    struct Student {
        uint256 studentId;
        address studentAddress;
        string studentNumber;
        string name;
        string email;
        string department;
        string program;
        uint256 enrollmentDate;
        uint256 graduationDate;
        bool isActive;
        bool isGraduated;
        string degree;
        uint256[] enrolledCourses;
    }
    
    struct Course {
        uint256 courseId;
        string courseCode;
        string courseName;
        string description;
        uint256 credits;
        string department;
        bool isActive;
        uint256 createdAt;
        address createdBy;
    }
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }
    
    /**
     * @dev Register a new student
     * @param studentAddress Address of the student
     * @param studentNumber Unique student number
     * @param name Name of the student
     * @param email Email of the student
     * @param department Department of the student
     * @param program Program of the student
     */
    function registerStudent(
        address studentAddress,
        string memory studentNumber,
        string memory name,
        string memory email,
        string memory department,
        string memory program
    ) external onlyRole(REGISTRAR_ROLE) whenNotPaused returns (uint256) {
        require(studentAddress != address(0), "Invalid student address");
        require(bytes(studentNumber).length > 0, "Student number cannot be empty");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(!usedStudentNumbers[studentNumber], "Student number already exists");
        require(!registeredStudents[studentAddress], "Address already registered");
        
        _studentIdCounter++;
        uint256 studentId = _studentIdCounter;
        
        students[studentId] = Student({
            studentId: studentId,
            studentAddress: studentAddress,
            studentNumber: studentNumber,
            name: name,
            email: email,
            department: department,
            program: program,
            enrollmentDate: block.timestamp,
            graduationDate: 0,
            isActive: true,
            isGraduated: false,
            degree: "",
            enrolledCourses: new uint256[](0)
        });
        
        addressToStudentId[studentAddress] = studentId;
        usedStudentNumbers[studentNumber] = true;
        registeredStudents[studentAddress] = true;
        
        emit StudentRegistered(studentId, studentAddress, studentNumber, name, block.timestamp);
        
        return studentId;
    }
    
    /**
     * @dev Update student information
     * @param studentId ID of the student
     * @param name New name
     * @param email New email
     * @param department New department
     * @param program New program
     */
    function updateStudent(
        uint256 studentId,
        string memory name,
        string memory email,
        string memory department,
        string memory program
    ) external onlyRole(REGISTRAR_ROLE) {
        require(students[studentId].studentId != 0, "Student does not exist");
        require(students[studentId].isActive, "Student is not active");
        
        students[studentId].name = name;
        students[studentId].email = email;
        students[studentId].department = department;
        students[studentId].program = program;
        
        emit StudentUpdated(studentId, students[studentId].studentAddress, name, block.timestamp);
    }
    
    /**
     * @dev Create a new course
     * @param courseCode Unique course code
     * @param courseName Name of the course
     * @param description Description of the course
     * @param credits Number of credits
     * @param department Department offering the course
     */
    function createCourse(
        string memory courseCode,
        string memory courseName,
        string memory description,
        uint256 credits,
        string memory department
    ) external onlyRole(REGISTRAR_ROLE) whenNotPaused returns (uint256) {
        require(bytes(courseCode).length > 0, "Course code cannot be empty");
        require(bytes(courseName).length > 0, "Course name cannot be empty");
        require(credits > 0, "Credits must be greater than 0");
        
        _courseIdCounter++;
        uint256 courseId = _courseIdCounter;
        
        courses[courseId] = Course({
            courseId: courseId,
            courseCode: courseCode,
            courseName: courseName,
            description: description,
            credits: credits,
            department: department,
            isActive: true,
            createdAt: block.timestamp,
            createdBy: msg.sender
        });
        
        emit CourseCreated(courseId, courseCode, courseName, credits, block.timestamp);
        
        return courseId;
    }
    
    /**
     * @dev Update course information
     * @param courseId ID of the course
     * @param courseName New course name
     * @param description New description
     * @param credits New credits
     */
    function updateCourse(
        uint256 courseId,
        string memory courseName,
        string memory description,
        uint256 credits
    ) external onlyRole(REGISTRAR_ROLE) {
        require(courses[courseId].courseId != 0, "Course does not exist");
        require(courses[courseId].isActive, "Course is not active");
        
        courses[courseId].courseName = courseName;
        courses[courseId].description = description;
        courses[courseId].credits = credits;
        
        emit CourseUpdated(courseId, courseName, credits, block.timestamp);
    }
    
    /**
     * @dev Enroll a student in a course
     * @param studentId ID of the student
     * @param courseId ID of the course
     */
    function enrollStudent(uint256 studentId, uint256 courseId) external onlyRole(REGISTRAR_ROLE) {
        require(students[studentId].studentId != 0, "Student does not exist");
        require(students[studentId].isActive, "Student is not active");
        require(courses[courseId].courseId != 0, "Course does not exist");
        require(courses[courseId].isActive, "Course is not active");
        
        students[studentId].enrolledCourses.push(courseId);
        
        emit StudentEnrolled(studentId, courseId, block.timestamp);
    }
    
    /**
     * @dev Mark a student as graduated
     * @param studentId ID of the student
     * @param degree Degree awarded
     */
    function graduateStudent(uint256 studentId, string memory degree) external onlyRole(REGISTRAR_ROLE) {
        require(students[studentId].studentId != 0, "Student does not exist");
        require(students[studentId].isActive, "Student is not active");
        require(!students[studentId].isGraduated, "Student already graduated");
        
        students[studentId].isGraduated = true;
        students[studentId].graduationDate = block.timestamp;
        students[studentId].degree = degree;
        
        emit StudentGraduated(studentId, degree, block.timestamp);
    }
    
    /**
     * @dev Deactivate a student
     * @param studentId ID of the student
     */
    function deactivateStudent(uint256 studentId) external onlyRole(ADMIN_ROLE) {
        require(students[studentId].studentId != 0, "Student does not exist");
        students[studentId].isActive = false;
    }
    
    /**
     * @dev Deactivate a course
     * @param courseId ID of the course
     */
    function deactivateCourse(uint256 courseId) external onlyRole(ADMIN_ROLE) {
        require(courses[courseId].courseId != 0, "Course does not exist");
        courses[courseId].isActive = false;
    }
    
    /**
     * @dev Get student information
     * @param studentId ID of the student
     * @return Student struct
     */
    function getStudent(uint256 studentId) external view returns (Student memory) {
        return students[studentId];
    }
    
    /**
     * @dev Get student by address
     * @param studentAddress Address of the student
     * @return Student struct
     */
    function getStudentByAddress(address studentAddress) external view returns (Student memory) {
        uint256 studentId = addressToStudentId[studentAddress];
        require(studentId != 0, "Student not found");
        return students[studentId];
    }
    
    /**
     * @dev Get course information
     * @param courseId ID of the course
     * @return Course struct
     */
    function getCourse(uint256 courseId) external view returns (Course memory) {
        return courses[courseId];
    }
    
    /**
     * @dev Check if address is registered
     * @param studentAddress Address to check
     * @return True if registered
     */
    function isStudentRegistered(address studentAddress) external view returns (bool) {
        return registeredStudents[studentAddress];
    }
    
    /**
     * @dev Get total number of students
     * @return Total student count
     */
    function getTotalStudents() external view returns (uint256) {
        return _studentIdCounter;
    }
    
    /**
     * @dev Get total number of courses
     * @return Total course count
     */
    function getTotalCourses() external view returns (uint256) {
        return _courseIdCounter;
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
