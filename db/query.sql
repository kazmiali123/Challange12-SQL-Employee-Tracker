USE company_db;

SELECT * FROM departments;

SELECT * FROM roles;

SELECT * FROM employees;


-- shows the roles table with id, title, department, and salary
SELECT id_role, role_title, department_name, role_salary
FROM roles INNER JOIN departments
ON roles.department_id = departments.id_department
ORDER BY id_role;


-- shows the employee table with id, first name, last name, role, department, salary, and manager
SELECT subordinate.id_employee, subordinate.first_name, subordinate.last_name, roles.role_title, departments.department_name, roles.role_salary, CONCAT(supervisor.first_name, ' ' , supervisor.last_name) AS manager
FROM employees subordinate
JOIN roles
ON subordinate.role_id = roles.id_role
JOIN departments
ON roles.department_id = departments.id_department
LEFT JOIN employees supervisor
ON subordinate.manager_id = supervisor.id_employee
ORDER BY id_employee;


-- insert a new department
INSERT INTO departments (department_name)
VALUES ("Services");
SELECT * FROM departments;


-- insert a new role
INSERT INTO roles (role_title, role_salary, department_id)
VALUES ("Customer Service", 80000, 5);
SELECT * FROM roles;

-- insert a new employee
Insert INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Sam", "Cash", 9, NULL);
SELECT * FROM employees;

-- update an employees role using role id and employee id
UPDATE employees
SET role_id = 6
WHERE id_employee = 2;