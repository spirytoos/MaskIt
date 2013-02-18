/*

MaskIt v1.0

jQuery Input masking plugin.
http://spirytoos.blogspot.com

Copyright (c) 2013 Tomasz Egiert

http://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt

Project site: http://razorjack.net/quicksand
Github site: http://github.com/razorjack/quicksand

 */
(function($)
{

  $.fn.maskFields=function(pattern,options)
	{
		/* in here before we start we grab pattern as provided by user and generate array of regular expressions
		which we can use later to compare one by one with what user types in. Later on each key press we will check
		position of caret in a field and then knowing this position we will use it as index for this array of regular expressions
		and will compare to see if whatever user typed in is allowed or not. 
		we can also add whatever options user wants to pass to our plugin */
		
		var settings= $.extend({
		
			"placeholderChar" : "_",
			"alwaysDisplayPlaceholder" : false
		}, options);
							
		// keep track from which character letters are not compulsory so in a pattern "(dd) dddd ?dddd a"
		// anything following ? will be optional
		
		var optionalFrom=(pattern.indexOf("?")==-1 ? pattern.length : pattern.indexOf("?"));
		
		// contains array of reg.exes
		settings.pattern=translatePattern(pattern);
		
			
		// that is array where all typed in characters will be stored
		var typedIn=[];
		
		// and here is the placeholder generated from pattern user provided. We can use it later to fill in the
		// field when necessary and on top of it fill in what user already typed in
		var placeholder=generatePlaceholder(pattern);
		
		// this is used to keep track of how many characters are actually typed in. Its used in onblur when
		// alwaysDisplayPattern is false and required characters are provided but optional might not be
		// then we have to display as many as provided but we dont need to display any optional separators if there are any
		
		var typedInTotal=0;
		
		// this is to keep track of start/end of selection if anything is selected (highlighted) in input field. Knowing this
		// we can delete whole set of selected characters  when backspace/delete pressed
		
		var selectedStart=null;
		var	selectedEnd=null;
		
		function translatePattern(pattern)
		{
			// function translates pattern user provided e.g. "(dd) dddd dddd a" into array of regular expressions
			// this array represents single characters allowed in a field. Later we will be simply comparing what
			// user types in in caret position with corresponding index content of this array 
			
			// we need to remove "optional" symbol as we dont want it to be diplsyed in a field
			
			pattern=pattern.replace("?","");
		
			var p=pattern.split("");
			
			for(i=0;i<p.length;i++)
			{								
				switch(p[i])
				{
					case "*":
						p[i]="[a-zA-Z1-9]";
						break;
					case "d":
						p[i]="[1-9]";
						break;
					case "a":
						p[i]="[a-z]";
						break;
					default:
					{
						// if not default like d or a then check if anything additional been defined
						
						var found=false;
						
						for(var prop in settings.specialChars)
						{
							if(p[i]==prop)
							{
								// if defined special character then use it
								p[i]=settings.specialChars[prop];
								found=true;
								break;
							}
						}
						
						// otherwise its meaningless separator only
						if(!found) p[i]="sEpArAtOr";
					}
				}
				
			}
			
			return p;
		}
		
		function generatePlaceholder(pattern)
		{							
			// we need to remove "optional" symbol as we dont want it to be diplsyed in a field
			
			pattern=pattern.replace("?","");
		
			// this function generates placeholder to display in input field so replaces places where user can input characters with 
			// underscore or whatever else user specifies to be used as placeholder
			
			var p=pattern.split("");
			
			for(i=0;i<p.length;i++)
			{
				switch(p[i])
				{
					case "?": // we need to remove "optional" symbol as we dont want it to be diplsyed in a field
						break;
					case "*":
						p[i]=settings.placeholderChar;
						break;
					case "d":
						p[i]=settings.placeholderChar;
						break;
					case "a":
						p[i]=settings.placeholderChar;
						break;
					default:
					{
						// if not default like d or a then check if anything additional been defined
						
						for(var prop in settings.specialChars)
						{
							if(p[i]==prop)
							{
								// if defined special character then use it
								p[i]=settings.placeholderChar;
								break;
							}
						}
					}
				}
			}
			
			return p.join("");
		}
		
		function doGetCaretPosition (oField) {

		  // Initialize
		  var iCaretPos = 0;

		  // IE Support
		  if (document.selection) {

			// Set focus on the element
			oField.focus ();

			// To get cursor position, get empty selection range
			var oSel = document.selection.createRange ();

			// Move selection start to 0 position
			oSel.moveStart ('character', -oField.value.length);

			// The caret position is selection length
			iCaretPos = oSel.text.length;
		  }

		  // Firefox support
		  else if (oField.selectionStart || oField.selectionStart == '0')
			iCaretPos = oField.selectionStart;

		  // Return results
		  return (iCaretPos);
		}

		
		function setMasking(i,c,pos)
		{
			//  initially display empty placeholder only as nothing is typed in
			
			if(c==undefined)
			{
				$(i).val(generatePlaceholder(pattern));
				return;
			}
			else
			{
				var currentValue=$(i).val();
				
				currentValue=currentValue.split("");
				
				currentValue[pos]=c;
				
				currentValue=currentValue.join("");
				
				$(i).val(currentValue);
			}
		}
	
		function showSelection(el) {
		
			var start = 0, end = 0, normalizedValue, range,
				textInputRange, len, endRange;

			if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
				start = el.selectionStart;
				end = el.selectionEnd;
			} else {
				range = document.selection.createRange();

				if (range && range.parentElement() == el) {
					len = el.value.length;
					normalizedValue = el.value.replace(/\r\n/g, "\n");

					// Create a working TextRange that lives only in the input
					textInputRange = el.createTextRange();
					textInputRange.moveToBookmark(range.getBookmark());

					// Check if the start and end of the selection are at the very end
					// of the input, since moveStart/moveEnd doesn't return what we want
					// in those cases
					endRange = el.createTextRange();
					endRange.collapse(false);

					if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
						start = end = len;
					} else {
						start = -textInputRange.moveStart("character", -len);
						start += normalizedValue.slice(0, start).split("\n").length - 1;

						if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
							end = len;
						} else {
							end = -textInputRange.moveEnd("character", -len);
							end += normalizedValue.slice(0, end).split("\n").length - 1;
						}
					}
				}
			}
			
			selectionStart=start;
			selectionEnd=end;							
			
			console.log("start:"+selectionStart);
			console.log("end:"+selectionEnd);
			
			// check if user actually selected text or only clicked in which case there will be no selection
			if(start==end) selectionStart=null;
			
		}

		function setCaretPosition(t,pos)
		{
			if(t.setSelectionRange)
				t.setSelectionRange(pos,pos);
			else if(t.createTextRange)
			{
				tr = t.createTextRange();
				tr.collapse(true);
				tr.moveEnd('character', pos);
				tr.moveStart('character', pos);
				tr.select();
			}
		}

		
		function moveCaretToEditablePosition(caretPosition)
		{
			// function checks if where the caret is located characters can be entered. Otherwise it will move the caret to 
			// nearest editable location to the right. If there is not space to the right then caret will stay 
			// in non editable location. This is as user can click on field and locate caret on placeholder somewhere where nthing
			// can be typed in.
			
			var jumpBy=0;
			
			for(i=caretPosition;i<settings.pattern.length;i++)
			{			
				var separator=new RegExp("sEpArAtOr");
		
				if(separator.test(settings.pattern[caretPosition+jumpBy]))
					jumpBy++;
				else
					break;
			}
			
			return caretPosition+jumpBy>=settings.pattern.length ? 0 : jumpBy;
		}
		
	
		function skipToTheRight(caretPosition)
		{
			// check if next character is separator or we are past the end of field length. We loop here
			// as in some cases user might want multiple separators, not sure why anyone would want it but
			// you never know
			
			var jumpBy=1;
			
			for(i=caretPosition;i<settings.pattern.length;i++)
			{			
				var separator=new RegExp("sEpArAtOr");
		
				if(separator.test(settings.pattern[caretPosition+jumpBy]))
					jumpBy++;
				else
					break;
			}
			
			return caretPosition+jumpBy>=settings.pattern.length ? 0 : jumpBy;
		}

		function skipToTheLeft(caretPosition)
		{
			// check if previous character is separator or we are past the beginning of field length. We loop here
			// as in some cases user might want multiple separators, not sure why anyone would want it but
			// you never know
			
			var jumpBy=1;
			
			for(i=caretPosition;i>0;i--)
			{			
				var separator=new RegExp("sEpArAtOr");
		
				if(separator.test(settings.pattern[caretPosition-jumpBy]))
					jumpBy++;
				else
					break;
			}
			
			/* when return also make sure jumpBy will not move cursor before the beginnig of the field. This would happen
			if in front of caret to the left side are only placeholders so nothing can be entered.
			it means if we have pattern such as "(dd) __" having cursor in first "d" after pressing left
			arrow should move cursor to the beginning so first bracket */
			
			return caretPosition-jumpBy<0 ? 0 : jumpBy;
		}

		function updateField(i,characterTyped,pos)
		{
			/* function updates array where all typed in characters are stored and displays updated mask */
			
			typedIn[pos]=characterTyped;
			
			var tempPlaceholder=placeholder.split("");
			
			// loop over whatever is typed in and generate placeholder with typed in content so it can be diaplyed in a field
			
			for(a=0;a<typedIn.length;a++)
			{
				if(typedIn[a]!=undefined)
					tempPlaceholder[a]=typedIn[a];
			}
			
			// fill in the field with placeholder and data already typed in
			
			$(i).val(tempPlaceholder.join(""));
		}
		
		function displayContent_NOTUSED(i)
		{
			/* displays typed in content only, without placeholder */
			
			var tempPlaceholder=placeholder.split("");
			
			// loop over whatever is typed in and generate placeholder with typed in content so it can be diaplyed in a field
			
			for(a=0;a<tempPlaceholder.length;a++)
			{
				// here we display only whats already typed in, otherwise placeholder chars we replace with spaces so
				// only content will be visible but gaps will be still there
				
				if(typedIn[a]!=undefined)
					tempPlaceholder[a]=typedIn[a];
				else 
				{
					// if its placeholder character where user can type in then do not display
					// otherwise with brackets and such display all
					if(tempPlaceholder[a]==settings.placeholderChar)
						tempPlaceholder[a]=" ";
				}
			}
			
			// fill in the field with placeholder and data already typed in
			
			$(i).val(tempPlaceholder.join(""));
		}
		
		
		function displayEnteredContent(i)
		{
			/* displays typed in content only */
			
			var tempPlaceholder=placeholder.split("");
			
			// loop over whatever is typed in and generate placeholder with typed in content so it can be diaplyed in a field
			
			var lastEnteredCharPos=0;
			
			for(a=0;a<tempPlaceholder.length;a++)
			{
				// here we display only whats already typed in, otherwise placeholder chars we replace with spaces so
				// only content will be visible but gaps will be still there
				
				if(typedIn[a]!=undefined)
				{
					tempPlaceholder[a]=typedIn[a];
					lastEnteredCharPos=a;
				}
				
				// also check for placeholder characters e.g. patterna might be
				// (__) __:::__/?__ (__)))
				// and user type in
				// (11) 11:::11/?__ (1_))) so there is gap between nun mandatory chcracter and mandatoy part
				// so we need to remove __ in between
				
				if(tempPlaceholder[a]==settings.placeholderChar)
				{
					tempPlaceholder[a]="";
				}
			}
			
			// we need to remove items from the end to the position of the last typed in character
			
			tempPlaceholder.splice(lastEnteredCharPos+(!lastEnteredCharPos ? 0 : 1),tempPlaceholder.length-lastEnteredCharPos);
			
			// fill in the field with placeholder and data already typed in
			
			$(i).val(tempPlaceholder.join(""));
		}
		
		
		function displayContentAndPlaceholder(i)
		{
			/* displays typed in content only, without placeholder */
			
			var tempPlaceholder=placeholder.split("");
			
			// loop over whatever is typed in and generate placeholder with typed in content so it can be diaplyed in a field
			
			for(a=0;a<tempPlaceholder.length;a++)
			{
				// here we display only whats already typed in, otherwise placeholder chars we replace with spaces so
				// only content will be visible but gaps will be still there
				
				if(typedIn[a]!=undefined)
					tempPlaceholder[a]=typedIn[a];
			}
			
			// fill in the field with placeholder and data already typed in
			
			$(i).val(tempPlaceholder.join(""));
		}
		
		function correctlyFilledIn(i)
		{
			// checks if field is correctly filled in so if all required characters are entered
			
			// loop thru pattern all the way until optional content and check that everything that is not separator is entered
			
			for(a=0;a<optionalFrom;a++)
			{
				if(settings.pattern[a]!="sEpArAtOr")
				{
					if(typedIn[a]==undefined)
						return false;
				}
			}
			
			return true;
		}
		
		function deleteTypedIn(i,start,end)
		{
			// checks if field is correctly filled in so if all required characters are entered
			
			// loop thru pattern all the way until optional content and check that everything that is not separator is entered
			
			for(a=start;a<end;a++)
			{
				if(typedIn[a]!=undefined)
				{
					typedIn[a]=undefined
				}
			}
		}
		
		
		this.each(function() {
										
			// as nothing is typed in and we need to show empty masking only
			
			displayContentAndPlaceholder(this);
			
			$(this).bind("focus",function(e) {
			
				// for IE we need to get caret position when field becomes focused then display field content
				// then move caret to same position as otherwise caret will be placed at the beginning of field
				// for other browsers we could simply display content
				
				var caretPosition=doGetCaretPosition(this);
			
				displayContentAndPlaceholder(this);
						
				setCaretPosition(this,caretPosition);

			});
			
			
			$(this).bind("blur",function(e) {

				// check if all compulsory characters were entered and if not clear field
				
				if(!correctlyFilledIn(this))
				{
					// if not correctly filled in all mandatory fields then reset content of the field
					
					typedIn=[];
					
					// if placeholder has to be displayed at all times 
					
					if(settings.alwaysDisplayPlaceholder)
						displayContentAndPlaceholder(this);
					else
					{
						// otherwise we need to display empty field as placeholder is not needed and nothing is typed in
						$(this).val("");
					}	
				}
				else if(settings.alwaysDisplayPlaceholder)
				{
					// if the field is correctly filled in and and placeholder needs to be displayed at all times
					
					displayContentAndPlaceholder(this);
				}
				else if(!settings.alwaysDisplayPlaceholder)
				{
					// if field is correctly filled in but placeholder is not required at all times
					displayEnteredContent(this);
				}								
			});
			
			// this is used to detect when user selects part of text, so we getting start/end position and then when user pres del or backspace we can delete this whole text 
			
			$(this).bind("mouseup",function(e) {
				showSelection(this);
			});
			
			// in here we detecting backspace and delete presses as it cannot be detected relaibly in keypress
			
			$(this).bind("keydown",function(e) {
			
				// get caret position
				
				var caretPosition=doGetCaretPosition(this);
			
				var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
				
				if(charCode==8)
				{
					// backspace button so delete previous character and move cursor one back
						
					//setMasking(this,settings.placeholderChar, caretPosition-skipToTheLeft(caretPosition));
					
					// check if user selected (highlighted) more characters with mouse or something
					
					if(selectionStart!=null)
					{
						deleteTypedIn(this,selectionStart,selectionEnd);
						
						// and display updated content
						
						displayContentAndPlaceholder(this);
						
						// and move caret to beginning of selection

						// and for IE move caret in front of what we had selected as otherwise it will end up the end

						setCaretPosition(this,selectionStart);
						
						// and mark as nothing selected
						selectionStart=null;
					}
					else
					{
						updateField(this,undefined, caretPosition-skipToTheLeft(caretPosition));
						
						// and move caret one character before
						
						setCaretPosition(this,caretPosition-skipToTheLeft(caretPosition));
					}	
					
					return false;
				}
				else if(charCode==46)
				{
					//delete button so delete current character
					
					//setMasking(this,"_", caretPosition);
					
					// check if user selected (highlighted) more characters with mouse or something
					
					if(selectionStart!=null)
					{
						deleteTypedIn(this,selectionStart,selectionEnd);
						
						// and display updated content
						
						displayContentAndPlaceholder(this);
						
						// and for IE move caret in front of what we had selected as otherwise it will end up the end

						setCaretPosition(this,selectionStart);
						
						// and mark as nothing selected
						selectionStart=null;
					}
					else
					{
						updateField(this,undefined, caretPosition);
					
						setCaretPosition(this,caretPosition);
					}
					
					return false;
				}
				else if(charCode==37)
				{
					// check if shift+right arrow is pressed 
					// this is used to imitate selecting via keyboard
					
					if(window.event.shiftKey)
					{
						showSelection(this);
						
						// for some reason showSelection method and all its guts return different value for selectionStart when selection is made with mouse
						// and different when made with shift+arrow so in here we simply subtract 1 from start/end of selection
						
						if(selectionStart) selectionStart--;
						
					}
					else
					{
						// no shift so left arrow pressed only so check if previous is separator and if so skip
						
						setCaretPosition(this,caretPosition-skipToTheLeft(caretPosition));
						return false;
					}
				}
				else if(charCode==39)
				{
					if(window.event.shiftKey)
					{
						showSelection(this);
						
						// for some reason showSelection method and all its guts return different value for selectionStart when selection is made with mouse
						// and different when made with shift+arrow so in here we simply subtract 1 from start/end of selection
						
						if(selectionEnd<settings.pattern.length) selectionEnd++;
					}
					else
					{
						// no shift so right arrow pressed only so check if previous is separator and if so skip
						
						setCaretPosition(this,caretPosition+skipToTheRight(caretPosition));
						return false;
					}
				}
			});
			
			// we using keypress rather than keydown/up as this returns case sensitive values rather then non case sensitive as
			// keyup/down. we use keypress to detect what is typed in but as its not detecting backspace/delete buttons we 
			// do the check for these in keydown handler
			
			$(this).bind("keypress",function(e) {
				
				if(charCode==37)
				{
					return;
				}
				
				// get caret position and pattern for this position
				
				var caretPosition=doGetCaretPosition(this);
												
				// before anything else check if we outside of mask provided so too far right, if so just return
				
				if(caretPosition>=settings.pattern.length)
						return false;
						
				// as user might click on the field in a middle somewhere and we cannot detect with "focus" event where the 
				// caret is located, we need to check in here as the caret might be somewhere where the character cannot be edited  and if so then we need to move caret to next editable character
				// so we need to check if caret is in noneditable character and if so move it then to where its ok to enter characters
				// we reusing skipToTheRight function here as this will detect if there are any noneditable chars to the right
				
				caretPosition=caretPosition+moveCaretToEditablePosition(caretPosition);
				setCaretPosition(this,caretPosition);

				
				// get regex specifying  what is allowed for this position
				
				pattern=settings.pattern[caretPosition];
				
				// check if what user typed in fits pattern first
				
				var patt1=new RegExp(pattern);
				
				// now get the keycode for whatever user typed in, of course IE has different idea of how it should be done and we need to check existence of "which"
				
				var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
				
				// check if it matches pattern, if not simply ignore
				
				var characterTyped=String.fromCharCode(charCode);
				
				if(!patt1.test(characterTyped))
					return false;
				else
				{
					// otherwise enter what user tyed in and adjust masking so it displays properly so dosent move all the masking characers to the right as new character is typed in
					
					//setMasking(this,characterTyped, caretPosition);
					
					updateField(this,characterTyped, caretPosition);
					
					// move cursor to next position taking care of possible following separatoors like slashes, colons etc
					// setCaretPosition needs to differentiate between IE7/8 and the rest
					
					setCaretPosition(this,caretPosition+skipToTheRight(caretPosition));
					
					return false;
				}
			});
			
		});
		
		return this;
	}
	

})(jQuery);
