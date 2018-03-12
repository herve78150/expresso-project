const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || 'database.sqlite');

// Merge req.params menuId and menuItemId 
const menuItemRouter = express.Router({mergeParams: true});

menuItemRouter.param('menuItemId',(req, res, next, menuItemId) => {
    db.get("SELECT * FROM MenuItem WHERE id= $menuItemId", {$menuItemId: menuItemId},
        (err, menuItem) => {
            if(err) {
                next(err);
            } else if(menuItem){
                next();
            } else{
                res.sendStatus(404);
            }
    });
});

// GET /api/menus/:menuId/menu-items
menuItemRouter.get('/', (req, res, next) =>{
    db.all("SELECT * FROM MenuItem WHERE menu_id=$menuId",
           {$menuId: req.params.menuId}, (err, menuItems)=> {
            if(err){
                next(err);
            }else{
                res.status(200).send({menuItems: menuItems});
            }
    });
});

// POST /api/menus/:menuId/menu-items
menuItemRouter.post('/', (req, res, next) =>{
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = Number(req.body.menuItem.inventory);
    const price = Number(req.body.menuItem.price);
    
    if (!name || !description || !inventory || !price ){
        return res.sendStatus(400);
    }

    const sql ="INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menu_id)";
    const values = {
        $name : name,
        $description : description,
        $inventory: inventory,
        $price : price,
        $menu_id : req.params.menuId
    };
    db.run(sql,values, function(err) {
        if (err){
            next(err);
        }else{
            db.get("SELECT * FROM  MenuItem WHERE id =$id", {$id: this.lastID},
                (err, menuItem)=> {
                    res.status(201).send({menuItem: menuItem});
                }
            );
        }
    });
});

// PUT /api/menus/:menuId/menu-items/:menuItemId
menuItemRouter.put('/:menuItemId', (req, res, next) =>{
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = Number(req.body.menuItem.inventory);
    const price = Number(req.body.menuItem.price);
    

    if (!name || !description || !inventory || !price ){
        return res.sendStatus(400);
    }
    const sql ="UPDATE MenuItem SET name=$name, description=$description, inventory=$inventory,"
                + " price=$price, menu_id= $menu_id WHERE  menu_id=$menu_id";
    const value = {
        $name : name,
        $description : description,
        $inventory: inventory,
        $price : price,
        $menu_id : req.params.menuId
    }
    db.run(sql,value, function(err) {
        if (err){
            next(err);
        }else{
            db.get("SELECT * FROM  MenuItem WHERE id =$id", {$id: req.params.menuItemId},
             (err, menuItem)=> {
                if(err){
                    next(err);
                }else{
                    res.status(200).send({menuItem: menuItem});
                }
             });
        }
    });

});

//DELETE api/menus/:menuId/menu-items/:menuItemId
menuItemRouter.delete('/:menuItemId', (req, res, next) =>{ 

    db.get('SELECT * FROM MenuItem WHERE menu_id = $menu_id',{$menu_id:req.params.menuId}, 
        (err, menuItem)=>{
            if (err){
                next(err);
            } else if (menuItem){
                db.run("DELETE FROM MenuItem WHERE id= $menuItemId", {$menuItemId: req.params.menuItemId },
                (err) => {
                    if (err){
                        next(err);
                    }else{
                        res.sendStatus(204);
                    }
                });
            } else{
                res.sendStatus(400);
            }
    });
});

module.exports= menuItemRouter;