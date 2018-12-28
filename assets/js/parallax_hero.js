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



  <style type="text/css">
	.parallaxParent {
		height: 100vh;
		overflow: hidden;
	}
	.parallaxParent > * {
		height: 200%;
		position: relative;
		top: -100%;
	}
</style>
<div class="spacer s0"></div>
<div id="parallax1" class="parallaxParent">
	<div style="background-image: url(assets/img/bg.jpg);"></div>
</div>
<div class="spacer s0"></div>
<div id="parallax2" class="parallaxParent">
	<div style="background-image: url(assets/img/bg.jpg);"></div>
</div>
<div class="spacer s0"></div>
<div id="parallax3" class="parallaxParent">
	<div style="background-image: url(assets/img/bg.jpg);"></div>
</div>
<div class="spacer s2"></div>
<script>
	// init controller
	var controller = new ScrollMagic.Controller({globalSceneOptions: {triggerHook: "onEnter", duration: "200%"}});

	// build scenes
	new ScrollMagic.Scene({triggerElement: "#parallax1"})
					.setTween("#parallax1 > div", {y: "80%", ease: Linear.easeNone})
					.addIndicators()
					.addTo(controller);

	new ScrollMagic.Scene({triggerElement: "#parallax2"})
					.setTween("#parallax2 > div", {y: "80%", ease: Linear.easeNone})
					.addIndicators()
					.addTo(controller);

	new ScrollMagic.Scene({triggerElement: "#parallax3"})
					.setTween("#parallax3 > div", {y: "80%", ease: Linear.easeNone})
					.addIndicators()
					.addTo(controller);
</script>
