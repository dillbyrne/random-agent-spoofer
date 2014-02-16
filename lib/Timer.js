var Timer = require("sdk/timers"),
	timerid = null;

exports.setTimerId = function(tid){
	timerid = tid;
};

exports.getTimerId = function(){
	return timerid;
};

exports.clearTimer = function(){
	Timer.clearTimeout(timerid);
};

exports.setTimedFunc = function(funcName,time){
	timerid = Timer.setTimeout(funcName,time);
};