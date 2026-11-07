require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect database
db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err);
        return;
    }
    console.log("MySQL Connected Successfully!");
});

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ================= CUSTOMERS =================

// Get all customers
app.get(["/customers", "/api/customers"], (req, res) => {
    db.query("SELECT * FROM customers", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// Add customer
app.post(["/customers", "/api/customers"], (req, res) => {
    const { name, email, phone, address } = req.body;

    db.query(
        "INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)",
        [name, email, phone, address],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Customer Added Successfully!" });
        }
    );
});

// Search customer
app.get(["/customers/search/:name", "/api/customers/search/:name"], (req, res) => {
    const name = req.params.name;

    db.query(
        "SELECT * FROM customers WHERE name LIKE ?",
        [`%${name}%`],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result);
        }
    );
});

// Update customer
app.put(["/customers/:id", "/api/customers/:id"], (req, res) => {
    const { name, email, phone, address } = req.body;

    db.query(
        "UPDATE customers SET name=?, email=?, phone=?, address=? WHERE customer_id=?",
        [name, email, phone, address, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Customer Updated Successfully!" });
        }
    );
});

// Delete customer
app.delete(["/customers/:id", "/api/customers/:id"], (req, res) => {
    db.query(
        "DELETE FROM customers WHERE customer_id=?",
        [req.params.id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Customer Deleted Successfully!" });
        }
    );
});

// ================= PARCELS =================

// Get all parcels
app.get(["/parcels", "/api/parcels"], (req, res) => {
    db.query("SELECT * FROM parcels ORDER BY parcel_id", (err, result) => {
        if (err) {
            console.log("Parcel Error:", err);
            return res.status(500).json(err);
        }

        res.json(result);
    });
});

// ================= PAYMENTS =================

// Get all payments
app.get(["/payments", "/api/payments"], (req, res) => {
    db.query("SELECT * FROM payments ORDER BY payment_id", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// ================= TRACKING =================

// Get all tracking records
app.get(["/tracking", "/api/tracking"], (req, res) => {
    db.query("SELECT * FROM tracking ORDER BY tracking_id", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// ================= SERVER =================

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
