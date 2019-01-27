// Require the demo object.
var demo_obj = require('./demo_obj.js');

// Require relevant functions.
var add = require('./index.js').add;
var arr_select_conds = require('./index.js').arr_select_conds;
var bin_combs = require("./index.js").bin_combs;
var draw_random = require('./index.js').draw_random;
var flatten = require('./index.js').flatten;
var multiply = require('./index.js').multiply;
var print_vignette = require('./index.js').print_vignette;
var select_conds = require('./index.js').select_conds;

//// Select relevant treatments.
/// Select first-order treatment.
var first_ord_obj = select_conds(demo_obj, draw_mult = false, method = "simple", verbose = false);

/// Select second-order treatments.
var second_ord_obj = select_conds(first_ord_obj, draw_mult = true);

/// Generate results.
var results_obj = select_conds(second_ord_obj);

/// Produce vignette.
var vignette_obj = print_vignette(results_obj, type = "text");

console.log(vignette_obj.vignette);
