var buildPost = function(data){
	var post = document.createElement('li');
	var imageContainer = document.createElement('div');
	var captionContainer = document.createElement('div');
	var imageElement = document.createElement('img');
	var commentForm = document.createElement('form');
	var imageIdField = document.createElement('input');
	var commentBody = document.createElement('input');
	var commentSubmit = document.createElement('input');
	var caption = data.caption.body;
	var imagePath = data.image.image_url;
	var imageId = data.image.id;
	post.setAttribute('class', 'post-container');
	imageContainer.setAttribute('class', 'image-container');
	captionContainer.setAttribute('class', 'caption-container');
	imageElement.setAttribute('src', imagePath);
	commentForm.setAttribute('action', '/new-comment');
	commentForm.setAttribute('method', 'POST');
	imageIdField.setAttribute('type', 'text');
	imageIdField.setAttribute('name', 'imageId');
	imageIdField.setAttribute('value', imageId);
	commentBody.setAttribute('type', 'text');
	commentBody.setAttribute('name', 'body');
	commentSubmit.setAttribute('type', 'submit');
	commentSubmit.setAttribute('value', 'Submit');
	imageContainer.innerHTML = imageElement.outerHTML;
	captionContainer.innerHTML = caption;
	commentForm.innerHTML = imageIdField.outerHTML + commentBody.outerHTML + commentSubmit.outerHTML;
	post.innerHTML = imageContainer.outerHTML + captionContainer.outerHTML + commentForm.outerHTML;
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