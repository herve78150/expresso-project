const express=require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetsRouter = require('./timesheets.js');
employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
    db.get("SELECT * FROM Employee where id = $id", {$id: employeeId},(err, employee) => {
        if (err) {
            next(err);
        } else if (employee) {
            next();
        }else {
            res.sendStatus(404);
        }
    });
});


//GET /api/employees
employeesRouter.get('/', (req, res, next) =>{
    db.all('SELECT * FROM Employee  WHERE is_current_employee=1', (err, employees) => {
        if (err) {
            next(err);
        } else if ( employees) {
            res.status(200).send({employees: employees});
        } else{
            res.sendStatus(404);
        }
    });
});

//GET /api/employees/:id
employeesRouter.get('/:employeeId', (req, res, next) =>{
    db.get('SELECT * FROM Employee  WHERE id= $id', {$id:req.params.employeeId}, (err, employee) => {
        if (err) {
            next(err);
        } else if ( employee) {
            res.status(200).send({employee: employee});
        } else{
            res.sendStatus(404);
        }
    });
});

/* POST /api/employees */
employeesRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = Number(req.body.employee.wage);

    const is_current_employee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;

    if( (!name) || (!position) || (!wage)){
        return res.sendStatus(400);
    }
    
    const sql = "INSERT INTO Employee (name, position, wage, is_Current_employee )" +
                " VALUES ($name, $position, $wage, $is_current_employee)";
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $is_current_employee: is_current_employee
    };

    db.run(sql, values, function (err){
        if (err) {
            next(err);
        }else {
            db.get("SELECT * from Employee WHERE id = $id", {$id:this.lastID}, (err, employee) =>{
                if (err) {
                    next(err);
                } else {
                     res.status(201).send({employee: employee});
                }
            });
        }
    });
});

/* PUT /api/employees/:employeeId */
employeesRouter.put('/:employeeId', (req, res, next)=> {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = Number(req.body.employee.wage);

    if( (!name) || (!position) || (!wage)){
        return res.sendStatus(400);
    }

    const sql= "UPDATE Employee SET name=$name, position=$position, wage=$wage WHERE id=$id";
    const values ={
        $name:name,
        $position:position,
        $wage:wage,
        $id: req.params.employeeId
    };
    
    db.run(sql, values, (err) => {
        if(err){
            next(err);
        }else{
            db.get('SELECT * from Employee WHERE id=$id', {$id: req.params.employeeId}, (err, employee)=>{
                if(err){
                    next(err);
                }else{
                     return res.status(200).send({employee: employee});
                }
            });
        }
    });

});

// DELETE /api/employees/:employeeId
employeesRouter.delete('/:employeeId', (req, res, next) => {

    db.run('UPDATE Employee SET is_current_employee=0 WHERE id=$id', { $id: req.params.employeeId}, (err) =>{
        if (err) {
            next(err);
        } else{
            db.get('SELECT * FROM Employee WHERE id=$id', {$id:req.params.employeeId}, (err, employee)=>{
                if(err){
                    next(err);
                }else{
                    res.status(200).send({employee: employee});
                }
            });
        }
    });

});

module.exports = employeesRouter;