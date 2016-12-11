var buildPost = function(data){
	var post = document.createElement('li');
	var imageContainer = document.createElement('div');
	var captionContainer = document.createElement('div');
	var imageElement = document.createElement('img');
	var imageDelete = document.createElement('input'); // image delete button
	var commentForm = document.createElement('form');
	var imageIdField = document.createElement('input');
	var commentBody = document.createElement('input');
	var commentSubmit = document.createElement('input');
	var commentsList = document.createElement('ul');
	var caption = data.caption.body;
	var imagePath = data.image_url;
	var imageId = data.id;
	var commentsArray = data.comments;
	for (var i in commentsArray) {
		$(commentsList).append("<li>"+commentsArray[i].body+"</li>");
	};
	post.setAttribute('class', 'post-container');
	imageContainer.setAttribute('class', 'image-container');
	captionContainer.setAttribute('class', 'caption-container');
	imageElement.setAttribute('src', imagePath);
	commentForm.setAttribute('class', 'comment-form');
	imageIdField.setAttribute('type', 'text');
	imageIdField.setAttribute('name', 'imageId');
	imageIdField.setAttribute('value', imageId);
	commentBody.setAttribute('type', 'text');
	commentBody.setAttribute('name', 'body');
	commentBody.setAttribute('class', 'comment-body');
	commentSubmit.setAttribute('type', 'submit');
	commentSubmit.setAttribute('value', 'Submit');
	imageDelete.setAttribute('class', 'delete-image');
	imageDelete.setAttribute('action', '/delete-image'); // Delete Button for image
	imageDelete.setAttribute('type', 'submit'); // Delete Button for image
	imageDelete.setAttribute('value', 'Delete'); // Delete Button for image
	imageDelete.setAttribute('data-imageid', imageId); // Delete Button for image
	commentsList.setAttribute('class', 'comments-container');
	imageContainer.innerHTML = imageElement.outerHTML;
	captionContainer.innerHTML = caption;
	commentForm.innerHTML = imageIdField.outerHTML + commentBody.outerHTML + commentSubmit.outerHTML;
	post.innerHTML = imageDelete.outerHTML + imageContainer.outerHTML + captionContainer.outerHTML + commentForm.outerHTML + commentsList.outerHTML;
	return post;
};

$('#image-upload-form').submit(function(e){
	var inputFields = $(".input-field");
	var imageField = $("#file-to-upload");
	var captionField = $("#caption");
	var formData = new FormData($(this)[0]);
	var proceed = true;
	if($(imageField).val() == ""){
		var proceed = false;
		alert("No photo!");
	};
	if(captionField[0].value.length > 150){
		var proceed = false;
		alert("Caption is too long!");
	};
	if(proceed){
	  	$.ajax({
	      	type:'POST',
	      	url:'/image-upload',
	      	data : formData,                  
	      	contentType: false,
	      	processData: false
	  	}).done(function(data){
			if($(".no-pixis")){
				$(".no-pixis").remove();
			};
		    $("#posts-container").prepend(buildPost(data));
		    $(inputFields).val("");
		}).fail(function(data){
		    alert('Upload failed. Sorry! There seems to have been an error, please try again.');
		});
	};
	e.preventDefault(); 
});

var loadPosts = function(){
	var postsContainer = document.createElement('ul');
	postsContainer.setAttribute('id', 'posts-container');
	$.get("/get-all", function(response){
		if(response.length === 0){
			postsContainer.innerHTML = "<p class='no-pixis'>Post your first Pixi!</p>";
		}
		else{
			for(var i = (response.length - 1); i >= 0; i--){
				postsContainer.innerHTML += buildPost(response[i]).outerHTML;
			};
		};
	});
	return postsContainer;
};

$(document).on("submit", ".comment-form", function(e){
	var container = $(this).next();
	var commentBodyInput = $(this).find(".comment-body");
	$.ajax({
      	type:'POST',
      	url:'/new-comment',
      	data: $(this).serialize()
  	}).done(function(data){
  		$(commentBodyInput).val("");
  		$(container).prepend("<li>" + data.body + "</li>");
	}).fail(function(data){
	    alert('Comment failed. Sorry! There seems to have been an error, please try again.');
	});
	e.preventDefault();
});

$(document).on("click", ".delete-image", function() {
	var imageId = $(this).data("imageid");
	$.post("/delete-image", {imageId: imageId}, function(response) {
		console.log(response);
	});
});