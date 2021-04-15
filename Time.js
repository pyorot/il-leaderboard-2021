// == IL sheet functions ==

const regex = /^(?!0)(?:(?:(\d?\d)\:(?=\d\d))?([0-5]?\d)\:(?=\d\d))?([0-5]?\d)(?:\.(\d\d?|xx))?$/
// regex explanation at bottom of this page

function parseTime(input, reversed) {
  // run regex, validate and convert values
  let matches = input.match(regex) // returns null or [fullMatch, hrs, mins, secs, centisecs]
  if      (!matches)               {return null}
  else if (!matches[4])            { if (ALLOW0DP) {matches[4] = reversed ? '00' : '99'} else {return null} }
  else if (matches[4] == 'xx')     { if (ALLOWXX)  {matches[4] = reversed ? '00' : '99'} else {return null} }
  else if (matches[4].length == 1) { if (ALLOW1DP) {matches[4] += '0'}                   else {return null} }
  // return result in seconds
  for (let i=1; i<matches.length; i++) { matches[i] = matches[i] ? parseInt(matches[i]) : 0 }
  return parseInt(matches[1]*60*60 + matches[2]*60 + matches[3]) + matches[4]/100
}

// == segment sheet functions ==

function isTimeString(str) {
  var regex = /^(\d+:)?(\d{2}:)?(\d(\d)?)(\.\d(\d)?)$/;
  return regex.exec(str) != null
}

function timeStringToSeconds(input) {
  if (input.map) {                 // if input is array (look for map method) then call recursively on elts
    var arrayLength = input.length;
    var output = input;
    for (var i = 0; i < arrayLength; i++) {
      output[i] = timeStringToSeconds(input[i]);
    }
    return output;
  }
  else {                           // if input is time string, do base-60 expansion into seconds float
    var nums = input.split(":");
    if (nums.length == 3) {
      output = (parseInt(nums[0]) * 3600 + parseInt(nums[1]) * 60 + parseFloat(nums[2])).toFixed(2);
    }
    else if (nums.length == 2) {
      output = (parseInt(nums[0]) * 60 + parseFloat(nums[1])).toFixed(2);
    }
    else output = parseFloat(input).toFixed(2);
    return parseFloat(output);
  }
}

// == legacy functions ==

function isValidILTime(str) {
  var regex = /^\d\d?(:\d\d)?\.\d\d?$/;
  return regex.exec(str) != null
}

function timeInCentiseconds(str){
  centiseconds = 0;
  var tmp1 = str.split(":");
  var tmp2 = []
  if(tmp1.length === 2){
    centiseconds += parseInt(tmp1[0])*60*100;
    tmp2 = tmp1[1].split(".");
  }
  else{
    tmp2 = tmp1[0].split(".");
  }
  if(tmp2.length === 2){
    centiseconds += parseInt(tmp2[0])*100;
    if(tmp2[1].length === 1){
      centiseconds += parseInt(tmp2[1])*10;
    }
    else{
      centiseconds += parseInt(tmp2[1]);
    }
  }  
  return centiseconds;
}

// == regex explanation ==
/*
(?!0)				  // no leading zero
(?:
	(?:
		(\d?\d)		// hours digits
		:(?=\d\d)	// : only if two digits follow
	)?
	([0-5]?\d)	// mins digits
	:(?=\d\d)		// : only if two digits follow
)?
([0-5]?\d)		// secs digits
(?:
	.				    // .
 	(\d\d?|xx)	// centisecs or xx
)?
*/
