(function(){
    "use strict";
    
    window.addEventListener('load', function(){
        
        api.onError(function(err){
            console.error("[error]", err);
        });
    
        api.onError(function(err){
            document.getElementById("error_box").innerHTML = `
                <p><strong>Warning! </strong> ` + err + `</p>
            `;

            $('#error_box').collapse({
                show: true
              })
        });
        
        api.onUsernameUpdate(function(username){
            if (username) window.location.href = '/';
        });
        
        function submit(){
            let username = document.getElementById("username").value;
            let password = document.getElementById("password").value;
            let profile = document.getElementById("profileUpload").files[0];
            let action = document.getElementById("signup").value;
            api[action](username, password, profile, function(err){
                    if (err) {
                        document.querySelector('#error_box').innerHTML = err;
                    }
                    else {
                        api.setObservingUser(username, function() {});
                    }
            });
        }


        document.querySelector('#signup').addEventListener('click', function(e){
            e.preventDefault();
            document.getElementById("signup").value = "signup";
            submit();
        });

        document.getElementById("profileUpload").addEventListener('change', function(e){
            readURL(document.getElementById("profileUpload"));
            
        })
        
        function readURL(input) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();
    
                reader.onload = function (e) {
                    $('#tempPicDisplay')
                        .attr('src', e.target.result)
                        .width(60)
                        .height(60);
                };
    
                reader.readAsDataURL(input.files[0]);
            }
        }
    });
}())