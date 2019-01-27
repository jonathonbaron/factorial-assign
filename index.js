module.exports = {
    /// Define a function to flatten arrays.
    // (Input: array; Output: array)
    flatten: function(arr) {
        return [].concat.apply([], arr);
    },

    // Define a function to produce permutations of n binary parameters.
    // (Input: number; Output: array)
    bin_combs: function(n) {
        var result = [];
        for (y = 0; y < Math.pow(2, n); y++) {
            var combo = [];
            for (x = 0; x < n; x++) {
                //shift bit and and it with 1
                if ((y >> x) & 1)
                    combo.push(true);
                else
                    combo.push(false);
            }
            result.push(combo);
        }
        return result;
    },

    /// Define a function to draw random elements of an array.
    // (Input: two numbers; Output: number)
    add: function(a, b) {
        return a + b;
    },

    // Define a function to multiply two numbers.
    // (Input: two numbers; Output: number)
    multiply: function(a, b) {
        return a * b;
    },
    

    /// Define a function to draw random elements of an array.
    // (Input: array; Output: array)
    draw_random: function(arr, mult = false, method = "simple", wts = null, verbose = false) {
        if (mult === true) {
            if (verbose) console.log("Multiple selection specified by user ...\n");
            if (method === "simple") {
                if (verbose) console.log("Using simple selection ...\n");
                if (wts === null) {
                    if (verbose) console.log("No `wts` provided; setting weight = 0.5 ...\n");
                    return arr.filter(() => (Math.random() > 0.5));
                } else {
                    var res = arr.filter(function(el, pr) {
                        return wts[pr] > Math.random();
                    });
                }
            } else if (method === "complex") {
                if (verbose) console.log("Using complex selection; generating assignment profiles ...\n");
                var draw = Math.random();
                var profiles = bin_combs(arr.length);
                if (wts === null) {
                    if (verbose) console.log("No `wts` provided; setting even weights ...\n");
                    var temp_wts = Array(arr.length).fill(1 / arr.length);
                }
                if (verbose) console.log("Generating profile weights from provided `wts` ...\n");
                var temp_wts = profiles.map(profile => {
                    probs = profile.map(function(el, wt) {
                        if (el) {
                            return wts[wt];
                        } else {
                            return 1 - wts[wt];
                        }
                    });
                    return probs.reduce(multiply);
                });
                var select = false;
                var i = 0;
                while (!select) {
                    if (1 - temp_wts[0] > draw) {
                        temp_wts.splice(0, 1, temp_wts.shift() + temp_wts[0]);
                        i++;
                    } else {
                        select = true;
                    }
                }
                var selections = profiles[i];
                return arr.filter(function(el, sel) {
                    if (selections[sel]) return el;
                });
            } else {
                throw Error("A `method` must be supplied! Possible options are \"simple\" and \"complex.\"")
            }
        } else {
            if (method === "simple") {
                if (verbose) console.log("Using single selection ...\n");
                if (verbose) console.log("No `wts` provided; setting even weights ...\n");
                var draw = Math.floor(Math.random() * arr.length);
                return arr[draw];
            } else {
                if (verbose) console.log("Using complex selection ...\n");
                var draw = Math.random();
                var temp_wts = wts.slice();
                var select = false;
                var i = 0;
                while (!select) {
                    if (1 - temp_wts[0] > draw) {
                        temp_wts.splice(0, 1, temp_wts.shift() + temp_wts[0]);
                        i++;
                    } else {
                        select = true;
                    }
                }
                return arr[i];
            }
        }
    },

    /// Define a function to select conditions and return an object containing next-order 
    /// conditions or results object, containing results and an array of selected treatments.
    // (Input: "this-order" object, string; Output: "next-order" or "results" object)
    select_conds: function(this_ord, draw_mult, method, wts, verbose = false) {
        // Create an array containing this-order object keys.
        var this_ord_keys = Object.keys(this_ord);
        // Assess whether any this-order keys contain next-order object keys.
        // If this-order keys contain next-order keys ...
        if (this_ord_keys.indexOf("results") > -1) {
            console.log("Results already returned!");
            return this_ord;
            // If this-order keys do not contain next-order keys ...
        } else {
            // Assess whether the object contains only arrays.
            var complete = this_ord_keys.map((key) => {
                return Array.isArray(this_ord[key]);
            }).every((el) => {
                return el === true;
            });
            // If only arrays (i.e., no next-order keys) remain ...
            if (complete) {
                // Return results object, containing result text and selected treatment IDs.
                return Object.assign({
                    results: this_ord,
                    treatments: Object.keys(this_ord)
                })
                // If next-order keys remain ...
            } else {
                // If one of this-order treatments contains next-order keys ...
                if (this_ord_keys.indexOf("next_ord_treats") > -1) {
                    // Create an array containing the next-order keys.
                    var next_ord_keys = Object.keys(this_ord["next_ord_treats"]);
                    // Create an empty object for storing the next-order object.
                    var results = {};
                    // Include this order's constant text.
                    results[this_ord_keys[0]] = this_ord[this_ord_keys[0]];
                    // Create an array containing the selected treatment ID(s), per `draw_mult`.
                    // If `draw_mult` is null, set it as false.
                    if (draw_mult === null) {
                        var draw_mult = false;
                    }
                    // If `method` is null, set it as "simple."
                    if (method === null) {
                        var method = "simple";
                    }
                    if (!Array.isArray(wts)) {
                        var selection = draw_random(arr = next_ord_keys, mult = draw_mult, method = method);
                    } else {
                        var selection = draw_random(arr = next_ord_keys, mult = draw_mult, method = method, wts = wts);
                    }
                    if (!Array.isArray(selection)) {
                        selection = Array(1).fill(selection);
                    }
                    // Store all next-order treatment-code keys in the selection array.
                    for (var i = 0; i < selection.length; i++) {
                        // Name the key of the next-order treatment-code keys according to
                        // the current selected treatment.
                        results[selection[i]] = this_ord["next_ord_treats"][selection[i]];
                    }
                    // Return the results object containing the next-order object.
                    return results;
                    // If this_ord_keys only contains treatment keys ...
                } else {
                    // Create an empty object for storing the next-order object.
                    var results = {};
                    // Return the relevant results or next-order treatment IDs.
                    for (var i = 0; i < this_ord_keys.length; i++) {
                        // If the current-indexed key represents an array ...
                        if (Array.isArray(this_ord[this_ord_keys[i]])) {
                            // Include the array in the results object, stored under its name.
                            results[this_ord_keys[i]] = this_ord[this_ord_keys[i]];
                            // If the current-index key represents an object ...
                        } else {
                            // Create an array containing the treatment IDs for this order's 
                            // constant text.
                            var this_ord_text = Object.keys(this_ord[this_ord_keys[i]])[0];
                            // Create an array containing the treatment IDs for the next-order 
                            // treatment IDs.
                            var next_ord_obj = this_ord[this_ord_keys[i]]["next_ord_treats"];
                            // Create an array containing the selected treatment ID(s), per `draw_mult`.
                            // If `draw_mult` is null, set it as false.
                            if (draw_mult === null) {
                                var draw_mult = false;
                            }
                            // If `method` is null, set it as "simple."
                            if (method === null) {
                                var method = "simple";
                            }
                            if (!Array.isArray(wts)) {
                                var next_ord_keys = draw_random(arr = Object.keys(next_ord_obj), mult = draw_mult, method = method);
                            } else {
                                var next_ord_keys = draw_random(arr = Object.keys(next_ord_obj), mult = draw_mult, method = method, wts = wts);
                            }
                            if (!Array.isArray(next_ord_keys)) {
                                next_ord_keys = Array(1).fill(next_ord_keys);
                            }
                            // Store all relevant results or next-order treatment IDs in the 
                            // next-order object.
                            if (next_ord_keys.length > 0) {
                                for (var j = 0; j < next_ord_keys.length; j++) {
                                    // Include this order's constant text.
                                    results[[this_ord_text]] = this_ord[this_ord_keys[i]][this_ord_text];
                                    // Name the key of the next-order treatment-code keys according to
                                    // the current selected treatment.
                                    results[next_ord_keys[j]] = next_ord_obj[next_ord_keys[j]];
                                }
                            } else {
                                results[[this_ord_text]] = this_ord[this_ord_keys[i]][this_ord_text];
                            }
                        }
                    }
                    // Return the results object containing the next-order object.
                    return results;
                }
            }
        }
    },

    /// Define a function to implement select_conds() with arrays (to be used with Array.map()).
    // (Input: object from array; Output: array of objects)
    rec_select_conds: function(obj, draw_mult) {
        if (Object.keys(obj).indexOf("results") > -1) {
            return obj;
        } else {
            var obj = select_conds(obj, draw_mult);
            return rec_select_conds(obj, draw_mult);
        }
    },

    /// Define a function to produce vignette outcome from a results object.
    // (Input: object; Output: object)
    print_vignette: function(results_obj, type = null) {

        /// Produce arrays of treatment text and numericized treatment IDs.
        // Produce "flattened" array of selected treatment text.
        var treatment_text = flatten(
            // Create an array of selected treatment text.
            results_obj["treatments"].map((key) => {
                return results_obj["results"][key];
            })
            // "Flatten" results array and filter undefined/empty results.
        ).filter((treatment) => {
            return treatment != undefined
        });

        // Produce "flattened" array of numericized selected treatment IDs.
        var selected_treats = flatten(
            // Create an array of selected treatment IDs for IDs that yield treatment text.
            results_obj["treatments"].filter((key) => {
                return results_obj["results"][key].length > 0
                // Split treatment IDs by text and numerical components.
            }).map((treat) => {
                // Split strings by underscores.
                return treat.split('_');
                // Remove non-numerical components, and group by parent treatment.
            }).map((treat) => {
                return treat.filter((el) => {
                    // Filter alphabetical text (leaving only numerical codes).
                    return el != "treat" && el != "text" && el != "const";
                });
            })
        );

        /// Produce vignette.
        // Create an array for storing treatment text, grouped by parent treatment.
        var treat_results = [];

        // Create a counter variable indicating parent treatment.
        var treat_level = 0;

        // Group treatments according to the length of the treatment ID.
        for (var i = 0; i < selected_treats.length; i++) {
            // For all but the final index ...
            if (selected_treats[i + 1] != undefined) {
                // If the current-indexed treatment is shorter or 
                // equal in length to the successive-indexed treatment ...
                if (selected_treats[i].length <= selected_treats[i + 1].length) {
                    // If treat_results is empty ...
                    if (treat_results.length === 0) {
                        // If treat_results[treat_level] is undefined ...
                        if (treat_results[treat_level] === undefined) {
                            // Create an empty array for data storage.
                            treat_results[treat_level] = [];
                        }
                        // Push the correspondingly indexed results array value.
                        treat_results[treat_level].push(treatment_text[i]);
                        // If treat_results is not empty ...
                    } else {
                        if (treat_results[treat_level] === undefined) {
                            // Create an empty array for data storage.
                            treat_results[treat_level] = [];
                        }
                        // Push the correspondingly indexed results array value.
                        treat_results[treat_level].push(treatment_text[i]);
                    }
                    // If the current-indexed treatment is longer in length than 
                    // the successive-indexed treatment ...
                } else {
                    // Push the correspondingly indexed results array value.
                    treat_results[treat_level].push(treatment_text[i]);
                    // And increase treat_level by one.
                    treat_level++;
                }
                // If the final index is reached (i.e., the successive-indexed 
                // treatment is undefined) ...
            } else {
                if (treat_results[treat_level] === undefined) {
                    // Create an empty array for data storage.
                    treat_results[treat_level] = [];
                }
                // Push the final correspondingly-indexed results array value.
                treat_results[treat_level].push(treatment_text[i]);
            }
        };

        // Flatten treat_results.
        treat_results = flatten(treat_results);

        /// Join results according to output type.
        if (type = "text") {
            var vignette = treat_results.join("\n\n");
        } else {
            // Join results using HTML line breaks.
            var vignette = treat_results.join("<br /><br />");
        }
        // If paragraphs are composed of lower-level treatments, then within-order results can be joined
        // using spaces, and between-order results can be joined using line breaks. For example:
        // var vignette = treat_results.map((treat) => {return treat.join(" ")}).join("\n\n");

        var vignette_obj = {
            vignette: vignette,
            treatment_text: treatment_text,
            selected_treats: selected_treats
        }
        return vignette_obj;
    }
};