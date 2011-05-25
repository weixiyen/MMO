/*
    takes text and replaces links with URL link
--------------------------------------------------*/
function linkReplace(text) {
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(exp,"<a href='$1' target='_blank'>$1</a>"); 
}

exports.linkReplace = linkReplace;