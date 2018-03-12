const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || 'database.sqlite');

const menusRouter = express.Router();

// Mount /menu-items on /api/menus/
const menuItemRouter = require('./menuItem.js');

menusRouter.param('menuId', (req, res, next, menuId) =>{
    db.get("SELECT * FROM Menu WHERE id=$menuId", {$menuId: menuId}, (err, menu)=>{
        if (err){
            next(err);
        } else if (menu) {
            next();
        } else {
            res.sendStatus(404);
        }
    });

});

menusRouter.use('/:menuId/menu-items', menuItemRouter);

// GET /api/menus
menusRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Menu ", (err, menus) =>{
        if (err){
            next(err);
        }  else {
            res.status(200).send({menus: menus});
        }
    });
});

// GET /api/menus/:menuId
menusRouter.get('/:menuId', (req, res, next) => {
    db.get("SELECT * FROM Menu  WHERE id = $menuId", {$menuId: req.params.menuId}, (err, menu) =>{
        if (err){
            next(err);
        }  else {
            res.status(200).send({menu: menu});
        }
    });
});

// POST /api/menus
menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
        return res.sendStatus(400);
    }
    const sql ="INSERT INTO Menu (title) VALUES ($title)";
    const value = {
        $title: title
    };

    db.run(sql, value, function (err) {
        if (err){
            next(err);
        } else {
            db.get("SELECT * FROM Menu WHERE id=$id", {$id: this.lastID}, (err, menu)=>{
                if (err){
                    next(err);
                } else {
                    res.status(201).send({menu : menu});
                }
            });
        }
    });
});

//PUT  /api/menus/:menuId
menusRouter.put('/:menuId', (req, res, next) =>{
    const title = req.body.menu.title;

    if (!title){
        return res.sendStatus(400);
    }

    db.run("UPDATE Menu SET title= $title WHERE id= $menuId", {$title:title, $menuId: req.params.menuId}, (err) =>{
        if(err){
            next(err);
        } else{
            db.get("SELECT * FROM Menu WHERE id=$menuId", {$menuId: req.params.menuId}, 
                  (err,menu)=>{
                  if(err){
                      next(err);
                  } else{
                    res.status(200).send({menu:menu}); 
                  }
            });
        }
    });
});

//DELETE /api/menus/:menuId
menusRouter.delete('/:menuId', (req, res, next) => {
    db.get("SELECT * FROM MenuItem WHERE menu_id = $menuId", {$menuId: req.params.menuId},
        (err, menuItem )=>{
            if (err){
                next(err);
            } else if(menuItem) {
                res.sendStatus(400);
            }else{
                db.run("DELETE FROM Menu WHERE id=$menuId", {$menuId: req.params.menuId}, (err) => {
                    if(err){
                        next(err);
                    } else {
                        res.sendStatus(204);
                    }
                });
            }
    });
}); 

module.exports= menusRouter;