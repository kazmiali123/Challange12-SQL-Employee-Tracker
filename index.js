// import inquirer, mysql2, query.js script
const inquirer = require('inquirer');
const mysql = require('mysql2');
const query = require('./query');

// init function to run at start of node terminal, shows the initial inquirer.prompt available methods for the user
function init () {
    return inquirer
    .prompt([
        {
          type: 'list',
          name: 'select',
          message: 'What would you like to do?',
          choices: ['view all departments', 'view all roles', 'view all employees', 'add a new department', 'add a new role', 'add a new employee', 'update an employee\'s role']
        }
    ]) 
    .then(({select}) =>{
        // switch statement to handle the user's method seletion, using specific functions from the query script
        switch (select) {
            case 'view all departments': return query.getDepartmentsTable();
        
            case 'view all roles': return query.getRolesTable();
    
            case 'view all employees': return query.getEmployeesTable();

            case 'add a new department': return query.addNewDepartment().then(()=> console.log("success"));

            case 'add a new role': return query.addNewRole().then(()=> console.log("success"));

            case 'add a new employee': return query.addNewEmployee().then(()=> console.log("success"));

            case 'update an employee\'s role': return query.updateEmployeeRole().then(()=> console.log("success"));
        }

        console.log("\n");
        return 
    })
    .then (() => {
        // function to allow the tables to populate before restarting from the initial prompt
        setTimeout(() => {
            init();
        }, 1000);
    })

}

// initial function call to get things started
init();