/* string functions utility */

/* TODO:  Add Strbuff functionality here */





/* Custom trim from the Web */
/* TODO:  Test these to see which one works the best */
function trim(text){
    text = text.replace(/^\s+/, "");
    for (var i = text.length - 1; i >= 0; i--) {
        if (/\S/.test(text.charAt(i))) {
            text = text.substring(0, i + 1);
            break;
        }
    }
    return text;
}


function trim10 (str) {
  var whitespace = ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
  for (var i = 0; i < str.length; i++) {
    if (whitespace.indexOf(str.charAt(i)) === -1) {
      str = str.substring(i);
      break;
    }
  }
  for (i = str.length - 1; i >= 0; i--) {
    if (whitespace.indexOf(str.charAt(i)) === -1) {
      str = str.substring(0, i + 1);
      break;
    }
  }
  return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
}


function trim27(str) {
    var c;
    for (var i = 0; i < str.length; i++) {
        c = str.charCodeAt(i);
        if (c == 32 || c == 10 || c == 13 || c == 9 || c == 12) continue; else break;
    }
    for (var j = str.length - 1; j >= i; j--) {
        c = str.charCodeAt(j);
        if (c == 32 || c == 10 || c == 13 || c == 9 || c == 12) continue; else break;
    }
    return str.substring(i, j + 1);
}

function trim1 (str) {
var c;
for (var i = 0; i < str.length; i++) {
c = str.charCodeAt(i);
if (c == 32 || c == 10 || c == 13 || c == 9 || c == 12 || c == 11 || c == 160 || c == 5760 || c == 6158 || c == 8192 || c == 8193 || c == 8194 || c == 8195 || c == 8196 || c == 8197 || c == 8198 || c == 8199 || c == 8200 || c == 8201 || c == 8202 || c == 8232 || c == 8233 || c == 8239 || c == 8287 || c == 12288 || c == 65279)
continue; else break;
}
for (var j = str.length – 1; j >= i; j–) {
c = str.charCodeAt(j);
if (c == 32 || c == 10 || c == 13 || c == 9 || c == 12 || c == 11 || c == 160 || c == 5760 || c == 6158 || c == 8192 || c == 8193 || c == 8194 || c == 8195 || c == 8196 || c == 8197 || c == 8198 || c == 8199 || c == 8200 || c == 8201 || c == 8202 || c == 8232 || c == 8233 || c == 8239 || c == 8287 || c == 12288 || c == 65279)
continue; else break;
}
return str.substring(i, j + 1);
}




/* This version claims to be quite fast */ 
String.whiteSpace = [];
String.whiteSpace[0x0009] = true;
String.whiteSpace[0x000a] = true;
String.whiteSpace[0x000b] = true;
String.whiteSpace[0x000c] = true;
String.whiteSpace[0x000d] = true;
String.whiteSpace[0x0020] = true;
String.whiteSpace[0x0085] = true;
String.whiteSpace[0x00a0] = true;
String.whiteSpace[0x1680] = true;
String.whiteSpace[0x180e] = true;
String.whiteSpace[0x2000] = true;
String.whiteSpace[0x2001] = true;
String.whiteSpace[0x2002] = true;
String.whiteSpace[0x2003] = true;
String.whiteSpace[0x2004] = true;
String.whiteSpace[0x2005] = true;
String.whiteSpace[0x2006] = true;
String.whiteSpace[0x2007] = true;
String.whiteSpace[0x2008] = true;
String.whiteSpace[0x2009] = true;
String.whiteSpace[0x200a] = true;
String.whiteSpace[0x200b] = true;
String.whiteSpace[0x2028] = true;
String.whiteSpace[0x2029] = true;
String.whiteSpace[0x202f] = true;
String.whiteSpace[0x205f] = true;
String.whiteSpace[0x3000] = true;

/*
* Trim spaces from a string on the left and right.
*/

trim13 = function(str)
{
var n = str.length;
var s;
var i;

if (!n)
return str;
s = String.whiteSpace;
if (n && s[str.charCodeAt(n-1)])
{
do
{
–n;
}
while (n && s[str.charCodeAt(n-1)]);
if (n && s[str.charCodeAt(0)])
{
i = 1;
while (i < n && s[str.charCodeAt(i)])
++i;
}
return str.substring(i, n);
}
if (n && s[str.charCodeAt(0)])
{
i = 1;
while (i < n && s[str.charAt(i)])
++i;
return str.substring(i, n);
}
return str;
};

function fastTrim(str){
var len = str.length;
if (len){
var whiteSpace = String.whiteSpace;
while (whiteSpace[str.charCodeAt(--len)]);
if (++len){
var i = 0;
while (whiteSpace[str.charCodeAt(i)]){ ++i; }
}
str = str.substring(i, len);
}
return str;
}
