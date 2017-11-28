/* global angular, document, window */
'use strict';

var defaulturl = 'app.home';
//var URL_PREFIX = 'http://localhost:8888';
var URL_PREFIX = 'https://lgserv-176108.appspot.com';

angular.module('starter.controllers', ['ionic','ionic.cloud'])

.factory('methodFactory', function ($rootScope) {
    return { reset: function () {
            console.log("methodFactory - reset");
			window.localStorage.setItem('user', null);
			
			$rootScope.emrequest = null;
			$rootScope.emrequests = [];
    }
}})

.controller('AppCtrl', function($scope,$rootScope,$ionicPopup, $ionicModal,$ionicLoading, $ionicPopover, $timeout,$state,$filter,$http, $cordovaCamera,$cordovaNativeAudio) {
    // Form data for the login modal
    $scope.loginData = {};
    $scope.isExpanded = false;
    $scope.hasHeaderFabLeft = false;
    $scope.hasHeaderFabRight = false;
	$scope.URL_PREFIX = URL_PREFIX;

    var navIcons = document.getElementsByClassName('ion-navicon');
    for (var i = 0; i < navIcons.length; i++) {
        navIcons.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }

    ////////////////////////////////////////
    // Layout Methods
    ////////////////////////////////////////

    $scope.hideNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
    };

    $scope.showNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
    };

    $scope.noHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }
    };

    $scope.setExpanded = function(bool) {
        $scope.isExpanded = bool;
    };

    $scope.setHeaderFab = function(location) {
        var hasHeaderFabLeft = false;
        var hasHeaderFabRight = false;

        switch (location) {
            case 'left':
                hasHeaderFabLeft = true;
                break;
            case 'right':
                hasHeaderFabRight = true;
                break;
        }

        $scope.hasHeaderFabLeft = hasHeaderFabLeft;
        $scope.hasHeaderFabRight = hasHeaderFabRight;
    };

    $scope.hasHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (!content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }

    };

    $scope.hideHeader = function() {
        $scope.hideNavBar();
        $scope.noHeader();
    };

    $scope.showHeader = function() {
        $scope.showNavBar();
        $scope.hasHeader();
    };

    $scope.clearFabs = function() {
        var fabs = document.getElementsByClassName('button-fab');
        if (fabs.length && fabs.length > 1) {
            fabs[0].remove();
        }
    };
	
	$rootScope.formatTime = function(date){
			var dateObj = new Date(date);
			return $filter('date')(dateObj, 'HH:mm');
	}
	
	$scope.setLocation = function(){
		$ionicLoading.show();
		navigator.geolocation.getCurrentPosition(function(pos) {
			$ionicLoading.hide();
			console.log("current position "+pos.coords.latitude+","+pos.coords.longitude);
			$scope.emcenter = {};
			$scope.emcenter.latLoc = pos.coords.latitude;
			$scope.emcenter.longLoc = pos.coords.longitude;
             var myPopup = $ionicPopup.show({
				 template: 'ตำแหน่งของศูนย์ ละติจูด <input type = "number" ng-model = "emcenter.latLoc"><BR/>ตำแหน่งของศูนย์ ลองติจูด<input type = "number" ng-model = "emcenter.longLoc">',
				 title: 'ตั้งค่าตำแหน่ง',
				 scope: $scope,
				  buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
					text: 'Cancel',
					type: 'button-default',
					onTap: function(e) {
					 // e.preventDefault();
					}
				  }, {
					text: 'OK',
					type: 'button-positive',
					onTap: function(e) {
						console.log('Save Position!');
						$ionicLoading.show();
						var userObj = JSON.parse(window.localStorage.getItem('user'));
						userObj.referenceObject.locLat = $scope.emcenter.latLoc;
						userObj.referenceObject.locLong = $scope.emcenter.longLoc;
						var headers = { 'Content-Type':'application/json' };
						$http.post(URL_PREFIX+"/api/emcenter/setloc.do",JSON.stringify(userObj.referenceObject),headers).
							success(function(data, status, headers, config) 
							{
								$ionicLoading.hide();
								var alertPopup = $ionicPopup.alert({
									 title: "ตั้งค่าตำแหน่ง",
									 template: "ตั้งค่าตำแหน่งเสร็จสมบูรณ์",
									  buttons: [
									  { text: 'OK',  onTap: function(e) {
											  console.log(e);
											 $state.go("app.home");
											  return true; 
											} 
									   }
									 ]
								  });
														
							}).
							error(function(data, status, headers, config) 
							{
								console.log("error: "+data);
								$ionicLoading.hide();
							});
					}
				  }]
			  });
			  
        }, function(error){
			$ionicLoading.hide();
			console.log("error from positioning "+error.message);
		});
	}
	
	$rootScope.statusTH = function(st){
			if(st == 'calling')
				return 'โทรเรียกฉุกเฉิน';
			if(st == 'responded')
				return 'ตอบรับการโทรเรียก';
			if(st == 'assigned')
				return 'รอศูนย์บริการฉุกเฉิน';
			if(st == 'pickingup')
				return 'กำลังเดินทางรับผู้ป่วย';
			if(st == 'atpatient')
				return 'รถพยาบาลถึงผู้ป่วยแล้ว';
			if(st == 'delivered')
				return 'ผู้ป่วยถึงโรงพยาบาล';
			if(st == 'closed')
				return 'ปิดคำขอบริการ';
	}
	
	$scope.getTimeStamp = function(){
		return (new Date()).getTime();
	}
})

.controller('LoginCtrl', function($scope,$rootScope, $state, $timeout,$ionicPush, $ionicSideMenuDelegate, $stateParams, ionicMaterialInk, $location, $http, $cordovaOauth, $ionicLoading, $ionicPopup) {
	
	var uObj = window.localStorage.getItem('user');
    console.log('LoginCtrl - Existing user: '+window.localStorage.getItem('user'));

   $timeout(function() {
		if(uObj != 'null'){
				  console.log('this user alraldy login so go to homepage : authorizationKey = '+JSON.parse(uObj).authorizationKey);
				  $http.defaults.headers.common['___authorizationkey'] = JSON.parse(window.localStorage.getItem('user')).authorizationKey;
				  $state.go(defaulturl);
				  return;
		 }
	 }, 100);
	 
	$scope.$parent.clearFabs();
    $timeout(function() {
        $scope.$parent.hideHeader();
   }, 0);
	$ionicSideMenuDelegate.canDragContent(false);
    ionicMaterialInk.displayEffect();
	
	$scope.formData = {};
	$scope.formData.appRole = "";
	$scope.ksmLogin = function() {
		$ionicLoading.show();
		var headers = { 'Content-Type':'application/json' };
		$http.post(URL_PREFIX+"/api/security/login.do",JSON.stringify($scope.formData),headers).
			success(function(data, status, headers, config) 
			{
				$ionicLoading.hide();
				console.log("logged in user: "+JSON.stringify(data));
				if(data != ''){
					window.localStorage.setItem('user',JSON.stringify(data));
					
					
					$http.get(URL_PREFIX + "/api/security/pushtoken/save.do?tokenKey=" +  $rootScope.tokenId + "&userId=" + data.id)
					.then(function (res) {
						console.log('Update Device Token for ' + data.id + ' success');
					}, function (err) {
						console.error('ERR', JSON.stringify(err));
					});

					
					$state.go(defaulturl);
					// set header for authorization key
					$http.defaults.headers.common['___authorizationkey'] = data.authorizationKey;
				}else{
					 var alertPopup = $ionicPopup.alert({
					 title: 'Security Alert',
					 template: 'Invalid Username/Password, Please try to login again'
					});

					alertPopup.then(function(res) {
				
					});
				}
				
			}).
			error(function(data, status, headers, config) 
			{
				console.log("error"+JSON.stringify(data));
				$ionicLoading.hide();
			});
	
	}
	
	$scope.ksmRegister = function() {
		$state.go("app.register");
	}
	
})

.controller('RegisterCtrl', function($scope, $stateParams,$state,$ionicSideMenuDelegate, $timeout,$http,$ionicPopup, ionicMaterialMotion,$ionicLoading, ionicMaterialInk) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
	$ionicSideMenuDelegate.canDragContent(false);
	 $timeout(function() {
        $scope.$parent.hideHeader();
    }, 0);
	$scope.formData ={};
	$scope.search = {};
	$scope.validateCode = function(){
		$ionicLoading.show();
		$http.get(URL_PREFIX+"/public/emcenter/securityCode/query.do?code="+$scope.search.securityCode)
			.then(function(res){ 
				$ionicLoading.hide();
				console.log(res.data);
				if(res.data.length > 0 ){
					$scope.emcenter = res.data[0];
					$scope.formData.appReferObjectId = $scope.emcenter.id;
				} else {
					var alertPopup = $ionicPopup.alert({
							title: 'เกิดความผิดพลาด',
							template: 'ไม่พบศูนย์บริการฉุกเฉิน'
						});
				}
			}
			, function(err) {
				console.error('ERR', JSON.stringify(err));
				$ionicLoading.hide();
			}); 
	}
	$scope.submit = function() {
		if (!$scope.formData.username.match(/^[0-9a-z]+$/) || !$scope.formData.password.match(/^[0-9a-z]+$/)){
			var alertPopup = $ionicPopup.alert({
					 title: 'Registration Fail',
					 template: 'Username และ Password ต้องประกอบไปด้วยตัวเลข ตัวอักษร A-Z ตัวเล็กหรือตัวใหญ่ เท่านั้น'
					});
			alertPopup.then(function(res) {});
			return;
		}

		$ionicLoading.show();
		$scope.formData.role = 'user';
	//	$scope.formData.appRole = "EmCenter";
		$scope.formData.status = 0;
		var headers = { 'Content-Type':'application/json' };
		$http.post(URL_PREFIX+"/api/security/register.do",JSON.stringify($scope.formData),headers).
			success(function(data, status, headers, config) 
			{
				$ionicLoading.hide();
				console.log("success: "+JSON.stringify(data));
				if(data.status == "-3"){
					 var alertPopup = $ionicPopup.alert({
					 title: 'Registration Fail',
					 template: 'Username มีผู้ใช้แล้ว <BR/>โปรดใส่ username ใหม่'
					});
					alertPopup.then(function(res) {});
					
				} else if(data.status == "-1") {
					var alertPopup = $ionicPopup.alert({
					 title: 'Registration Fail',
					 template: 'ระบบเกิดความผิดพลาดในระหว่างการลงเบียน โปรดลงทะเบียนใหม่'
					});

					alertPopup.then(function(res) {});
				} else {
					var alertPopup = $ionicPopup.alert({
					 title: 'Registration Success',
					 template: 'การลงทะเบียนสำเร็จ โปรดเข้าระบบด้วย Username และ Password ที่ตั้งไว้'
					});

					alertPopup.then(function(res) {
					 $state.go('app.login');
					});
					//$state.go('app.login');
				}

			}).
			error(function(data, status, headers, config) 
			{
				console.log("error: "+data);
				$ionicLoading.hide();
				
				
			});
	}
	
  
})

.controller('ResetPasswordCtrl', function($scope, $stateParams,$state,$ionicSideMenuDelegate, $timeout,$http,$ionicPopup, ionicMaterialMotion,$ionicLoading, ionicMaterialInk) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
	$ionicSideMenuDelegate.canDragContent(false);
	 $timeout(function() {
        $scope.$parent.hideHeader();
    }, 0);
	$scope.formData ={};
	
	$scope.submit = function() {
		$ionicLoading.show();
		var headers = { 'Content-Type':'application/json' };
		$http.post(URL_PREFIX+"/api/security/resetPassword.do",JSON.stringify($scope.formData),headers).
			success(function(data, status, headers, config) 
			{
				$ionicLoading.hide();
				if(data.status == "-1"){
					var alertPopup = $ionicPopup.alert({
					 title: 'Reset Password Fail',
					 template: 'เกิดความผิดพลาดในระหว่างการตั้งรหัส <BR/>'+data.key
					});
					alertPopup.then(function(res) {});
				} else {
					var alertPopup = $ionicPopup.alert({
					 title: 'Reset Password Success',
					 template: 'การตั้งรหัสสำเร็จ โปรดตรวจสอบข้อความในอีเมล'
					});
					alertPopup.then(function(res) { $state.go('app.login'); });
				}
					
				console.log(JSON.stringify(data));
			}).
			error(function(data, status, headers, config) 
			{
				console.log("error: "+data);
				$ionicLoading.hide();
			});
	}
})

.controller("LogoutCtrl", function ($scope, $state,$http, $ionicLoading, methodFactory) {
	console.log("LogoutCtrl called");
	$ionicLoading.show();
	var uObj = JSON.parse(window.localStorage.getItem('user'));
	console.log("user: "+JSON.stringify(uObj));
	$http.get(URL_PREFIX + "/api/security/logout.do?username=" + uObj.username)
					.then(function (res) {
						$ionicLoading.hide();
						console.log('Successfully logout..');
						methodFactory.reset();
						$state.go('app.login');
					}, function (err) {
						console.error('ERR', JSON.stringify(err));
					});
	
})

.controller('ProfileCtrl', function ($scope, $rootScope, $window, $ionicHistory, $ionicNavBarDelegate, $ionicSideMenuDelegate, $stateParams, $ionicPopup, $http, $filter, $timeout, ionicMaterialMotion, $ionicLoading, ionicMaterialInk, $state) {
		$rootScope.showMenu = true;
		// Set Header
		$scope.$parent.showHeader();
		$scope.$parent.clearFabs();
		$scope.isExpanded = true;
		$scope.$parent.setExpanded(true);
		$scope.$parent.setHeaderFab(false);
		$ionicNavBarDelegate.showBackButton(true);
		$ionicSideMenuDelegate.canDragContent(true);
		
		var userObj = JSON.parse(window.localStorage.getItem('user'));
		$scope.formData = {};
		$scope.formData.firstname = userObj.firstname;
		$scope.formData.lastname = userObj.lastname;
		$scope.formData.phone = userObj.phone;
		$scope.formData.email = userObj.email;
		$scope.saveData = function(){
			userObj.firstname = $scope.formData.firstname;
			userObj.lastname = $scope.formData.lastname;
			userObj.phone = $scope.formData.phone;
			userObj.email = $scope.formData.email;
			$ionicLoading.show();
			var headers = {'Content-Type': 'application/json'};
			$http.post(URL_PREFIX + "/api/user/save.do", JSON.stringify(userObj), headers).
				success(function (data, status, headers, config) {
					$ionicLoading.hide();
					window.localStorage.setItem('user',JSON.stringify(userObj));
					var alertPopup = $ionicPopup.alert({
							title: 'Complete',
							template: 'การแก้ไขข้อมูลสร็จสมบูรณ์ !'
						});
					alertPopup.then(function (res) {
						$state.go("app.home");
					});
					 
				}).
				error(function (data, status, headers, config) {
					console.log("error" + JSON.stringify(data));
					$ionicLoading.hide();
				});
		}
		
		$scope.changePW = function(){
			if( $scope.formData.password != $scope.formData.repassword){
				var alertPopup = $ionicPopup.alert({
							title: 'Error',
							template: 'รหัสผ่านที่ใส่ไม่ตรงกัน '
						});
				return;
			}
			
			$ionicLoading.show();
			userObj.password = $scope.formData.password;
			var headers = {'Content-Type': 'application/json'};
			$http.post(URL_PREFIX + "/api/user/changePassword.do", JSON.stringify(userObj), headers).
				success(function (data, status, headers, config) {
					$ionicLoading.hide();
					var alertPopup = $ionicPopup.alert({
							title: 'Complete',
							template: 'การแก้ไขรหัสผ่านเสร็จสมบูรณ์ !'
						});
					alertPopup.then(function (res) {
						$state.go("app.home");
					});
					window.localStorage.setItem('user',JSON.stringify(userObj));
				}).
				error(function (data, status, headers, config) {
					console.log("error" + JSON.stringify(data));
					$ionicLoading.hide();
				});
		}
		/**
		
		**/
	})
	
.controller('WelcomeCtrl', function($scope,$rootScope, $window,$ionicActionSheet, $ionicHistory,$ionicNavBarDelegate,$ionicSideMenuDelegate, $stateParams,$ionicPopup, $http,$filter, $timeout, ionicMaterialMotion,$ionicLoading, ionicMaterialInk) {
	console.log("WelcomeCtrl is called");
	// Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
	$ionicNavBarDelegate.showBackButton(false);
	$ionicSideMenuDelegate.canDragContent(true);
	
})

.controller('HomeCtrl', function($scope,$state, $rootScope, $window,$ionicActionSheet, $ionicHistory,$ionicNavBarDelegate,$ionicSideMenuDelegate, $stateParams,$ionicPopup, $http,$filter, $timeout, ionicMaterialMotion,$ionicLoading, ionicMaterialInk,$cordovaCamera,$cordovaFileTransfer,$cordovaDevice,$cordovaFile) {
	console.log("HomeCtrl "+$stateParams.showIndex)
	
	// Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
	$ionicNavBarDelegate.showBackButton(false);
	$ionicSideMenuDelegate.canDragContent(true);
	if($stateParams.showIndex == ''){
		$stateParams.showIndex = 0;
	}
	$scope.distance = 0;
	$scope.duration = 0;
	$scope.findingroute = true;
	
	var userObj = JSON.parse(window.localStorage.getItem('user'));
	// query patient by care giver id
	
	var queryurl = "";
	if(userObj.appRole == "EmCenter"){
		queryurl = "/api/emrequest/emcenter/status/open/query.do?id="+userObj.referenceObject.id;
		
	} else if(userObj.appRole == "EmDriver"){
		queryurl = "/api/emrequest/emdriver/status/open/query.do?id="+userObj.id;
		
	} else {
		$state.go("app.logout");
	}
	
	$rootScope.loadTasks = function(){
		$ionicLoading.show();
		$http.get(URL_PREFIX + queryurl)
			.then(function(res){ 
				$ionicLoading.hide();
				$rootScope.emrequests = res.data;
				console.log("found request: "+res.data.length);
				if(res.data == null || res.data.length == 0){
					$state.go("app.welcome");
				} else {
					// query patient and position
					console.log(JSON.stringify(res.data));
					
					if(res.data.length > 0){
						$rootScope.emrequest = res.data[$stateParams.showIndex];
						
						$scope.patient = res.data[$stateParams.showIndex].patient;
						$scope.patient.photoFileURL = URL_PREFIX + $scope.patient.photoFileURI;
						$scope.patient.currentStatus = res.data[$stateParams.showIndex].status;
						console.log($scope.patient.photoFileURL);
					}
					$ionicLoading.show();
					$http.get(URL_PREFIX+"/api/patient/locationlog/list.do?id="+$scope.patient.id)
					.then(function(res){ 
						$ionicLoading.hide();
						$scope.labels = []; 
						if(res.data!=0){
							$scope.patient.currentLat = res.data[0].locLat;
							$scope.patient.currentLong = res.data[0].locLong;
						}
						
						setTimeout(function() {google.maps.event.addDomListener(window, 'load', loadMap());},500);
						$state.go("app.home");
					}, function(err) {
						console.error('ERR', JSON.stringify(err));
						$ionicLoading.hide();
					}); 
				}
		}
			, function(err) {
				console.error('ERR', JSON.stringify(err));
				$ionicLoading.hide();
			}); 
	}
	$rootScope.loadTasks();
	
	var loadMap = function() {
		console.log("inside google map dom listener");
        var myLatlng = new google.maps.LatLng($scope.patient.currentLat, $scope.patient.currentLong);
 
        var mapOptions = {
            center: myLatlng,
            zoom: 10,
			streetViewControl: false,
			mapTypeControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
			
        };
		console.log("before render map ");
        var map = new google.maps.Map(document.getElementById("patient-map"), mapOptions);
		console.log("after render map ");
		var pImage = 'https://storage.googleapis.com/image-mobile/user_pointer.png';
		var hImage = 'https://storage.googleapis.com/image-mobile/home-pointer.png';
		var erImage = 'https://storage.googleapis.com/image-mobile/er-pointer.png';
		console.log("currentLat"+$scope.patient.currentLat);
		
		var myLocation = new google.maps.Marker({
			position: new google.maps.LatLng($scope.patient.currentLat, $scope.patient.currentLong),
			map: map,
			icon: pImage,
			title: "Patient"
		});
		var homeLocation = new google.maps.Marker({
			position: new google.maps.LatLng($scope.patient.homeLat, $scope.patient.homeLong),
			map: map,
			icon: hImage,
			title: "Home"
		});
		//var options = {maximumAge: 0, timeout: 10000, enableHighAccuracy:true};
		navigator.geolocation.getCurrentPosition(function(pos) {
			$ionicLoading.hide();
			$scope.findingroute = false;
			console.log("current position "+pos.coords.latitude+","+pos.coords.longitude);
			var homeLocation = new google.maps.Marker({
				position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
				map: map,
				icon: erImage,
				title: "My Position"
			});
			
			displayRoute( map,pos.coords.latitude, pos.coords.longitude,$scope.patient.currentLat, $scope.patient.currentLong  );
			//console.log("routeleg"+$scope.routeleg);
		}, function(error){
			$ionicLoading.hide();
			console.log("error from positioning "+error.message);
		});
        $scope.map = map;
    };
	
	var displayRoute =function ( map, startLat, startLong, endLat, endLong) {

		var start = new google.maps.LatLng(startLat, startLong);
		var end = new google.maps.LatLng(endLat, endLong);

		var directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});// also, constructor can get "DirectionsRendererOptions" object
		directionsDisplay.setMap(map); // map should be already initialized.
		directionsDisplay.setPanel(document.getElementById('directionsPanel'));


		var request = {
			origin : start,
			destination : end,
			travelMode : google.maps.TravelMode.DRIVING
		};
		var directionsService = new google.maps.DirectionsService(); 
		directionsService.route(request, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(response);
				
				$scope.routeleg = directionsDisplay.getDirections().routes[directionsDisplay.getRouteIndex()].legs[0];
				//console.log("leg "+JSON.stringify($scope.routeleg));
				$scope.$apply(function(){
				$scope.distance = Math.round($scope.routeleg.distance.value/1000);
				$scope.duration =  Math.round($scope.routeleg.duration.value/1000);
				});
				console.log("leg "+$scope.distance);
				
			}
			
		});
		

	}

	$rootScope.phonecall = function ( phonenumber ) {
		console.log("phone call "+phonenumber);
		var call = "tel:" + phonenumber;
		document.location.href = call;
	}
	
	
	 // Show the action sheet
	var buttons = [
		   { text: '<i class="icon ion-android-call"></i>ติดต่อคนไข้' },
		   { text: '<i class="icon ion-android-home"></i>บันทึกสถานะ' }
		 ];
	if(userObj.appRole == 'EmCenter'){
			buttons.push({ text: '<i class="icon ion-android-arrow-forward"></i>มอบหมายรถ' });

	}
	$scope.showMenu = function() {
	   var hideSheet = $ionicActionSheet.show({
		 buttons: buttons,
		 cancelText: 'ปิด',
		 cancel: function() {
			  // add cancel code..
			},
		 buttonClicked: function(index) {
			if(index == 0)
				$rootScope.phonecall($scope.patient.phone);
			if(index == 1)
				$state.go('app.emrequestLogList',{requestid: $rootScope.emrequest.id});
		   if(index == 2)
				$state.go('app.assignDriver',{requestid: $rootScope.emrequest.id});
		   return true;
		 }
	   });
	}
	
	  $scope.pathForImage = function(image) {
		  if (image === null) {
			return '';
		  } else {
			return cordova.file.dataDirectory + image;
		  }
		};
	
	  
	
	
})

.controller("EmrequestLogListCtrl", function ($scope,$ionicNavBarDelegate, $state,$http,$stateParams, $ionicLoading, methodFactory, $rootScope) {
	console.log('emrequest id:' + $stateParams.requestid);
	
	$scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    $scope.$parent.setExpanded(true);
    $scope.$parent.setHeaderFab(true);
	$ionicNavBarDelegate.showBackButton(true);
	
	$ionicLoading.show();
	$scope.loadData = function(){
		$http.get(URL_PREFIX + "/api/emrequest/emrequeststatuslog/list.do?id=" + $stateParams.requestid)
				.success(function (data, status) {
					$scope.statusLogs = data;
					$scope.$broadcast('scroll.refreshComplete');
					$ionicLoading.hide();
					if($scope.statusLogs.length > 0){
						$rootScope.emrequest.status = $scope.statusLogs[0].status;
					}
				}).error(function (data, status) {
					console.log("error" + JSON.stringify(data));
					$ionicLoading.hide();
					$rootScope.errorPopUp(true);
				});
	}
	$scope.loadData();
	
	$scope.newEmrequestLog = function (dr) {
		$state.go('app.emrequestLogForm',{requestid: $stateParams.requestid,direction: dr});
	}
	
	

})

.controller("EmrequestLogFormCtrl", function ($scope, $state,$http,$stateParams, $ionicLoading, methodFactory, $rootScope,$ionicPopup ) {
	console.log('emrequest id:' + $stateParams.requestid+" "+$stateParams.direction);
	
	$scope.$parent.showHeader();
	$scope.isExpanded = true;
	$scope.$parent.setExpanded(true);
	
	$scope.log = {};
	$scope.log.emRequestId = $stateParams.requestid;
	
	$scope.submit = function(){
		$ionicLoading.show();
		console.log($scope.log);
		$http.post(URL_PREFIX + "/api/emrequeststatuslog/save.do", JSON.stringify($scope.log)).
			success(function (data, status) {
				$ionicLoading.hide();
				var alertPopup = $ionicPopup.alert({
					title: 'เสร็จสิ้น',
					template: 'บันทึกสถานะการบริการเสร็จสมบูรณ์'
				});
				alertPopup.then(function (res) {
					//$rootScope.loadTasks();
					$state.go('app.emrequestLogList',{requestid: $stateParams.requestid});
				});
				
			}).error(function (data, status) {
				console.log("error" + JSON.stringify(data));
				$ionicLoading.hide();
				$rootScope.errorPopUp(true);
			});
		

	}
	
	$scope.back = function(){
		console.log($scope.log);
		$state.go('app.emrequestLogList',{requestid: $stateParams.requestid});
	}
	
	
	$http.get(URL_PREFIX + "/api/emrequest/status/"+$stateParams.direction+"/list.do?status=" + $rootScope.emrequest.status)
			.success(function (data, status) {
				console.log(data);
				$scope.statusList = data;
				$scope.log.status = data[0];
				$ionicLoading.hide();
			}).error(function (data, status) {
				console.log("error" + JSON.stringify(data));
				$ionicLoading.hide();
				$rootScope.errorPopUp(true);
			});

})

.controller("AssignDriverCtrl", function ($scope, $state,$http,$stateParams, $ionicLoading, methodFactory,$ionicNavBarDelegate, $rootScope,$ionicPopup ) {
	console.log('emrequest id:' + $rootScope.emrequest.id);
	
	$scope.$parent.showHeader();
	$scope.isExpanded = true;
	$scope.$parent.setExpanded(true);
	$ionicNavBarDelegate.showBackButton(true);
	
	var userObj = JSON.parse(window.localStorage.getItem('user'));
	$scope.formData = {};
	$scope.formData.driver = $rootScope.emrequest.emDriverId;
	$ionicLoading.show();
	$http.get(URL_PREFIX+"/api/emcenter/emdriver/list.do?id="+userObj.referenceObject.id)
			.then(function(res){ 
				$scope.driverList = res.data;
				$ionicLoading.hide();
			}, function(err) {
				console.error('ERR', JSON.stringify(err));
				$ionicLoading.hide();
			}); 
		
	$scope.submit = function(){
		$rootScope.emrequest.emDriverId = $scope.formData.driver;
		var driverName = "";
		for(var i=0; i<$scope.driverList.length; i++){
			if($scope.driverList[i].id == $rootScope.emrequest.emDriverId){
				$rootScope.emrequest.note = "ส่งงานบริการฉุกเฉินต่อให้คนขับรถ "+ $scope.driverList[i].firstname +" "+$scope.driverList[i].lastname;
			}
		}
		$ionicLoading.show();
		var headers = {'Content-Type': 'application/json'};
		$http.post(URL_PREFIX + "/api/emrequest/assign.do", JSON.stringify($rootScope.emrequest), headers).
				success(function (data, status, headers, config) {
					$ionicLoading.hide();
					var alertPopup = $ionicPopup.alert({
							title: 'Complete',
							template: 'การส่งงานเสร็จสมบูรณ์ !'
						});
					alertPopup.then(function (res) {
						$state.go('app.home');
					});

				
				}).
				error(function (data, status, headers, config) {
					console.log("error" + JSON.stringify(data));
					$ionicLoading.hide();
				});
	}
			
})

.controller("SelectLocationCtrl", function ($scope, $state,$http,$stateParams,$ionicNavBarDelegate, $ionicLoading, methodFactory, $rootScope,$ionicPopup ) {
	console.log('SelectLocationCtrl called');
	
	$scope.$parent.showHeader();
	$scope.isExpanded = true;
	$scope.$parent.setExpanded(true);
	$ionicNavBarDelegate.showBackButton(true);
	
	var userObj = JSON.parse(window.localStorage.getItem('user'));
	$scope.emcenter = userObj.referenceObject;
	$scope.emLat = $scope.emcenter.locLat;
	$scope.emLong =  $scope.emcenter.locLong;
	var loadEmCenterMap = function () {
			var myLatlng = new google.maps.LatLng($scope.emLat, $scope.emLong);
			var map = new google.maps.Map(document.getElementById('em-center-map'), {
				zoom: 12,
				center: myLatlng
			});
			var marker = new google.maps.Marker({
				position: myLatlng,
				map: map,
				draggable: true,
				animation: (google.maps.Animation.BOUNCE)
			});

			var updateMarkerPosition = function () {
				myLatlng = new google.maps.LatLng($scope.emLat, $scope.emLong);
				marker.setPosition(myLatlng);
			}

			var onDrag = new google.maps.event.addListener(marker, 'dragend', function (event) {
				$scope.emLat = event.latLng.lat();
				$scope.emLong = event.latLng.lng();
				console.log('on draging we get markerLat ' + $scope.emLat + " markerLong " + $scope.emLong);
			});

			var onClick = new google.maps.event.addListener(map, 'click', function (event) {
				$scope.emLat = event.latLng.lat();
				$scope.emLong = event.latLng.lng();
				updateMarkerPosition();
				console.log('on clicking we get markerLat ' + $scope.emLat + " markerLong " + $scope.emLong);
			});
			$ionicLoading.hide();
		}
	setTimeout(function () {
		google.maps.event.addDomListener(window, 'load', loadEmCenterMap());
	}, 50);
		
	$scope.setloc = function(){
		$ionicLoading.show();
		userObj.referenceObject.locLat = $scope.emLat;
		userObj.referenceObject.locLong = $scope.emLong;
		window.localStorage.setItem('user',JSON.stringify(userObj));
		var headers = { 'Content-Type':'application/json' };
		$http.post(URL_PREFIX+"/api/emcenter/setloc.do",JSON.stringify(userObj.referenceObject),headers).
			success(function(data, status, headers, config) 
			{
				$ionicLoading.hide();
				var alertPopup = $ionicPopup.alert({
					 title: "ตั้งค่าตำแหน่ง",
					 template: "ตั้งค่าตำแหน่งเสร็จสมบูรณ์",
					  buttons: [
					  { text: 'OK',  onTap: function(e) {
							  console.log(e);
							 $state.go("app.home");
							  return true; 
							} 
					   }
					 ]
				  });
										
			}).
			error(function(data, status, headers, config) 
			{
				console.log("error: "+data);
				$ionicLoading.hide();
			});
		
	}
})

.directive('ionMultipleSelect', ['$ionicModal', '$ionicGesture', function ($ionicModal, $ionicGesture) {
  return {
    restrict: 'E',
    scope: {
      options : "=",
	  coptions : "="
    },
    controller: function ($scope, $element, $attrs, $ionicLoading) {
	console.log("chbx:"+$attrs.renderCheckbox+$attrs.keyProperty);
      $scope.multipleSelect = {
        title:            $attrs.title || "Select Options",
        tempOptions:      [],
        keyProperty:      $attrs.keyProperty || "id",
        valueProperty:    $attrs.valueProperty || "value",
        selectedProperty: $attrs.selectedProperty || "selected",
        templateUrl:      $attrs.templateUrl || 'templates/multipleSelect.html',
        renderCheckbox:   $attrs.renderCheckbox ? $attrs.renderCheckbox == "true" : true,
        animation:        $attrs.animation || 'none'//'slide-in-up'
      };
      $scope.OpenModalFromTemplate = function (templateUrl) {
        $ionicModal.fromTemplateUrl(templateUrl, {
          scope: $scope,
          animation: $scope.multipleSelect.animation
        }).then(function (modal) {
          $scope.modal = modal;
          $scope.modal.show();
        });
      };
      
      $ionicGesture.on('tap', function (e) {
	   $ionicLoading.show();
       $scope.multipleSelect.tempOptions = $scope.options.map(function(option){
         var tempOption = { };
         tempOption[$scope.multipleSelect.keyProperty] = option[$scope.multipleSelect.keyProperty];
         tempOption[$scope.multipleSelect.valueProperty] = option[$scope.multipleSelect.valueProperty];
         tempOption[$scope.multipleSelect.selectedProperty] = option[$scope.multipleSelect.selectedProperty];
     
         return tempOption;
       });
	   $ionicLoading.hide();
        $scope.OpenModalFromTemplate($scope.multipleSelect.templateUrl);
      }, $element);
      
      $scope.saveOptions = function(){
	    if($scope.multipleSelect.renderCheckbox){
			for(var i = 0; i < $scope.multipleSelect.tempOptions.length; i++){
			  var tempOption = $scope.multipleSelect.tempOptions[i];
			  for(var j = 0; j < $scope.options.length; j++){
				var option = $scope.options[j];
				if(tempOption[$scope.multipleSelect.keyProperty] == option[$scope.multipleSelect.keyProperty]){
				  option[$scope.multipleSelect.selectedProperty] = tempOption[$scope.multipleSelect.selectedProperty];
				  break;
				}
			  }
			}
		} else {
			// for radio button

			for(var i = 0; i < $scope.options.length; i++){
				var option = $scope.options[i];
				if(option[$scope.multipleSelect.keyProperty] == $scope.selected){
					  option[$scope.multipleSelect.selectedProperty] = true;
				} else{
					  option[$scope.multipleSelect.selectedProperty] = false;
				}
			}
		   
		}
        $scope.closeModal();
      };
	  
	  $scope.onSelectRadio = function(u){
		console.log("onSelectRadio called: "+u);
		$scope.selected = u;
	  }	
      
      $scope.closeModal = function () {
        $scope.modal.remove();
      };
      $scope.$on('$destroy', function () {
          if ($scope.modal){
              $scope.modal.remove();
          }
      });
    }
  };
}])

;

