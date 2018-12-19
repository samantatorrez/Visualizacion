$(document).ready(function(){
    $.ajax({
        url: "https://my-json-server.typicode.com/samantatorrez/twitter/comments",
        dataType: 'json',
        type: 'get',
        cache:false,
        success: function(data){
            var event_data = '<div class="pagination-container" ><div data-page="1" >';
            var cont = 2;
            $.each(data, function(index, value){
              if (index%4 < 3) {
                event_data += '<div class="list-group-item align-items-center justify-content-between">';
                event_data += '<div class="commenterImage"><img id="imgUser" src="assets/img/'+value.img+'" />';
                event_data += '<span class="date name">'+value.name+'</span><span class="date sub-text">'+ value.date+'</span></div>';
                event_data += '<div class="commentText"<p>'+value.body+'</p></div>';
                event_data += '<div class="like-container"><div class="like" onclick="hide(this)"><img  src="assets/img/heart.png"/><span>'+value.likes+'</span></div></div>';
                event_data += '</div>';
              }
              else {
                event_data += '</div><div data-page="'+cont+'" style="display:none;" >';
                cont++;
              }
            });
            event_data += `</div>
              <nav aria-label="Page navigation example">
                <ul class="pagination pt-5">
                  <li class="page-item" data-page="-" >
                    <a href="#" class="page-link" >Previous</a>
                  </li>
                  <li class="page-item" data-page="+">
                    <a href="#" class="page-link" >Next</a>
                  </li>
                </ul>
              </div>
            </nav>`;
            $("#comentarios").append(event_data);
            paginationHandler();
        },
        error: function(d){
            alert("404. Please wait until the File is Loaded.");
        }
    });
    $("#filtrar" ).click(function(){
        $("#collapsibleNavbar").toggle();
    });

    $('#carousel1').carousel({
      interval: 1500
    })

    $('#carousel2').carousel({
      interval: 2500
    })

    $('#carousel3').carousel({
      interval: 2500
    })

    var paginationHandler = function(){
      var $paginationContainer = $(".pagination-container"),
          $pagination = $paginationContainer.find('ul.pagination');
      $pagination.find("li a").on('click.pageChange',function(e){
        e.preventDefault();
        var parentLiPage = $(this).parent('li').data("page"),
        currentPage = parseInt( $(".pagination-container div[data-page]:visible").data('page') ),
        numPages = $paginationContainer.find("div[data-page]").length;

        if ( parseInt(parentLiPage) !== parseInt(currentPage) ) {
          $paginationContainer.find("div[data-page]:visible").hide();
        }
        if ( parentLiPage === '+' ) {// next page
          $paginationContainer.find("div[data-page="+( currentPage+1>numPages ? numPages : currentPage+1 )+"]").show();
        } else if ( parentLiPage === '-' ) {// previous page
          $paginationContainer.find("div[data-page="+( currentPage-1<1 ? 1 : currentPage-1 )+"]").show();
        } 
      });
  };

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
      });

    $("#bannerPago").on({
        mouseenter: function () {
            $("#confetiBanner").toggleClass("hovered");
        },
        mouseleave: function () {
            //stuff to do on mouse leave
        }
    });
    
});
function hide(e) {
  e.className += " disabled";
  var counter = 0;
  counter= e.getElementsByTagName("span")[0].innerHTML;
  e.getElementsByTagName("span")[0].innerHTML= parseInt(counter,10) +1;
}
