var express = require("express");
var router = express.Router();
var http = require("http");
var fs = require("fs");
var fileUpload = require('express-fileupload');
var path = require('path');
const check = require('express-validator/check').check;
const validationResult = require('express-validator/check').validationResult;
var mv = require("mv");
var authentication_mdl = require("../middlewares/authentication");
var session_store;
/* GET product page. */

router.get("/", authentication_mdl.is_login, function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM customer",
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("product/list", {
          title: "customer",
          data: rows,
          session_store: req.session,
        });
      }
    );
    //console.log(query.sql);
  });
});

router.delete(
  "/delete/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var customer = {
        id: req.params.id,
      };
      var delete_sql = "DELETE from customer where ?";
      req.getConnection(function (err, connection) {
        var query = connection.query(
          delete_sql,
          customer,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Delete : %s ", err);
              req.flash("msg_error", errors_detail);
              res.redirect("/products");
            } else {
              req.flash("msg_info", "Delete Product Success");
              res.redirect("/products");
            }
          }
        );
      });
    });
  }
);
router.get(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var query = connection.query("SELECT * FROM customer where id=" + req.params.id,
        function (err, rows) {
          if (err) {
            var errors_detail = ("Error Selecting : %s ", err);
            req.flash("msg_error", errors_detail);
            res.redirect("/products");
          } else {
            if (rows.length <= 0) {
              req.flash("msg_error", "Product tidak ditemukan!");
              res.redirect("/products");
            } else {
              console.log(rows);
              res.render("product/edit", {
                title: "Edit",
                data: rows[0],
                session_store: req.session,
              });
            }
          }
        }
      );
    });
  }
);
router.put(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.assert("kode", "Harap isi kode!").notEmpty();
    var errors = req.validationErrors();
    if (!errors) {
      v_kode = req.sanitize("kode").escape().trim();
      v_baju = req.sanitize("baju").escape().trim();
      v_stok = req.sanitize("stok").escape().trim();
      v_harga = req.sanitize("harga").escape();

      if (!req.files) {
        var customer = {
          kode: v_kode,
          baju: v_baju,
          stok: v_stok,
          harga: v_harga,
          };
      }else{
        var file = req.files.gambar;
        file.mimetype == "image/jpg";
        file.mv("public/images/upload/" + file.name);

      var customer = {
        kode: v_kode,
        baju: v_baju,
        stok: v_stok,
        harga: v_harga,
        gambar: file.name,
      }
      };

      var update_sql = "update customer SET ? where id = " + req.params.id;
      req.getConnection(function (err, connection) {
        var query = connection.query(
          update_sql,
          customer,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Update : %s ", err);
              req.flash("msg_error", errors_detail);
              res.render("product/edit", {
                kode: req.param("kode"),
                baju: req.param("baju"),
                stok: req.param("stok"),
                harga: req.param("harga"),
              });
            } else {
              req.flash("msg_info", "Update product success");
              res.redirect("/products/edit/" + req.params.id);
            }
          }
        );
      });
    } else {
      console.log(errors);
      errors_detail = "<p>Sory there are error</p><ul>";
      for (i in errors) {
        error = errors[i];
        errors_detail += "<li>" + error.msg + "</li>";
      }
      errors_detail += "</ul>";
      req.flash("msg_error", errors_detail);
      res.redirect("/products/edit/" + req.params.id);
    }
  }
);

router.post("/add", authentication_mdl.is_login, function (req, res, next) {
  req.assert("kode", "Please fill the kode").notEmpty();
  var errors = req.validationErrors();
  if (!errors) {
    v_kode = req.sanitize("kode").escape().trim();
    v_baju = req.sanitize("baju").escape().trim();
    v_stok = req.sanitize("stok").escape().trim();
    v_harga = req.sanitize("harga").escape();

    var file = req.files.gambar;
    file.mimetype == "image/jpg";
    file.mv("public/images/upload/" + file.name);

    var customer = {
      kode: v_kode,
      baju: v_baju,
      stok: v_stok,
      harga: v_harga,
      gambar: file.name,
    };
    
    var insert_sql = "INSERT INTO customer SET ?";
    req.getConnection(function (err, connection) {
      var query = connection.query(
        insert_sql,
        customer,
        function (err, result) {
          if (err) {
            var errors_detail = ("Error Insert : %s ", err);
            req.flash("msg_error", errors_detail);
            res.render("product/add-product", {
              kode: req.param("kode"),
              baju: req.param("baju"),
              stok: req.param("stok"),
              harga: req.param("harga"),
              session_store: req.session,
            });
          } else {
            req.flash("msg_info", "Create product success");
            res.redirect("/products");
          }
        }
      );
    });
  } else {
    console.log(errors);
    errors_detail = "<p>Sory there are error</p><ul>";
    for (i in errors) {
      error = errors[i];
      errors_detail += "<li>" + error.msg + "</li>";
    }
    errors_detail += "</ul>";
    req.flash("msg_error", errors_detail);
    res.render("product/add-product", {
      kode: req.param("kode"),
      stok: req.param("stok"),
      session_store: req.session,
    });
  }
});

router.get("/add", authentication_mdl.is_login, function (req, res, next) {
  res.render("product/add-product", {
    title: "Add New Product",
    kode: "",
    baju: "",
    harga: "",
    stok: "",
    session_store: req.session,
  });
});

module.exports = router;
