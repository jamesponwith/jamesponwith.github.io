window.onload = () => {
  const navMenu = document.querySelector('.nav-menu');
  const navItems = document.querySelectorAll('.nav-item');
  const hamburger = document.querySelector('.nav-toggle');

  const toggle = e => e.classList.toggle('is-active');
  const toggleNav = ({ target }) => Array.from(navMenu.classList).includes('is-active') ? toggle(navMenu) : null;

  hamburger.addEventListener('click', () => toggle(navMenu, 'is-active'));
  Array.from(navItems).forEach(e => e.addEventListener('click', toggleNav));

  function (){

    "use strict";

    var wind = $(window);

    //smooth scroll
    $('.navbar-nav').singlePageNav({
        speed:1000,
        currentClass:'active',
        offset:60
    });


    // navbar scrolling background
    wind.on("scroll",function () {

        var bodyScroll = wind.scrollTop(),
            navbar = $(".navbar");

        if(bodyScroll > 300){

            navbar.show();

        }else{

            navbar.hide();
        }
    });

    //smooth button scroll
    $('.button-scroll').on('click', function(){

        var scrollTo = $(this).attr('data-scrollTo');

        $('body, html').animate({

        "scrollTop": $('#'+scrollTo).offset().top - 60
        }, 1000 );

    });

//
//     // progress bar
//     wind.on('scroll', function () {
//         $(".progress-main .progress-bar").each(function () {
//             var bottom_of_object =
//             $(this).offset().top + $(this).outerHeight();
//             var bottom_of_window =
//             $(window).scrollTop() + $(window).height();
//             var myVal = $(this).attr('data-value');
//             if(bottom_of_window > bottom_of_object) {
//                 $(this).css({
//                   width : myVal
//                 });
//             }
//         });
//     });
//
//
//     // magnificPopup
//     $('.v-middle').magnificPopup({
//       delegate: 'a',
//       type: 'image'
//     });
//
//
//     // counterUp
//     $('.counter').counterUp({
//         delay: 10,
//         time: 1500
//     });
//
//     // stellar
//     wind.stellar();
//
// });

}
