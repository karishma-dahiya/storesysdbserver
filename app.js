
let express = require('express');
const { Client } = require('pg');

let app = express();

const conn = new Client({
    user: 'postgres',
    password: 'Employee@System123',
    database: 'postgres',
    port: 5432,
    host: 'db.mbelawzwvclvwgrdaqtr.supabase.co',
    ssl: { rejectUnauthorized: false },
});
conn.connect(function (res, err) {
    console.log('Connected');
});

app.use(express.json());

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD'
    );
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

const port = 3001;

app.listen(port, () => console.log(`Server is listening on port ${port}`));


app.get('/shops', function (req, res) {
    let sql = 'SELECT * from shops ORDER BY shopId ASC';
    conn.query(sql, function (err, results) {
        if (err) {
            res.status(500).json(`DataBase Error: `, err);
        } else {
            res.json(results.rows);
        }
    });
});
app.post('/shops', function (req, res) {
    let { name, rent} = req.body;
            let sql = 'INSERT INTO shops (name,rent) VALUES($1,$2) ';
            let values = [name,rent];
            conn.query(sql, values, function (err1, results1) {
                if (err1) {
                    res.status(500).json({ error: 'Database Error', message: err1.message });
                } else {
                    res.json({ message: `Successfully Inserted :,`, data: results1.rows[0] });
                }
            });
});
app.get('/products', function (req, res) {
    let sql = 'SELECT * from products ORDER BY productId ASC';
    conn.query(sql, function (err, results) {
        if (err) {
            res.status(500).json(`DataBase Error: `, err);
        } else {
            res.json(results.rows);
        }
    });
});
app.post('/products', function (req, res) {
    let { productname, category,description} = req.body;
            let sql = 'INSERT INTO products (productName, category,description) VALUES($1,$2,$3) ';
            let values = [productname, category,description];
            conn.query(sql, values, function (err1, results1) {
                if (err1) {
                    res.status(500).json({ error: 'Database Error', message: err1.message });
                } else {
                    res.json({ message: `Successfully Inserted :,`, data: results1.rows[0] });
                }
            });
});
app.put('/products/:id', function (req, res) {
   let { productname, category,description } = req.body;
     let id = +req.params.id;
    let values = [productname, category,description, id];
    let sql = 'UPDATE products SET productName=$1, category=$2, description=$3 WHERE productId=$4 ';
    conn.query(sql,values, function (err, results) {
        if (err) {
            res.status(500).json({ error: 'Database Error', message: err.message });
        } else {
            res.json({message:`Successfully Updated :,`});
        }
    });
});

app.get('/purchases', function (req, res) {
    let { sort, shop, product } = req.query;
    let sql = 'SELECT * from purchases';
    let sql2 = ' WHERE ';
    const conditions = [];
    if (product) {
         conditions.push(product);
        let productArr = product.split(',');
        let values = productArr.map((a) => {
                    let val = a.substring(2);
                    return val;
                });
        let productQuery = values.map((a) => `productid = ${+a} `);
        sql2 = sql2 + productQuery.join(' OR ');  
        //console.log(sql2);
    }
    if (shop) {
        conditions.push(shop);
        let shop1 = shop.substring(2);
        sql2 = sql2 + (product ? ' AND ' : '') + ` shopid=${+shop1}`;
        //console.log(shop1,sql2);
    }
    if (sort) {
        conditions.push(sort);
        let query = '';
        if (sort === 'QtyAsc') {
            query = ' ORDER BY quantity ASC';
        } else if (sort === 'QtyDesc') {
            query = ' ORDER BY quantity DESC';
        } else if (sort === 'ValueAsc') {
            query = ' ORDER BY (quantity*price) DESC';
        } else if (sort === 'ValuesDesc') {
             query = ' ORDER BY (quantity*price) DESC';
        }
        sql2 = sql2 + query;
    }
    if (conditions.length > 0) {
        sql = sql + sql2 ;
    }
    //console.log(sql);
    conn.query(sql, function (err, results) {
        if (err) {
            res.status(500).json({ message: 'Database Error',err:err });
        } else {
            res.json(results.rows);
        }
    });
});

app.get('/totalPurchase/shop/:id', function (req, res) {
    let id = +req.params.id;
    let sql = 'SELECT productid, shopId,'
    sql = sql + ' Sum(p.quantity) as totalqty, ';
    sql = sql + ' Sum(quantity * price) as totalamount '; 
    sql=sql+'from purchases p WHERE p.shopId = $1 GROUP BY p.productid, p.shopId';
    conn.query(sql, [id], function (err, results) {
        if (err) {
           res.status(500).json({ error: 'Database Error',err:err,query:sql });
        } else {
            res.json(results.rows);
        }
    });
});
app.get('/totalPurchase/product/:id', function (req, res) {
    let id = +req.params.id;
    let sql = 'SELECT productid, shopId,'
    sql = sql + ' Sum(p.quantity) as totalqty, ';
    sql = sql + ' Sum(quantity * price) as totalamount '; 
    sql=sql+'from purchases p WHERE p.productid = $1 GROUP BY p.productid, p.shopId';
    conn.query(sql, [id], function (err, results) {
        if (err) {
            res.status(500).json({ error: 'Database Error',err:err,query:sql });
        } else {
            res.json(results.rows);
        }
    });
});
