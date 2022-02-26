$(document).ready(function() {
    // Handler for .load() called.
//   });
// $(function() {

    console.log('ready');
    // var storedHTMLBody = $('body').html();
    // $('body').html('');

    var token = getUrlParameter('welcome');
    var email = getUrlParameter('email');
    if(token && email){

        const tokenCookie = getCookie('token');
        if(tokenCookie){
            // cookie exists.
            $('.overlay').hide();

        }else{
            // cookie doesnt exist. Use graphql query to authenticate user.
            $.ajax({url: "https://endeavourkeystone.onrender.com/api/graphql",
                  contentType: "application/json",type:'POST',
                  data: JSON.stringify({ query:`mutation{
                     redeemUserMagicAuthToken(
                         email:"${email}" 
                         token:"${token}"
                    ){
                        ... on RedeemUserMagicAuthTokenSuccess {
                            token
                            item {
                                email
                            }
                        }
                            ... on RedeemUserMagicAuthTokenFailure{
                                message
                        }
                    }}`
                  }),
                  success: function(result) {
                     console.log(JSON.stringify(result))

                        if(result.data.redeemUserMagicAuthToken.message == "Auth tokens are single use and the auth token provided has already been redeemed."){
                            console.log('already redeemed');
                            requestNewCode(
                                result.data.redeemUserMagicAuthToken.message
                            );
                        }else if (result.data.redeemUserMagicAuthToken.message == "Auth token redemption failed."){
                            console.log('new token has been generated');
                            requestNewCode(
                                result.data.redeemUserMagicAuthToken.message
                            );
                        }


                        if(result.data.redeemUserMagicAuthToken.token != null){
                            // set cookie
                            // enable website
                            setCookie('token', result.data.redeemUserMagicAuthToken.token, 30);
                            $('.overlay').hide();
                        }
                  },
                  error: function(result) {
                        console.log(JSON.stringify(result))
                    }
               });
        }
        // check if user is authenticated

        
    }else {

        // check if user is already authenticated.
        const tokenCookie = getCookie('token');
        if(tokenCookie){
            // cookie exists.
            // $('body').html(storedHTMLBody);
            $('.overlay').hide();
        }else{
            
            requestNewUser();

        }
    }
});


function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};


function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
  
function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}
  
function requestNewCode(message) {
    var txt;
    if ( confirm(message + "\n\nWould you like to request a new code?") ) {
     
        const email = getUrlParameter('email');
        $.ajax({url: "https://endeavourkeystone.onrender.com/api/graphql",
            contentType: "application/json",type:'POST',
            data: JSON.stringify({ query:`mutation {
            sendUserMagicAuthLink(email:"${email}")  
            }`
            }),
            success: function(result) {
                console.log(JSON.stringify(result))  
                
            },
            error: function(result) {
                alert("Something went wrong. Please try again later.");
            }
        });
       
    } else {
        // Remove all HTML Body
        // document.body.innerHTML = "";
    }
  }

  function requestNewUser() {
    function makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*^%#@@$!@';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * 
     charactersLength));
       }
       return result;
    }
    let prpt = prompt("You have no premissions to view this page. Please provide your email address to get an invitation.", "");
     if(prpt != null){
         console.log("email: " + prpt);
        $.ajax({url: "https://endeavourkeystone.onrender.com/api/graphql",
        contentType: "application/json",type:'POST',
        data: JSON.stringify({ query:`mutation {
        createUser(
            data: { 
                email:"${prpt}"
                password:"${makeid(10)}"
                name: "Anonymous"
                isAdmin: false
            }
        ){
            email
            name
         }  
        }`
        }),
        success: function(result) {
            console.log(JSON.stringify(result))
            
        },
        error: function(result) {
            alert("Something went wrong. Please try again later.");
        }
    });
     }
        

        
  }