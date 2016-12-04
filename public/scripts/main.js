var buildPost = function(data){
	var post = document.createElement('li');
	var imageContainer = document.createElement('div');
	var captionContainer = document.createElement('div');
	var imageElement = document.createElement('img');
	var caption = data.caption;
	var imagePath = data.path;
	post.setAttribute('class', 'post-container');
	imageContainer.setAttribute('class', 'image-container');
	captionContainer.setAttribute('class', 'caption-container');
	imageElement.setAttribute('src', data.path);
	imageContainer.innerHTML = imageElement.outerHTML;
	captionContainer.innerHTML = data.caption;
	post.innerHTML = imageContainer.outerHTML + captionContainer.outerHTML;
	return post;
};

$('#image-upload-form').submit(function(e){
  var formData = new FormData($(this)[0]);
  $.ajax({
      type:'POST',
      url:'/image-upload',
      data : formData,                  
      contentType: false,
      processData: false
  }).done(function(data){
		if($(".no-clonestagrams")){
			$(".no-clonestagrams").remove();
		};
      $("#posts-container").prepend(buildPost(data));
  }).fail(function(data){
        console.log('Error');
    });
  e.preventDefault(); 
});

var loadPosts = function(){
	var postsContainer = document.createElement('ul');
	postsContainer.setAttribute('id', 'posts-container');
	$.get("/get-all", function(response){
		if(response.length === 0){
			postsContainer.innerHTML = "<p class='no-clonestagrams'>No Clonestagrams yet!</p>";
		}
		else{
			for(var i = (response.length - 1); i >= 0; i--){
				postsContainer.innerHTML += buildPost(response[i]).outerHTML;
			};
		};
	});
	return postsContainer;
};