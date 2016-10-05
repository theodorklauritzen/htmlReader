
function htmlElement(str) {
  this.rawHTML = str;

  //analysis
  var open = false;
  var currName = "";
  var opened = [];
  var closeTag = false;
  var readingChildNode = false;
  var currChildNode = "";

  this.childNodes = [];

  var splitted = this.rawHTML.split("");
  for(var i = 0; i < splitted.length; i++) {
    if(readingChildNode) {
      currChildNode += splitted[i];
    }
    if(splitted[i] === ">") {
      open = false;
      if(closeTag) {
        for(var j = opened.length - 1; j >= 0; j--) {
          if(currName === opened[j]) {

            //READING
            if(opened.length === 2) {
              this.childNodes.push(new htmlElement("<" + currName + ">" + currChildNode));
              currChildNode = "";
              readingChildNode = false;
            }

            opened.splice(j, 1);
            j = -1;
          } else {
            opened.splice(j, 1);
          }
        }
        //opened.push(currName);
        closeTag = false;
      } else {
        opened.push(currName);
        if(opened.length === 1) {
          this.type = opened[0];
        } else if(opened.length === 2) {
          readingChildNode = true;
        }
      }
      currName = "";
    }
    if(open) {
      currName += splitted[i];
    }
    if(splitted[i] === "<") {
      if(splitted[i + 1] === "/") {
        closeTag = true;
        i++;
        if(readingChildNode) {
          currChildNode += splitted[i];
        }
      }
      open = true;
    }
  }


}


module.exports = {
  htmlElement: htmlElement
};

//debugging

var test = new htmlElement("<html><head></head><body>hallo!</body><div><a>HEI!</a></div></html>");
console.log(test);
