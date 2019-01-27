[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
# factorial-assign
Implement factorial designs for survey experiments using JavaScript.

## Introduction

`factorial-assign` provides functionality to social-science researchers implementing factorial survey experiments online (e.g., using the Qualtrics platform). `factorial-assign` provides the typical quantitative survey researcher with the basic tools required to implement a factorial design. This package expands on existing approaches (e.g., by [Kyle Dropp](http://kyledropp.weebly.com/conjoint.html) and [Thomas J. Leeper](https://github.com/leeper/conjoint-example.git)) by allowing the user to:

1. specify an arbitrary number of hierarchical factors in a JSON object representing the experimental design; and,
2. select factors from the object using a single function, improving accessibility for less-experienced researchers.

The package and documentation assume basic familiarity with coding, and knowledge of experimental methods for the social sciences. Nonetheless, the package is thoroughly documented to enhance accessibility to researchers unfamiliar with JavaScript and JSON, and may be employed effectively by users representing a wide range of skill levels.

## Installation

The `factorial-assign` package is available on npm and can be installed in a designated directory by running:

```bash
npm install @jonathonbaron/factorial-assign
```

Once installed, the module can be imported locally using:

```js
const factorial = require('./factorial-assign');
```

## Using `factorial-assign`

`factorial-assign`'s primary functionality is to randomly select factorial interventions for survey experiments. The package does so by traversing a hierarchically organized JSON object representing the experimental design ("design object").

### Design object format

The researcher must first specify all treatment arms in a JSON object. All treatments should coded according to the convention `treat_ijkl...`, where `i`, `j`, `k`, `l`, `...`, indicate treatments within in each order (indexed from 0).

For instance, a design may include two first-order conditions, each with third- and fourth-order conditions, as represented below (see also the [example included in this README](#example)):

```javascript
design_obj = {
	// FIRST-ORDER
    "treat_0": {
    	// SECOND-ORDER
    	"treat_00":{
    		// THIRD-ORDER
    		"treat_000": {
    			// FOURTH-ORDER
    			"treat_0000": [],
    			"treat_0001": [],
    			"treat_0002": [],
    			"treat_0003": []
    		},
    		"treat_001": {
    			// FOURTH-ORDER
    			"treat_0010": [],
    			"treat_0011": [],
    			"treat_0012": []
    		},
    		"treat_002": {
    			// FOURTH-ORDER
    			"treat_0020": [],
    			"treat_0021": [],
    			"treat_0022": [],
    			"treat_0023": []
    		}
    	},
    	"treat_01":{
    		// THIRD-ORDER
    		"treat_010": [],
    		"treat_011": []
    	},
    	"treat_02":{
    		// THIRD-ORDER
    		"treat_020": {
    			// FOURTH-ORDER
    			"treat_0020": [],
    			"treat_0021": [],
    			"treat_0022": [],
    			"treat_0023": []
    		}
    	}
    },
    "treat_1": {
    	// SECOND-ORDER
    	"treat_10":{
    		// THIRD-ORDER
    		"treat_100": {
    			// FOURTH-ORDER
    			"treat_1000": [],
    			"treat_1001": [],
    			"treat_1002": [],
    			"treat_1003": []
    		},
    		"treat_101": {
    			// FOURTH-ORDER
    			"treat_1010": [],
    			"treat_1011": [],
    			"treat_1012": [],
    			"treat_1013": []
    		} 
    		...
    	}
    	...
    }
    ...
};
```

This structure affords at least two benefits:

1. The user can immediately identify what position a selected treatment occupies in the design's hierarchy
	* by the length of the key; or,
	* by numeric coding, indicating order.
2. Treatment codes can be easily converted to and from more-intuitive labels, e.g., through separate markup enabling simple translation between code-readable treatment codes, and human-readable treatment labels.

Each treatment level features two object keys:

1. `..._text`, where `...` refers to the code of that specific treatment. `..._text` contains "constant" text,
that is, text that must always appear when that particular treatment is selected, regardless of what additional,
subsidiary (or, "next-order") text is selected from that treatment. Because `..._text` string fields lend themselves to use for human-readable treatment labels, `..._text` strings are by default removed from final textual output.
2. `next_ord_treats`, which contains objects named as and representing the next-order treatments that may be 
selected subsequent to the selection selection of the parent treatment.

### Primary functions

#### `select_conds()`

##### Syntax

```javascript
// Select treatment arms from design_obj and store resulting object in next_ord_selections.
var next_ord_selections = select_conds(this_ord = design_obj, draw_mult = false, 
				       wts = null, method = "simple", verbose = false)
```

###### Parameters

* `this_ord`: An object representing a given order of treatment arms.
* Parameters passed to [`draw_random()`](#draw_random)
	* `draw_mult`: A boolean indicating whether to select a single treatment, or multiple.
	* `method`: A string indicating mode of random selection (`"simple"` for simple random selection, or `"complex"` for complex selection).
	* `wts`: An array of weights for selecting treatment arms in the given order.
	* `verbose`: A boolean indicating whether to produce text output stating the sampling approaches being employed.

###### Return value

An object containing selected treatments, and lower-order arms; an object containing results and an array of selected treatment codings if only arrays remain.

##### Description

The `select_conds()` function takes as its input a JSON object and randomly selects treatments from each order as designated by the user. The function is currently configured to be able to select treatments in one of two ways:

1. Single selection (default) randomly selects a single treatment among all available treatments in the given order, with uniform probability.
2. Multiple selection uses simple random assignment to select among multiple treatments in the given order; between 0 and all available treatments can be selected (i.e., each treatment can be conceived of as a discrete factor with two levels---inclusion and exclusion).

The function extracts the selected treatments by object-key name, and returns a new object composed only of the selected treatments (and next-order treatments), until only arrays (containing treatment text) remain. At this point, the function outputs an object containing printable results (`results`, e.g., for a vignette) and a list of selected treatments (`treatments`).

#### `rec_select_conds()`

##### Syntax

```javascript
// Recursively single-select treatment arms from design_obj and store resulting object in results.
var results = arr_select_conds(obj = design_obj, draw_mult = null)
```

###### Parameters

* `obj`: An object representing a given order of treatment arms.
* `draw_mult`: A string indicating mode of random selection (`"null"` or `"single"` for single selection; `"mult"` for multiple selection).

###### Return value

An object containing results.

##### Description

`rec_select_conds()` applies the `select_conds()` function recursively to a specified design object, and is intended to be used with arrays of design objects. The function can be used with an array of objects with the `Array.prototype.map()` method.

Like `select_conds()`, `rec_select_conds()` by default implements single selection. The user can specify `draw_mult = "mult"`, but should be cautious as this will apply multiple selection to all treatment orders represented in the design object. Multiple selection will be suitable for cases where multiple first-order conditions are to be selected, along with multiple lower-order conditions. For other applications, users can use the `Array.prototype.map()` method to apply `rec_select_conds()` to an array of design objects representing higher-order treatments, and select multiple lower-order conditions, as below:

```javascript
first_ord_treats = Object.keys(main_design_obj['next_ord_treats']);

results_obj = {};
first_ord_treats.map(key => {
	var res = arr_select_conds(main_design_obj['next_ord_treats'][key])['results'];
	res = res[Object.keys(res).filter(keys => {
		return !keys.includes('text');
	})];
	results_obj[key] = res;
	return results_obj;
});

Object.keys(results_obj['treat_0']).filter(key => {
	return !key.includes('text');
});
```

#### `print_vignette()`

##### Syntax

```javascript
// Select treatment arms from design_obj and store resulting object in next_ord_selections.
var vignette_obj = print_vignette(results_obj = results, type = null)
```

###### Parameters

* `results_obj`: A results object containing selected treatments.
* `type`: A string indicating printing style for `vignette` output (`"null"` or `"html"` for text joined with HTML tags; `"text"` for text joined with spaces and newline characters).

###### Return value

An object containing a `vignette` with text pre-formatted for HTML or text presentation; and `treatment_text`, an array of the text contained in the selected treatments (but not formatted into a vignette).

##### Description

The `print_vignette()` function takes a `results` object produced by `select_conds()` or `rec_select_conds()`, filters out "empty" strings and `text` keys (i.e., object keys specified by the user to indicate non-markup treatment names). Additionally, `print_vignette()` can take a `type` argument that allows the user to produce basic text output (HTML output, with line breaks between higher-order treatments, is default).

When paragraphs are composed of lower-level treatments, within-order results can be joined using spaces, with between-order results joined using line breaks, e.g.,

```javascript
var vignette = treat_results.map((treat) => {return treat.join(" ")}).join("\n\n");
```

This alternative functionality is also indicated by a comment in the `print_vignette()` function, containing the same example.

### Helper functions

#### `add()`

##### Syntax

```javascript
// Add two numbers.
var sum = add(1, 2);
```

###### Parameters

* `a`: A number.
* `b`: A number.

###### Return value

A number representing the sum of `a` and `b`.

##### Description

The `add()` function adds two numbers; it can be used with the `Array.prototype.reduce()` function to find the sum of an array of numbers.

#### [`bin_combs()`](http://zacg.github.io/blog/2013/08/02/binary-combinations-in-javascript/)

##### Syntax

```javascript
// Generate all possible combinations of n binary parameters.
var combinations = bin_combs(4);
```

###### Parameters

* `n`: The number of binary parameters.

###### Return value

An array of all combination arrays, represented as boolean values.

##### Description
This function is a renamed version of [Zac Gross'](http://zacg.github.io/blog/2013/08/02/binary-combinations-in-javascript/)  `binaryCombos()`. The function is used to generate all possible treatment "profiles," when using multiple selection to select more than one treatment arm, using a pre-specified probability distribution, in `draw_random()` (with selection probabilities for each profile computed within `draw_random()` internally).

#### `contains()`

##### Syntax

```javascript
// Assess whether an array contains a specified element.
var does_contain = contains([1, 2, 3], 3);
```

###### Parameters

* `arr`: An array.
* `pattern`: A "pattern" (usually a number or string) that may or may not be in the array.

###### Return value

A boolean indicating whether the pattern is contained as an element in the array.

##### Description

The `contains()` function assesses whether an array contains a specified element or string. It is used internally in `draw_random()` to traverse the design object.

#### `draw_random()`

##### Syntax

```javascript
// Randomly draw single or multiple elements from an array, with various selection methods.
var does_contain = contains([1, 2, 3], 3);
```

###### Parameters

* `arr`: An array from which to sample.
* `mult`: A boolean indicating whether to sample single or multiple elements (`false` by default, sampling only single elements).
* `method`: A string indicating whether to use "simple" or "complex" sampling ("simple" samples elements using coin flips or draws from a uniform distribution; "complex" samples elements using a pre-specified probability distribution governing draws of all element items.
* `wts`: An array of sampling weights for each element of `arr`.
* `verbose`: A boolean indicating whether to produce text output stating the sampling approaches being employed (`false` by default).

###### Return value

An array of selected `arr` elements.

##### Description

`draw_random()` implements random selection used in the `select_conds()` function. `draw_random()` enables flexible random selection of treatment arms through various methods, indiated primarily by specification of `mult` and `method` arguments.

|  |`mult=true`|`mult=false` (default)|
| --- | --- | --- |
| `method=simple` (default) | If no weights are provided, array elements are selected by an even-weighted coin flip; if weights are provided to `wts`, then weighted coin flips are performed, using the specified weights, to select each element. | Only one element is selected, using the uniform distribution over all array elements. |
| `method=complex`|`arr.length` is passed to `bin_combs()` to generate all possible combinations of treatment-arm selections ("profiles"), with the probabilities of drawing each profile computed using the weights provided to `wts`. | A single element is selected using the weights provided to `wts` to determine sampling probabilities. |

#### `flatten()`

##### Syntax

```javascript
// Flatten an array of arrays.
var flat_arr = flatten([[1, 2, 3], 4]);
```

###### Parameters

* `arr`: An array.

###### Return value

A flattened array.

##### Description

`flatten()` is used to flatten a multi-level array to the next lowest possible level. The function draws from a post by [Markus Wulftange](https://stackoverflow.com/a/10865042/3412593).

#### `multiply()`

##### Syntax

```javascript
// Multiply two numbers.
var prod = multiply(1, 2);
```

###### Parameters

* `a`: A number.
* `b`: A number.

###### Return value

A number representing the product of `a` and `b`.

##### Description

The `add()` function multiplies two numbers; it can be used with the `Array.prototype.reduce()` function to find the product of an array of numbers.

### Example

First, define a `demo_obj` design object using JSON syntax:

```javascript
var demo_obj = {
	"demo_obj_text": [],
	"next_ord_treats": {
		"treat_0": {
			"treat_0_text": [],
			"next_ord_treats": {
				"treat_00": ["Demo text for a first paragraph of treatment text."],
				"treat_01": ["Demo text for a second paragraph of treatment text."],
				"treat_02": ["Demo text for a third paragraph of treatment text."],
				"treat_03": ["Demo text for a fourth paragraph of treatment text."]
			}
		},
		"treat_1": {
			"treat_1_text": [],
			"next_ord_treats": {
				"treat_10": ["Demo text for a first paragraph of treatment text."],
				"treat_11": ["Demo text for a second paragraph of treatment text."],
				"treat_12": ["Demo text for a third paragraph of treatment text."],
				"treat_13": ["Demo text for a fourth paragraph of treatment text."]
			}
		},
		"treat_2": {
			"treat_2_text": [],
			"next_ord_treats": {
				"treat_20": ["Demo text for a first paragraph of treatment text."],
				"treat_21": ["Demo text for a second paragraph of treatment text."],
				"treat_22": ["Demo text for a third paragraph of treatment text."],
				"treat_23": ["Demo text for a fourth paragraph of treatment text."]
			}
		},
		"treat_3": {
			"treat_3_text": [],
			"next_ord_treats": {
				"treat_30": ["Demo text for a first paragraph of treatment text."],
				"treat_31": ["Demo text for a second paragraph of treatment text."],
				"treat_32": ["Demo text for a third paragraph of treatment text."],
				"treat_33": ["Demo text for a fourth paragraph of treatment text."]
			}
		},
		"treat_4": {
			"treat_4_text": [],
			"next_ord_treats": {
				"treat_40": ["Demo text for a first paragraph of treatment text."],
				"treat_41": ["Demo text for a second paragraph of treatment text."],
				"treat_42": ["Demo text for a third paragraph of treatment text."],
				"treat_43": ["Demo text for a fourth paragraph of treatment text."]
			}
		}
	}
}
```

Now, select treatments from the design object.

```javascript
// Require the demo object.
var demo_obj = require('./demo_obj.js');

// Require relevant functions.
var add = require('./index.js').add;
var arr_select_conds = require('./index.js').arr_select_conds;
var bin_combs = require("./index.js").bin_combs;
var contains = require('./index.js').contains;
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

```
