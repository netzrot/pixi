var buildPost = function(data, currentUser){
	var post = document.createElement('li');
	var imageContainer = document.createElement('div');
	var captionContainer = document.createElement('div');
	var captionText = document.createElement('div');
	var imageElement = document.createElement('img');
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
	captionContainer.setAttribute('data-captionid', data.caption.id);
	captionText.setAttribute('class', 'caption-text');
	imageElement.setAttribute('src', imagePath);
	commentForm.setAttribute('class', 'comment-form');
	imageIdField.setAttribute('type', 'hidden');
	imageIdField.setAttribute('name', 'imageId');
	imageIdField.setAttribute('value', imageId);
	commentBody.setAttribute('type', 'text');
	commentBody.setAttribute('name', 'body');
	commentBody.setAttribute('class', 'comment-body');
	commentSubmit.setAttribute('type', 'submit');
	commentSubmit.setAttribute('value', 'Submit');
	commentSubmit.setAttribute('class', 'comment-submit');
	commentsList.setAttribute('class', 'comments-container');
	imageContainer.innerHTML = imageElement.outerHTML;
	captionText.innerHTML = caption;
	captionContainer.innerHTML = captionText.outerHTML;

	if(currentUser == data.userId){
		var imageDelete = document.createElement('button');
		imageDelete.setAttribute('class', 'delete-image');
		imageDelete.innerHTML = 'Delete Pixi';
		imageDelete.setAttribute('data-imageid', imageId);
		imageContainer.innerHTML += imageDelete.outerHTML;

		var editButton = document.createElement('button');
		editButton.setAttribute('class', 'edit-caption')
		editButton.innerHTML = "Edit Caption";
		captionContainer.innerHTML += editButton.outerHTML;
	};

	commentForm.innerHTML = imageIdField.outerHTML + commentBody.outerHTML + commentSubmit.outerHTML;
	post.innerHTML = imageContainer.outerHTML + captionContainer.outerHTML + commentForm.outerHTML + commentsList.outerHTML;
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
	  	}).done(function(response){
	  		console.log(response)
			if($(".no-pixis")){
				$(".no-pixis").remove();
			};
		    $("#posts-container").prepend(buildPost(response.pixi, response.currentUser));
		    $(inputFields).val("");
		}).fail(function(response){
		    alert('Upload failed. Sorry! There seems to have been an error, please try again.');
		});
	};
	e.preventDefault(); 
});

var loadPosts = function(){
	var postsContainer = document.createElement('ul');
	postsContainer.setAttribute('id', 'posts-container');
	$.get("/get-all", function(response){
		if(response.pixis.length === 0){
			postsContainer.innerHTML = "<p class='no-pixis'>Post your first Pixi!</p>";
		}
		else{
			for(var i = (response.pixis.length - 1); i >= 0; i--){
				postsContainer.innerHTML += buildPost(response.pixis[i], response.currentUser).outerHTML;
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

$(document).on("click", ".delete-image", function(){
	var imageId = $(this).data("imageid");
	var postContainer = $(this).parents("li");
	$.ajax({
      	type:'DELETE',
      	url:'/delete-image',
      	data: {imageId: imageId}
  	}).done(function(){
  		postContainer.remove();
	}).fail(function(){
	    alert('Delete failed. Sorry! There seems to have been an error, please try again.');
	});
});

$(document).on("click", ".edit-caption", function(){
	var originalCaption = $(this).prev().html();
	var captionId = $(this).parent().data("captionid");
	var editCaptionForm = document.createElement("form");
	var editCaptionId = document.createElement("input");
	var editCaptionText = document.createElement("input");
	var editCaptionSubmit = document.createElement("input");
	editCaptionForm.setAttribute('class', 'edit-caption-form');
	editCaptionId.setAttribute('type', 'hidden');
	editCaptionId.setAttribute('value', captionId);
	editCaptionId.setAttribute('name', 'captionId');
	editCaptionText.setAttribute('type', 'text');
	editCaptionText.setAttribute('value', originalCaption);
	editCaptionText.setAttribute('name', 'caption');
	editCaptionSubmit.setAttribute('type', 'submit');
	editCaptionSubmit.setAttribute('value', 'Submit');
	editCaptionForm.innerHTML = editCaptionId.outerHTML + editCaptionText.outerHTML + editCaptionSubmit.outerHTML;
	$(this).prev().replaceWith(editCaptionForm);
	$(this).remove();
});

$(document).on("submit", ".edit-caption-form", function(e){
	var editCaptionForm = this;
	$.ajax({
      	type:'PATCH',
      	url:'/edit-caption',
      	data: $(this).serialize()
  	}).done(function(data){
  		var captionText = document.createElement('div');
		captionText.setAttribute('class', 'caption-text');
		captionText.innerHTML = data.editedCaption;

		var editButton = document.createElement('button');
		editButton.setAttribute('class', 'edit-caption')
		editButton.innerHTML = "Edit";
		
  		$(editCaptionForm).replaceWith(captionText.outerHTML + editButton.outerHTML);
	}).fail(function(data){
	    alert('Edit failed. Sorry! There seems to have been an error, please try again.');
	});
	e.preventDefault();
});