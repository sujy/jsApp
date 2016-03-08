//=====================================
//function:   combine base module
//Author:     dr.chan
//contact:    798095202@qq.com
//date:       2015.1.23
//=====================================

angular.module('controllers',
    [
        'homepageControllers',
        'logControllers',
        'clinicControllers',
        'chatControllers',
        'dateControllers',
        'userControllers'
    ]
);

angular.module('services', 
	[
        'dateServices'
 	]
);

angular.module('filters',
    [
    ]
);

angular.module('directives',
    [
        'disable'
    ]
);