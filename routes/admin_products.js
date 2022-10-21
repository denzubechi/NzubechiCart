var express = require("express");
var router = express.Router();
var mkdirp = require('mkdirp')
var fs = require('fs-extra')
var resizeImg = require('resize-img')

//Get Producs Model
var Product = require("../models/product")
var Category = require("../models/category")
/**
 * Get Product index
 */
router.get('/',  function (req, res){
    var count;

    Product.count(function (err, c){
        count = c;
    });
    Product.find(function (err, products){
        res.render('admin/products', {
            products: products,
            count:count
        });
    });
});
/**
 * Get Add Product
 */
 router.get('/add-product',  function (req, res){
    var title = "";
    var desc = "";
    var price = "";

    Category.find(function(err, categories){
        res.render('admin/add_product', {
            title:title,
            desc: desc,
            categories:categories,
            price:price
        })
    })
});
/**
 * POST add Product
 */
 router.post('/add-product',  function (req, res){
    
    var imageFile = typeof req.files?.image !== 'undefined' ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('desc', 'Content must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'you must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

   var errors =  req.validationErrors();

   if(errors){
    Category.find(function(err, categories){
        res.render('admin/add_product', {
            errors:errors,
            title:title,
            desc: desc,
            categories:categories,
            price:price
        })
    })
   }else {
        Product.findOne({slug: slug}, function(err,product){
            if(product){
                req.flash('danger', 'Product title exists, choose another');
                Category.find(function(err, categories){
                    res.render('admin/add_product', {
                        title:title,
                        desc: desc,
                        categories:categories,
                        price:price
                    }); 
                });
            }else{
                var price2 = parseFloat(price).toFixed(2);
                var product = new Product({
                    title: title,
                    slug:slug,
                    desc:desc,
                    price:price2,
                    category:category,
                    image:imageFile
                });
                product.save(function (err){
                    if(err)
                        return console.log(err);

                    mkdirp('public/product_images/' + product._id).then(made =>
                        console.log(`made directories, starting with ${made}`))

                    mkdirp('public/product_images/'+ product._id + '/gallery').then(made =>
                            console.log(`made directories, starting with ${made}`))

                    mkdirp('public/product_images/'+ product._id + '/gallery/thumbs').then(made =>
                        console.log(`made directories, starting with ${made}`))
    
                    if (imageFile != ""){
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product._id + '/' + imageFile;

                        productImage.mv(path, (err)=>{
                            if(err){
                                console.log(err)
                            }else{
                                return console.log({ status: "success", path: path });
                            }
                        })
                    }
                    req.flash('success', 'Product added');
                    res.redirect('/admin/products')
                })
            }
        })
   }
});

   
/**
 * GET edit products
 */
 router.get('/edit-product/:id',  function (req, res){

     var errors;
     if (req.session.errors) errors = req.session.errors;
     req.session.erros = null;

     Category.find(function(err, categories){

        Product.findById(req.params.id, function(err, p){
            if (err){
                console.log(err)
                res.redirect('/admin/products')
            }else{
                var galleryDir = 'public/product_images/' + p._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, function(err, files){
                    if(err){
                        console.log(err)
                    }else{
                        galleryImages = files;
                        res.render('admin/edit_product', {
                            title:p.title,
                            errors:errors,
                            desc: p.desc,
                            categories:categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            price:p.price,
                            image: p.image,
                            galleryImages: galleryImages
                        })
                    }
                })
            }
        });
       
    })
   
});
/**
 * POST edit Products
 */
 router.post('/edit-page/:id',  function (req, res){
    

    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('content', 'Content must have a value').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var id = req.params.id

   var errors =  req.validationErrors();

   if(errors){
        res.render("admin/add_page", {
            errors: errors,
            title:title,
            slug:slug,
            content: content,
            id: id
        });
   }else {
        Page.findOne({slug: slug, _id:{'$ne': id}}, function(err,page){
            if(page){
                req.flash('danger', 'Page slug exists, choose another');
                res.render('admin/add_page', {
                    title: title,
                    slug:slug,
                    content: content,
                    id: id
                });
            }else{
                Page.findById(id, function (err, page){
                    if (err)
                        return console.log(err);
                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                page.save(function (err){
                    if(err)
                        return console.log(err);

                    req.flash('success', 'Page Eddited!');
                    res.redirect('/admin/pages/edit-page/'+id);
                })
                });
                
            }
        });
   }
});
/**
 * Delete page
 */
 router.get('/delete-product/:id',  function (req, res){
    Product.findByIdAndRemove(req.params.id, function(err){
        if (err) return console.log(err);
        req.flash('success', 'Product Deleted !');
                    res.redirect('/admin/products/');
    })
    });


//Exports
module.exports = router;