/*jshint esversion: 6 */
(function(){
	"use strict";
	//localStorage.clear();

	window.onload = (function(){
		const loader = document.querySelector(".loader");
    	loader.className += " hidden";

        document.getElementById("showTreeCreationForm").addEventListener('click', function(e){
			// hide image
			
		});

		api.onError(function(err){
            console.error("[error]", err);
        });
    
        api.onError(function(err){
            document.getElementById("lgn_error_box").innerHTML = `
                <p><strong>Warning! </strong> ` + err + `</p>
            `;

            $('#lgn_error_box').collapse({
                show: true
              })
		});
		
		api.onSeedUpdate(function(timelines){
			document.getElementById("seeds_section").innerHTML = `
			<div class="col-md-3">
				  <div class="img-thumbnail" id="showTreeCreationForm">
            		<a href=".multi-collapse" data-toggle="collapse" role="button" aria-expanded="false" aria-controls="createTreeForm seeds ">
              			<h1 class="text-center mb-5 mt-5 pt-5 pd-5">+</h1>
              			<p class="pt-5 text-center">Plant a new tree</p>
            		</a>
          		</div>
        	</div>
			`;
			timelines.forEach(function(timeline){
				let elmt = document.createElement('div');
				elmt.className= "seedContainer col-md-3";
				elmt.id = timeline._id;
				elmt.innerHTML = `
				<div class="thumbnail">
					<i class="fa fa-trash-o" id="delTimeline"></i>
					<a href=".tree-collapse" data-toggle="collapse" role="button" aria-expanded="false" aria-controls="selectedTree header seeds" target="_blank" role="button">
              			<img class="my-2 mx-auto d-block" src="/media/mysteryBox.png" alt="box" style="width:90%">
              			<div class="container">
                			<dl>
                  				<dt>` + timeline.title + `</dt>
                  				<dd>` + timeline.caption + `</dd>
                			</dl>
              			</div>
					</a>
				</div>
				`;
				elmt.addEventListener('click', function(e){
					api.setObservingSeed(timeline._id, function() {
						api.notifyTreeListeners();
					});
				});

				elmt.querySelector("#delTimeline").addEventListener('click', function(e){
					api.delTimeline(timeline._id);
				});
				document.getElementById("seeds_section").prepend(elmt);
			});
		});

		api.onTreeUpdate(function(capsules){
			// set tree title
			let treeTitle = "Add a Capsule to get started";
			if (capsules.length > 0) {
				api.getSeedTitle(capsules[0].tree, function(err, seed) {
					document.getElementById("treeViewTitle").innerHTML = `` + seed.title;
				});
			} else {
				document.getElementById("treeViewTitle").innerHTML = `` + treeTitle;
			}
			document.getElementById("capsuleIndicators").innerHTML = '';
			document.getElementById("capsuleList").innerHTML = '';
			let i = 0;
			// add capsules
			capsules.forEach(function(capsule) {
				// add capsule
				let indicator = document.createElement('li');
				indicator.setAttribute('data-target', "#capsuleCarousel");
				indicator.setAttribute('data-slide-to', "" + i);
				let elmt = document.createElement('div');
				elmt.className= "carousel-item";
				if (i <= 0) {
					elmt.className += " active";
					indicator.className += " active";
				}
				elmt.id = capsule._id;
				//let formattedDate = api.getFormattedDate(capsule.capsuleDate);
				elmt.innerHTML =`
					<div class="mx-auto d-block text-center">
						  <img src="/api/` + capsule._id + `/capsule/capsuleData" alt="timeCapsule" class="limit">
						  <div class="carousel-caption d-none d-md-block">
						  	<h2 class="my-2">` + capsule.capsuleDate + `</h2>
						  	<h3 class="my-1">` + capsule.text + `</h3>
						  </div>
            		</div>
				`;
				document.getElementById("capsuleIndicators").append(indicator);
				document.getElementById("capsuleList").append(elmt);
				i += 1;
			});
		});

		api.onUsernameUpdate(function(username){

			// If user is authenticated
			if (username) {
				// When a user succesfully logged in
				document.getElementById("welcomeUser").innerHTML = `Welcome ` + username;
				$('#dropdownLgn').hide();
				$('#signinDropdownBtn').hide();
				$('#signoutBtn').removeClass('d-none');
				$('.login-collapse').removeClass('d-none');
				$('.nonAuth').removeClass('d-block');
				$('.nonAuth').addClass('d-none');
				let observingUser = api.getObservingUser();
				// whichever page is being observed
				if (observingUser == "null") {
					observingUser = username;
				}
				setUserInfo(observingUser);
			} else {
				// while a user isn't logged in
				$('.nonAuth').removeClass('d-none');
				$('.nonAuth').addClass('d-block');
				$('.login-collapse').addClass('d-none');
				$('#signinDropdownBtn').collapse('show');
				$('#signoutBtn').addClass('d-none');
			}
		});

		function setUserInfo(username) {
			api.getUser(username, function(err, user) {
				let link = (user.picture) ? `/api/users/` + user._id + `/profile/` : `./media/defaultProfile.jpg`;
				document.getElementById("profileInfo").innerHTML = `
				<img src="`+ link + `" class="rounded-lg mr-2 mt-2" style="max-width:200px; max-height:200px">
				<div class="media-body">
				  <h1 class="px-2 text-capitalize">` + user._id + `</h1>
				  <div class="border-bottom m-2 border-dark"></div>
				  <div class="well">
					<p class="px-2">` + user.date + `</p>
				  </div>
				</div>
				`;

				document.getElementById("userProfileOptions").innerHTML = `
				<div class="p-1 mx-2 border-bottom border-dark" id="seedsTab" style="border-width:3px !important;">
            		My Seeds
          		</div>
				`;
				api.notifySeedListeners(username);
				api.notifyFollowerListeners(username);

				document.getElementById("followersTab").addEventListener('click', function(e) {
					$('#seeds').hide();
					$('#followers').show("d-block");
					$('#followersTab').addClass('bg-secondary');
					$('#seedsTab').removeClass('bg-secondary');
					api.notifyFollowerListeners(username);
				});

				document.getElementById("seedsTab").addEventListener('click', function(e) {
					$('#followers').hide();
					$('#seeds').show("d-block");
					$('#seedsTab').addClass('bg-secondary');
					$('#followersTab').removeClass('bg-secondary');
					api.notifySeedListeners(username);
				});
			});
		}

		document.getElementById("createSeed").addEventListener('click', function(e) {
			e.preventDefault();
			let title = document.getElementById("treeTitle").value;
			let caption = document.getElementById("treeCaption").value;
			let date = document.getElementById("datePlanted").value;
			api.addSeed(title, date, api.getObservingUser(), caption);
			document.getElementById("createSeed").reset();
		});


		document.getElementById("createCapsule").addEventListener('click', function(e) {
			e.preventDefault();
			let caption = document.getElementById("capsuleCap").value;
			let date = document.getElementById("dateCapsulePlanted").value;
			let picture = document.getElementById("capsulePicUpload").files[0];
			api.addCapsule(caption, date, picture, api.getObservingSeed());
			document.getElementById("createCapsule").reset();
		});
		
		document.getElementById("signin").addEventListener('click', function(e){
			e.preventDefault();
			let username = document.getElementById("dropdownLgnFormUsername").value;
			let password = document.getElementById("dropdownLgnFormPassword").value;
			let action = document.getElementById("signin").value = "signin";
			api[action](username, password, function(err){
				if (err) document.getElementById('lgn_error_box').innerHTML = err;
			});
		});

    });
} ())