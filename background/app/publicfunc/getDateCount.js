//========
//与当前日期比较，看看是往后几天
//========
function getDateCount(date) {
    var day = new Date().getDay();
    var num = getNum(date);
    var d = num - day;
    if (d >= 0)
    	return d;
    else if (d < 0)
    	return 7 + d;
}

function getNum(date) {
	if (date == 'Monday')
		return 1;
	else if (date == 'Tuesday')
		return 2;
	else if (date == 'Wednesday')
		return 3;
	else if (date == 'Thursday')
		return 4;
	else if (date == 'Friday')
		return 5;
	else if (date == 'Saturday')
		return 6;
	else
		return 0;
}

module.exports = getDateCount;