//=====================================
//function:   disable input html elemant
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