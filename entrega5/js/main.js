$(document).ready(function(){
    $.ajax({
        url: "https://my-json-server.typicode.com/samantatorrez/twitter/comments",
        dataType: 'json',
        type: 'get',
        cache:false,
        success: function(data){
            var event_data = '';
            $.each(data, function(index, value){
                event_data += '<li class="list-group-item d-flex align-items-center justify-content-between">';
                event_data += '<div class="commenterImage"><img id="imgUser" src="assets/img/'+value.img+'" /></div>';
                event_data += '<div class="commentText"><p>'+value.name+'</p>';
                event_data += '<p>'+value.body+'</p>';
                event_data += '<span class="date sub-text">'+ value.date+'</span></div>';
                event_data += '</li>';
            });
            $("#comentarios").append(event_data);
        },
        error: function(d){
            alert("404. Please wait until the File is Loaded.");
        }
    });
    $("#filtrar" ).click(function(){
        $("#collapsibleNavbar").toggle();
    });
});
