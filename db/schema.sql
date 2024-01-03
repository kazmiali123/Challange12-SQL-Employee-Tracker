drop DATABASE IF EXISTS company_db;
CREATE DATABASE company_db;

USE company_db;

-- create departments table with id_department as primary key
CREATE TABLE departments (
    id_department INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(30) NOT NULL
);

-- create roles table with id_role as primary key and department_id as foriegn key
CREATE TABLE roles (
    id_role INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    role_title VARCHAR(30) NOT NULL,
    role_salary DECIMAL NOT NULL,
    department_id  INT,
    FOREIGN KEY (department_id)
    REFERENCES departments(id_department)
    ON DELETE SET NULL
);

-- create employees table with id_employee as primary key and role_id as foreign key, and manger_id as a foreign key that references the same table's id_employee
CREATE TABLE employees (
    id_employee INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT,
    manager_id INT,
    FOREIGN KEY (role_id) 
    REFERENCES roles(id_role)
    ON DELETE SET NULL,
    FOREIGN KEY (manager_id)
    REFERENCES employees(id_employee)
    ON DELETE SET NULL
);
