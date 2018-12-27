var instance = M.Parallax.getInstance(elem);

 /* jQuery Method Calls
   You can still use the old jQuery plugin method calls.
   But you won't be able to access instance properties.

   $('.parallax').parallax('methodName');
   $('.parallax').parallax('methodName', paramName);
 */

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.parallax');
    var instances = M.Parallax.init(elems, options);
  });

  // Or with jQuery

  $(document).ready(function(){
    $('.parallax').parallax();
  });
