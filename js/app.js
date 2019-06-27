var app = angular.module('app', ['ngAnimate', 'ngTouch', 'ui.grid', 'ui.grid.grouping', 'ui.grid.edit', 'ui.grid.selection', 'ui.grid.cellNav', 'ui.grid.resizeColumns']);

app.controller('MainCtrl', ['$scope', '$http', '$interval', 'uiGridGroupingConstants', '$filter', function ($scope, $http, $interval, uiGridGroupingConstants, $filter) {
  var setGroupValues = function( columns, rows ) {
    return columns;
  };

  $scope.gridOptions = {
    enableFiltering: true,
    enableColumnResizing: true,
    enableGroupHeaderSelection: true,
    treeRowHeaderAlwaysVisible: false,
    showColumnFooter: true,
    enableCellEditOnFocus: true,
    columnDefs: [
      { name: 'Cause', width: '15%', group: {groupPriority: 2} },
      { name: 'Deviation', grouping: { groupPriority: 1 }, sort: { priority: 1, direction: 'asc' }, 
        editableCellTemplate: 'ui-grid/dropdownEditor', width: '10%',
        /*cellFilter: 'mapGender',*/ editDropdownValueLabel: 'deviation', editDropdownOptionsArray: [
          { id: 1, deviation: 'male' },
          { id: 2, deviation: 'female' }
        ] 
      },
      { field: 'Consequence', width: '10%' },
      // { name: 'company', width: '15%' },
      { name: 'Node', grouping: { groupPriority: 0 }, sort: { priority: 0, direction: 'desc' }, width: '25%'},
    ],
    onRegisterApi: function( gridApi ) {
      $scope.gridApi = gridApi;
      $scope.gridApi.grid.registerColumnsProcessor( setGroupValues, 410 );
      $scope.gridApi.selection.on.rowSelectionChanged( $scope, function ( rowChanged ) {
        if ( typeof(rowChanged.treeLevel) !== 'undefined' && rowChanged.treeLevel > -1 ) {
          // this is a group header
          children = $scope.gridApi.treeBase.getRowChildren( rowChanged );
          children.forEach( function ( child ) {
            if ( rowChanged.isSelected ) {
              $scope.gridApi.selection.selectRow( child.entity );
            } else {
              $scope.gridApi.selection.unSelectRow( child.entity );
            }
          });
        }
      });

      $scope.gridApi.grouping.on.groupingChanged($scope, function(col){
        if ( col.grouping.groupPriority ){
          $scope.lastChange = col.displayName + ' grouped with priority ' + col.grouping.groupPriority;
        } else {
          $scope.lastChange = col.displayName + ' removed from grouped columns';
        }
      });

    }
  };

  $http.get('http://ryskconsulting.com/input.json')
  .then(function(response) {
    var data = response.data;

    // for ( var i = 0; i < data.length; i++ ){
    //   data[i].node = data[i].address.node;
    //   data[i].deviation = data[i].deviation === 'male' ? 1: 2;
    //   data[i].balance = Number( data[i].balance.slice(1).replace(/,/,'') );
    // }
    // delete data[2].age;
    $scope.gridOptions.data = data;
  });

}])
// .filter('mapGender', function() {
//   var genderHash = {
//     1: 'male',
//     2: 'female'
//   };

//   return function(input) {
//     var result;
//     var match;
//     if (!input){
//       return '';
//     } else if (result = genderHash[input]) {
//       return result;
//     } else if ( ( match = input.match(/(.+)( \([$\d,.]+\))/) ) && ( result = genderHash[match[1]] ) ) {
//       return result + match[2];
//     } else {
//       return input;
//     }
//   };
// });
