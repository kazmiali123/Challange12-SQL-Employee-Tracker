// import inquirer, mysql2
const inquirer = require('inquirer');
const mysql = require('mysql2');

// connect with mysql and use the company_db database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'company_db' 
});

// async function to get the departments table
async function getDepartmentsTable () {
    await new Promise(resolve => {
        // gets the departments table
        connection.query(
            'SELECT * FROM `departments`', 
            function(err, results, fields){
                console.table(results);   
                resolve();     
        });
    })
}

// async function to get the roles table
async function getRolesTable () {
    await new Promise(resolve => {
        // gets the roles table
        connection.query(
            'SELECT id_role, role_title, department_name, role_salary FROM roles INNER JOIN departments ON roles.department_id = departments.id_department ORDER BY id_role;', 
            function(err, results, fields){
                console.table(results); 
                resolve();      
        });
    })
}

// async function to get the employees table
async function getEmployeesTable () {
    await new Promise(resolve => {
        // gets the employees table, grouped with repective roles and department table, also references itself for the manager names
        connection.query(             
            'SELECT subordinate.id_employee, subordinate.first_name, subordinate.last_name, roles.role_title, departments.department_name, roles.role_salary, CONCAT(supervisor.first_name, \' \' , supervisor.last_name) AS manager FROM employees subordinate JOIN roles ON subordinate.role_id = roles.id_role JOIN departments ON roles.department_id = departments.id_department LEFT JOIN employees supervisor ON subordinate.manager_id = supervisor.id_employee ORDER BY id_employee;', 
            function(err, results, fields){    
            console.table(results);  
            resolve();      
        });
    })
}

// async function to add a new department, given the new department name
async function addNewDepartment () {
    await new Promise(resolve => {
        return inquirer
        .prompt ([
            {
                type: 'input',
                name: 'name',
                message: 'Please enter the name of the new department.',
                validate: (value) => {                            
                    if (value) {        
                        return true;                
                    }else{
                        return "Please enter a valid department name.";                
                    }
                }            
            }
        ])
        .then (({name})=>{
            // adds a new department into the departments table
            connection.query(
                'INSERT INTO departments SET department_name = ?', [name], 
                function(err, results, fields){
                    console.log(`added ${name} department to the company database`);                
            });
        })
        .then (()=> {
            getDepartmentsTable()
            resolve();
        });
    })
}

// async function to add new role, given the new role's  name, salary, and respective department
async function addNewRole () {
    // single await to handle the initial query, inquirer prompt question/answers, query to insert new role, and query to see the new roles table
    await new Promise(resolve => {
        let data;
        connection.promise().query('SELECT * FROM `departments`')
        .then (([rows, fields]) => {
            // from the departments table, builds an array using the department_name column values, to be used in prompt questions
            data = rows;       
            const choices = [];
            rows.forEach((row)=> choices.push(row.department_name));
            console.log(choices);
            
            const questions = [{
                type: 'input',
                message: 'What is the name of the role?',
                name: 'role_name',
            },
            {
                type: 'input',
                name: 'role_salary',
                message: 'How much is the salary for this role?',
                validate(value) {
                  const valid = !isNaN(parseFloat(value));
                  return valid || 'Please enter a number';
                },
                filter: Number,          
            },
            {
                type: 'list',
                name: 'department_name',
                message: 'Which department does this role belong to?',
                choices: choices
            }];
            return questions;
        }) 
        .then((questions)=> {
           return inquirer
            .prompt(questions)
            .then ((answers)=> {
                // compare the selected department name by the user and match it to the specific departments table row to get the respective department_id
                let departmentRow = data.filter((row)=> row.department_name === answers.department_name)
                let departmentID = departmentRow[0].id_department;
                let departmentName = departmentRow[0].department_name
                console.log(departmentID);
                
                // create an object from the inquirer prompts to be used for creating a new role in the roles table
                let addRoleParameters = {
                    role: answers.role_name,
                    salary: answers.role_salary,
                    department_ID: departmentID,
                    department_name: departmentName
                }
    
                console.log(addRoleParameters);
                return addRoleParameters;
            })
            .then (({role, salary, department_ID, department_name})=>{
                // adds a new role inside the roles table, using role title, role salary, and department id
                connection.query(
                    'INSERT INTO roles SET role_title = ?, role_salary = ?, department_id = ?', [role, salary, department_ID], 
                    function(err, results, fields){
                        console.log(`added ${role} role to the ${department_name} department, inside the company database`);                 
                });
            })
            .then (()=>{
                // gets the updated roles table to be displayed to the console
                connection.query(
                    'SELECT id_role, role_title, department_name, role_salary FROM roles INNER JOIN departments ON roles.department_id = departments.id_department ORDER BY id_role;', 
                    function(err, results, fields){
                        console.table(results);       
                });
            })
            .then (()=> resolve());
        })            
    })
}

// async function using multiple awaits; adds a new employee in the employees table, using first name, last name, role id, manager id
async function addNewEmployee () {
    // global variables will be populated using initial queries on roles and employees tables
    let rolesData;
    let roleChoices = [];
    let employeesData;
    let employeeChoices = ["None"];

    // gets the roles table and builds an array of role titles from it
    await new Promise(resolve => {
        connection.promise().query('SELECT * FROM `roles`')
        .then (([rows, fields]) => {
            // console.log(rows);
            rolesData = rows;   
            rows.forEach((row)=> roleChoices.push(row.role_title));
            resolve();            
        })
    })
    
    // gets the employees table and builds an array of employee names for manager selection
    await new Promise(resolve => {
        connection.promise().query('SELECT * FROM `employees`')
        .then (([rows, fields]) => {
            // console.log(rows);
            employeesData = rows;   
            rows.forEach((row)=> employeeChoices.push(row.last_name));  
            resolve();          
        })
    })
    
    // returns inquirer.prompt for user question/answers for inserting a new employee in the employees table
    await new Promise(resolve => {          
        return inquirer
        .prompt([{
            type: 'input',
            message: 'What is the first name of the employee?',
            name: 'first_name',
        },
        {
            type: 'input',
            message: 'What is the last name of the employee?',
            name: 'last_name',
        },
        {
            type: 'list',
            name: 'role_name',
            message: 'Which role will this employee perform?',
            choices: roleChoices
        },
        {
            type: 'list',
            name: 'manager_name',
            message: 'Who will be the manager of this employee?',
            choices: employeeChoices
        }])
        .then ((answers)=> {
            // matches the user selected role title with roles table to get the respective role id
            let roleRow = rolesData.filter((row)=> row.role_title === answers.role_name)
            let roleID = roleRow[0].id_role;

            let managerID;

            // if user selects no manager for the new employee set its manager value to null, otherwise get the managers respective employee id
            if (answers.manager_name === "None") {
                managerID = null;
            } else {
                let employeeRow = employeesData.filter((row)=> row.last_name === answers.manager_name)
                managerID = employeeRow[0].id_employee;
            }

            let roleTitle = roleRow[0].role_title;

            // object to create the new employee from the user selected prompt answers
            let addEmployeeParameters = {
                first_name: answers.first_name,
                last_name: answers.last_name,
                role_id: roleID,
                manager_id: managerID,
                role_title: roleTitle
            }

            console.log(addEmployeeParameters);
            return addEmployeeParameters;
        })
        .then (({first_name, last_name, role_id, manager_id, role_title})=>{
            // inserts the new employee into the employees table using the user's prompt answers for last name, first name, rold id, and manager id
            connection.query(
                'Insert INTO employees SET first_name = ?, last_name = ?, role_id = ?, manager_id = ?;', [first_name, last_name, role_id, manager_id],
                function(err, results, fields){
                    console.log(`added ${first_name} ${last_name} as a new ${role_title} to the company database`);                   
            });
        })
        .then (()=>{
            // gets the employees table as desired with grouping with roles and departments tables
            connection.query(
                'SELECT subordinate.id_employee, subordinate.first_name, subordinate.last_name, roles.role_title, departments.department_name, roles.role_salary, CONCAT(supervisor.first_name, \' \' , supervisor.last_name) AS manager FROM employees subordinate JOIN roles ON subordinate.role_id = roles.id_role JOIN departments ON roles.department_id = departments.id_department LEFT JOIN employees supervisor ON subordinate.manager_id = supervisor.id_employee ORDER BY id_employee;', 
                function(err, results, fields){    
                console.table(results);
            });
        })
        .then (()=> resolve());
    })   

}

// async function to update the employees role
async function updateEmployeeRole () {

    // global variables
    let rolesData;
    let roleChoices = [];
    let employeesData;
    let employeeChoices = [];

    // gets the roles table and builds an array of role titles from it
    await new Promise(resolve => {
        connection.promise().query('SELECT * FROM `roles`')
        .then (([rows, fields]) => {
            // console.log(rows);
            rolesData = rows;   
            rows.forEach((row)=> roleChoices.push(row.role_title));
            resolve();            
        })
    })
    
    // gets the employees table and builds an array of employee names
    await new Promise(resolve => {
        connection.promise().query('SELECT * FROM `employees`')
        .then (([rows, fields]) => {
            // console.log(rows);
            employeesData = rows;   
            rows.forEach((row)=> employeeChoices.push(row.first_name +" "+ row.last_name));  
            resolve();          
        })
    })
    
    // returns inquirer.prompt for user question/answers for changing an existing employee's role in the employees table
    await new Promise(resolve => {          
        return inquirer
        .prompt([
        {
            type: 'list',
            name: 'employee_name',
            message: 'Name of the employee who\'s role is being updated.',
            choices: employeeChoices
        },
        {
            type: 'list',
            name: 'role_name',
            message: 'What\'s the new role for this employee?',
            choices: roleChoices
        }])
        .then ((answers)=> {
            // matches the user selected role from the choices and gets its respective role id to pass to the update query
            let roleRow = rolesData.filter((row)=> row.role_title === answers.role_name);
            let roleID = roleRow[0].id_role;
            let roleTitle = roleRow[0].role_title;
           
            let employeeRow = employeesData.filter((row)=> row.first_name+" "+row.last_name === answers.employee_name);    
            let employeeID = employeeRow[0].id_employee;
            let employeeName = answers.employee_name;

            // object to update an employee's role
            let updateRoleParameters = {
                role_id: roleID,
                role_title: roleTitle,
                employee_id: employeeID,
                employee_name: employeeName             
            }

            console.log(updateRoleParameters);
            return updateRoleParameters;
        })
        .then (({role_id, role_title, employee_id, employee_name})=>{            
            const query = `UPDATE employees SET role_id = ${role_id} WHERE id_employee = ${employee_id}`;

            // updates an existing employee's role using role id and employee id
            connection.query(query,
                function(err, results, fields){
                    console.log(`Updated ${employee_name}'s role to ${role_title} inside the company database`);                  
            });
        })
        .then (()=>{
            // gets the employees table as desired with grouping with roles and departments tables
            connection.query(
                'SELECT subordinate.id_employee, subordinate.first_name, subordinate.last_name, roles.role_title, departments.department_name, roles.role_salary, CONCAT(supervisor.first_name, \' \' , supervisor.last_name) AS manager FROM employees subordinate JOIN roles ON subordinate.role_id = roles.id_role JOIN departments ON roles.department_id = departments.id_department LEFT JOIN employees supervisor ON subordinate.manager_id = supervisor.id_employee ORDER BY id_employee;', 
                function(err, results, fields){    
                console.table(results);
            });
        })
        .then (()=> resolve());
    })   

}

// exports all the async function to work on the company_db database
module.exports = {
    getDepartmentsTable, 
    getRolesTable, 
    getEmployeesTable,
    addNewDepartment,
    addNewRole,
    addNewEmployee,
    updateEmployeeRole
};