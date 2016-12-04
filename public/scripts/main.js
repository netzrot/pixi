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
      $("#posts-container").prepend(buildPost(data));
  }).fail(function(data){
        console.log('Error');
    });
  e.preventDefault(); 
});