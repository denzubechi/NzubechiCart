var express = require("express");
const category = require("../models/category");
var router = express.Router();

//Get Category Model
var Category = require("../models/category")
/**
 * Get Catgerory index
 */
router.get('/',  function (req, res){
    Category.find(function (err, categories){
        if (err) return console.log(err)
        res.render('admin/categories', {
            categories: categories
        });
    });
});
/**
 
 * 
 * Add Category
 */
 router.get('/add-category',  function (req, res){
    var title = "";
    
    res.render("admin/add_category", {
        title:title,
    });
});
/**
 * POST add Page
 */
 router.post('/add-category',  function (req, res){
    

    req.checkBody('title', 'Title must have a value').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();


   var errors =  req.validationErrors();

   if(errors){
        res.render("admin/add_category", {
            errors: errors,
            title:title,

        });
   }else {
        Category.findOne({slug: slug}, function(err,category){
            if(category){
                req.flash('danger', 'Category slug exists, choose another');
                res.render('admin/add_category', {
                    title: title,

                });
            }else{
                var category = new Category({
                    title: title,
                    slug:slug,
                });
                category.save(function (err){
                    if(err)
                        return console.log(err);

                    req.flash('success', 'Category added!');
                    res.redirect('/admin/categories')
                })
            }
        })
   }
});
/**
 * GET edit categpry
 */
 router.get('/edit-category/:id',  function (req, res){
    Category.findById(req.params.id, function (err, category){
        if (err)
            return console.log(err);

        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        })
    })
   
});
/**
 * POST edit Category
 */
 router.post('/edit-category/:id',  function (req, res){
    

    req.checkBody('title', 'Title must have a value').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id

   var errors =  req.validationErrors();

   if(errors){
        res.render("admin/add_category", {
            errors: errors,
            title:title,
            id: id
        });
   }else {
        Category.findOne({slug: slug, _id:{'$ne': id}}, function(err,category){
            if(category){
                req.flash('danger', 'Page slug exists, choose another');
                res.render('admin/add_page', {
                    title: title,
                    slug:slug,
                    id: id
                });
            }else{
                Category.findById(id, function (err, category){
                    if (err)
                        return console.log(err);
                    category.title = title;
                    category.slug = slug;

                category.save(function (err){
                    if(err)
                        return console.log(err);

                    req.flash('success', 'Category Edited!');
                    res.redirect('/admin/categories/edit-category/'+id);
                })
                });
                
            }
        });
   }
});
/**
 * Delete page
 */
 router.get('/delete-category/:id',  function (req, res){
    Category.findByIdAndRemove(req.params.id, function(err){
        if (err) return console.log(err);
        req.flash('success', 'Category Deleted !');
                    res.redirect('/admin/categories/');
    })
    });


//Exports
module.exports = router;