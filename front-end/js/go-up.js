$(window).scroll(function(event){
  var scroll = $(window).scrollTop();
    if (scroll >= 50) {
      $(".go-top").addClass("show");
    } else {
      $(".go-top").removeClass("show");
    }
});

$('.go-top').click(function(e){
  e.preventDefault();
  $('html, body').animate({ scrollTop: 0 }, 500);
});