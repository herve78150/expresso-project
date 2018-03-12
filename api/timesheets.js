const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Acces to req.params parent employeeId if necessary
timesheetsRouter = express.Router({mergeParams: true});

// Test if :timesheetId exists
timesheetsRouter.param('timesheetId', (req, res, next, timesheetsId) => {
    db.get("SELECT * FROM Timesheet WHERE id=$timesheetsId", {$timesheetsId: timesheetsId },
           (err, timesheet)=>{
               if (err){
                    next(err);
               } else if (timesheet){
                    next();
               }else{
                    res.sendStatus(404);
               }
           });
});

// GET /api/employees/:employeeId/timesheets
timesheetsRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Timesheet WHERE employee_id =$employeeId", {$employeeId: req.params.employeeId}, 
    (err, timesheets) => {
        if(err){
            next(err);
        } else{
            res.status(200).send({timesheets: timesheets});
        }
    });
});

// POST /api/employees/:employeeId/timesheets
timesheetsRouter.post('/', (req, res, next)=>{
    const hours = Number(req.body.timesheet.hours);
    const rate  =  req.body.timesheet.rate;
    const date  =  req.body.timesheet.date;
    const employee_id = req.params.employeeId;

    if (!hours || !rate || !date || !employee_id ) {
        return res.sendStatus(400);
    }
    const sql ='INSERT INTO Timesheet ( hours, date, rate, employee_id)'
                +' VALUES ($hours, $date, $rate, $employee_id)';
    const values ={
        $hours: hours,
        $date: date,
        $rate: rate,
        $employee_id: employee_id
    };
    db.run(sql, values, function(err){
        if(err){
            next(err);
        } else {
            db.get('SELECT * FROM Timesheet WHERE id =$id', {$id:this.lastID}, 
             (err, timesheet) => {
                if(err){
                    next(err);
                } else {
                    res.status(201).send({timesheet: timesheet });
                }
             });
        }
    });

});


timesheetsRouter.put('/:timesheetId', (req, res, next)=>{
    const hours = Number(req.body.timesheet.hours);
    const rate  = req.body.timesheet.rate;
    const date  = req.body.timesheet.date;
    const employee_id = req.params.employeeId;

    if (!hours || !rate || !date || !employee_id ) {
        return res.sendStatus(400);
    }
    const sql= ("UPDATE Timesheet SET hours=$hours, rate=$rate, date=$date, employee_id=$employee_id"+
                " WHERE id= $timesheetId");
    const values ={
        $hours: hours,
        $date: date,
        $rate: rate,
        $employee_id: employee_id,
        $timesheetId: req.params.timesheetId
    };
    db.run(sql, values, (err) =>{
        if(err){
            next(err);
        }else {
            db.get("SELECT * FROM Timesheet WHERE id =$timesheetId", {$timesheetId: req.params.timesheetId},
                (err, timesheet) => {
                if(err){
                    next(err);
                }else{
                    res.status(200).send({timesheet: timesheet});
                }
            });
        }
    });
});

// DELETE /api/employees/:employeeId/timesheets/:timesheetId
timesheetsRouter.delete('/:timesheetId', (req, res, next)=>{
    db.run("DELETE FROM Timesheet WHERE id =$timesheetId", {$timesheetId: req.params.timesheetId},
        (err) => {
            if(err){
                next(err);
            }else{
                res.sendStatus(204);
            }
    });
});

module.exports = timesheetsRouter;