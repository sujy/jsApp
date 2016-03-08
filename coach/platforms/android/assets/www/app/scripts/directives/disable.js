//=====================================
//function:   disable input html elemant
//Author:     dr.chan
//contact:    798095202@qq.com
//date:       2015.2.3
//=====================================
angular.module('disable', [])
    .directive('myDisable', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attr) {
                scope.$watch(attr.myDisable, function myDisableAction(value) {
                    if (value)
                        element.attr("disabled", "disabled");
                    else
                        element.removeAttr("disabled");
                })
            }
        }
});