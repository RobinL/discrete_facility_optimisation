

var UtilityFunctions = function() {

	this.key_not_in_dict  = function (k, dict) {
        return !(_.has(dict, k))
    }
}