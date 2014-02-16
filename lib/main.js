require("./Panel").init();
require("./Widget").init();
var Ras = require("./Ras");
Ras.init();

exports.onUnload = function (reason){
    Ras.onUnload(reason);
};