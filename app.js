
function htmlElement(str) {
  this.rawHTML = str;

  //analysis
  var open = false;
  var currName = "";
  var opened = [];
  var closeTag = false;
  var readingChildNode = false;
  var currChildNode = "";
  var readingValue = false;
  var currValue = "";

  this.childNodes = [];

  var splitted = this.rawHTML.split("");
  for(var i = 0; i < splitted.length; i++) {
    if(readingChildNode) {
      currChildNode += splitted[i];
    }
    if(readingValue) {
      currValue += splitted[i];
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
          readingValue = true;
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
        if(readingValue) {
          currValue += splitted[i];
        }
      }
      open = true;
    }
  }

  var currValueSplitted = currValue.split("");
  var valuePos = this.type.split("").length + 3
  var start = currValueSplitted.length - valuePos;
  for(var i = start; i < start + valuePos; i++) {
    currValueSplitted.splice(start);
  }
  this.value = currValueSplitted.join("");


}


module.exports = {
  htmlElement: htmlElement
};

//debugging

var test = new htmlElement("<html><head></head><body>hallo!</body><div><a>HEI!</a></div></html>");
console.log(test);
