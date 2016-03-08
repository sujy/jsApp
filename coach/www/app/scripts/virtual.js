//=====================================
//function:   combine base module

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