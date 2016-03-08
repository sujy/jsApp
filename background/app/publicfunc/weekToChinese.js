//===================
//英文星期转中文
//===================
function weekToChinese(week) {
	switch (week) {
		case 'Monday':
			return '星期一';
			break;
		case 'Tuesday':
			return '星期二';
			break;
		case 'Wednesday':
			return '星期三';
			break;
		case 'Thursday':
			return '星期四';
			break;
		case 'Friday':
			return '星期五';
			break;
		case 'Saturday':
			return '星期六';
			break;
		case 'Sunday':
			return '星期日';
			break;
		case '星期一':
			return 'Monday';
			break;
		case '星期二':
			return 'Tuesday';
			break;
		case '星期三':
			return 'Wednesday';
			break;
		case '星期四':
			return 'Thursday';
			break;
		case '星期五':
			return 'Friday';
			break;
		case '星期六':
			return 'Saturday';
			break;
		case '星期日':
			return 'Sunday';
			break;
		default:
			return 'error : not found';
	}
};

module.exports = weekToChinese;