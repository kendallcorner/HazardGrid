var app = angular.module('app', ['ngAnimate', 'ngTouch', 'ui.grid', 'ui.grid.grouping', 'ui.grid.edit', 'ui.grid.selection', 'ui.grid.cellNav', 'ui.grid.resizeColumns']);

app.controller('MainCtrl', ['$scope', '$http', '$interval', 'uiGridGroupingConstants', '$filter', 'stats', function ($scope, $http, $interval, uiGridGroupingConstants, $filter, stats ) {
  var setGroupValues = function( columns, rows ) {
    // columns.forEach( function( column ) {
    //   if ( column.grouping && column.grouping.groupPriority > -1 ){
    //     // Put the balance next to all group labels.
    //     column.treeAggregationFn = function( aggregation, fieldValue, numValue, row ) {
    //       if ( typeof(aggregation.value) === 'undefined') {
    //         aggregation.value = 0;
    //       }
    //       aggregation.value = aggregation.value + row.entity.balance;
    //     };
    //     column.customTreeAggregationFinalizerFn = function( aggregation ) {
    //       if ( typeof(aggregation.groupVal) !== 'undefined') {
    //         aggregation.rendered = aggregation.groupVal + ' (' + $filter('currency')(aggregation.value) + ')';
    //       } else {
    //         aggregation.rendered = null;
    //       }
    //     };
    //   }
    // });
    return columns;
  };

  $scope.gridOptions = {
    enableFiltering: true,
    enableColumnResizing: true,
    enableGroupHeaderSelection: true,
    treeRowHeaderAlwaysVisible: false,
    showColumnFooter: true,
    enableCellEditOnFocus: true,
    // treeCustomAggregations: {
    //   variance: {label: 'var: ', menuTitle: 'Agg: Var', aggregationFn: stats.aggregator.sumSquareErr, finalizerFn: stats.finalizer.variance },
    //   stdev: {label: 'stDev: ', aggregationFn: stats.aggregator.sumSquareErr, finalizerFn: stats.finalizer.stDev},
    //   mode: {label: 'mode: ', aggregationFn: stats.aggregator.mode, finalizerFn: stats.finalizer.mode },
    //   median: {label: 'median: ', aggregationFn: stats.aggregator.accumulate.numValue, finalizerFn: stats.finalizer.median }
    // },
    columnDefs: [
      { name: 'cause', width: '15%', group: {groupPriority: 2} },
      { name: 'deviation', grouping: { groupPriority: 1 }, sort: { priority: 1, direction: 'asc' }, 
        editableCellTemplate: 'ui-grid/dropdownEditor', width: '10%',
        cellFilter: 'mapGender', editDropdownValueLabel: 'deviation', editDropdownOptionsArray: [
          { id: 1, deviation: 'male' },
          { id: 2, deviation: 'female' }
        ] 
      },
      { field: 'consequence', /*treeAggregationType: uiGridGroupingConstants.aggregation.MAX,*/ width: '10%' },
      { name: 'company', width: '15%' },
      { name: 'node', grouping: { groupPriority: 0 }, sort: { priority: 0, direction: 'desc' }, width: '25%'},
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

      // $scope.gridApi.grouping.on.aggregationChanged($scope, function(col){
      //   if ( col.treeAggregation.type ){
      //     $scope.lastChange = col.displayName + ' aggregated using ' + col.treeAggregation.type;
      //   } else {
      //     $scope.lastChange = 'Aggregation removed from ' + col.displayName;
      //   }
      // });

      $scope.gridApi.grouping.on.groupingChanged($scope, function(col){
        if ( col.grouping.groupPriority ){
          $scope.lastChange = col.displayName + ' grouped with priority ' + col.grouping.groupPriority;
        } else {
          $scope.lastChange = col.displayName + ' removed from grouped columns';
        }
      });

    }
  };

  $http.get('http://ryskconsulting.com/500_complex.json')
  .then(function(response) {
    var data = response.data;

    for ( var i = 0; i < data.length; i++ ){
      data[i].node = data[i].address.node;
      data[i].deviation = data[i].deviation === 'male' ? 1: 2;
      data[i].balance = Number( data[i].balance.slice(1).replace(/,/,'') );
    }
    delete data[2].age;
    $scope.gridOptions.data = data;
  });

}])
.filter('mapGender', function() {
  var genderHash = {
    1: 'male',
    2: 'female'
  };

  return function(input) {
    var result;
    var match;
    if (!input){
      return '';
    } else if (result = genderHash[input]) {
      return result;
    } else if ( ( match = input.match(/(.+)( \([$\d,.]+\))/) ) && ( result = genderHash[match[1]] ) ) {
      return result + match[2];
    } else {
      return input;
    }
  };
})
.service('stats', function(){

  // var coreAccumulate = function(aggregation, value){
  //   initAggregation(aggregation);
  //   if ( angular.isUndefined(aggregation.stats.accumulator) ){
  //     aggregation.stats.accumulator = [];
  //   }
  //   if ( !isNaN(value) ){
  //     aggregation.stats.accumulator.push(value);
  //   }
  // };

  // var initAggregation = function(aggregation){
  //   /* To be used in conjunction with the cleanup finalizer */
  //   if (angular.isUndefined(aggregation.stats) ){
  //     aggregation.stats = {sum: 0};
  //   }
  // };

  // var increment = function(obj, prop){
  //   /* if the property on obj is undefined, sets to 1, otherwise increments by one */
  //   if ( angular.isUndefined(obj[prop])){
  //     obj[prop] = 1;
  //   }
  //   else {
  //     obj[prop]++;
  //   }
  // };

  // var service = {
  //   aggregator: {
  //     accumulate: {
  //       /* This is to be used with the uiGrid customTreeAggregationFn definition,
  //        * to accumulate all of the data into an array for sorting or other operations by customTreeAggregationFinalizerFn
  //        * In general this strategy is not the most efficient way to generate grouped statistics, but
  //        * sometime is the only way.
  //        */
  //       numValue: function (aggregation, fieldValue, numValue) {
  //         return coreAccumulate(aggregation, numValue);
  //       },
  //       fieldValue: function (aggregation, fieldValue) {
  //         return coreAccumulate(aggregation, fieldValue);
  //       }
  //     },
  //     mode: function(aggregation, fieldValue){
  //       initAggregation(aggregation);
  //       var thisValue = fieldValue;
  //       if (angular.isUndefined(thisValue) || thisValue === null){
  //         thisValue = aggregation.col.grid.options.groupingNullLabel;
  //       }
  //       increment(aggregation.stats, thisValue);
  //       if ( aggregation.stats[thisValue] > aggregation.maxCount || angular.isUndefined(aggregation.maxCount) ){
  //         aggregation.maxCount = aggregation.stats[thisValue];
  //         aggregation.value = thisValue;
  //       }
  //     },
  //     sumSquareErr: function(aggregation, fieldValue, numValue){
  //       initAggregation(aggregation);
  //       if ( !isNaN(numValue) ){
  //         increment(aggregation.stats, 'count');
  //       }
  //       aggregation.stats.sum += numValue || 0;
  //       service.aggregator.accumulate.numValue(aggregation, fieldValue, numValue);
  //     }
  //   },
  //   finalizer: {
  //     cleanup: function (aggregation) {
  //       delete aggregation.stats;
  //       if ( angular.isUndefined(aggregation.rendered) ){
  //         aggregation.rendered = aggregation.value;
  //       }
  //     },
  //     median: function(aggregation){
  //       aggregation.stats.accumulator.sort();
  //       var arrLength = aggregation.stats.accumulator.length;
  //       aggregation.value = arrLength % 2 === 0 ?
  //         (aggregation.stats.accumulator[(arrLength / 2) - 1] + aggregation.stats.accumulator[(arrLength / 2)]) / 2
  //         : aggregation.stats.accumulator[(arrLength / 2) | 0];
  //       service.finalizer.cleanup(aggregation);
  //     },
  //     sumSquareErr: function(aggregation){
  //       aggregation.value = 0;
  //       if ( aggregation.count !== 0 ){
  //         var mean = aggregation.stats.sum/aggregation.stats.count,
  //           error;

  //         angular.forEach(aggregation.stats.accumulator, function(value){
  //           error = value - mean;
  //           aggregation.value += error * error;
  //         });
  //       }
  //     },
  //     variance: function(aggregation){
  //       service.finalizer.sumSquareErr(aggregation);
  //       aggregation.value = aggregation.value / aggregation.stats.count;
  //       service.finalizer.cleanup(aggregation);
  //       aggregation.rendered = Math.round(aggregation.value * 100)/100;
  //     },
  //     varianceP: function(aggregation){
  //       service.finalizer.sumSquareErr(aggregation);
  //       if ( aggregation.count !== 0 ) {
  //         aggregation.value = aggregation.value / (aggregation.stats.count - 1);
  //       }
  //       service.finalizer.cleanup(aggregation);
  //     },
  //     stDev: function(aggregation){
  //       service.finalizer.variance(aggregation);
  //       aggregation.value = Math.sqrt(aggregation.value);
  //       aggregation.rendered = Math.round(aggregation.value * 100)/100;
  //     },
  //     stDevP: function(aggregation){
  //       service.finalizer.varianceP(aggregation);
  //       aggregation.value = Math.sqrt(aggregation.value);
  //       aggregation.rendered = Math.round(aggregation.value * 100)/100;
  //     }
  //   },
  // };

  // return service;
});
