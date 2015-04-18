var Data = require("sdk/self").data;

exports.get = function(content) {

    return Data.url(content);
};

exports.loadJSON = function(filename){

	return JSON.parse(Data.load(filename));
};
