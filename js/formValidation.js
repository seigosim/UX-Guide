$(document).ready(function(){


	(function(){
		/* bind validation to formfields 
			formfield must have a data-validateonsubmit or data-validateonblur attribute which
			indicates the type of validation to perform

		*/
		$(':input').each(function(){
			var formField = this;
			$(formField).on('focusout',function(){
					$('.formindicator[data-for="' + formField.name + '"].notice').remove(); // remove helptext indicators
					$(formField).removeClass('error');
			});
			$(formField).on('focusin',function(){
					$('.formindicator[data-for="' + formField.name + '"].error').remove(); // remove error indicators
			});
			if($(formField).data('validateonblur')){
				// this field requires validation
				var validationMethod = $(formField).data('validateonblur');
				$(formField).on('focusout',function(){
					formValidate(formField,validationMethod); // attach validation to onBlur event
				});
				
				if (formField.nodeName != "FORM" && formField.form) {
					$(formField.form).on('submit',function(){
						// add to form submit as well
					 	return formValidate(formField,validationMethod);
					 });
				}
			}
			if($(formField).data('validateonsubmit')){
				// add validation check on submit
				var validationMethod = $(formField).data('validateonsubmit');
				if (formField.nodeName != "FORM" && formField.form) {
					var formField = formField;
					$(formField.form).on('submit',function(){
					 	return formValidate(formField,validationMethod);
					 });
				}
			}
		});
	})();

	(function(){
		/* bind helptext to formfields 
			form field must have a data-helptext atrribute containing the helptext message
		*/
		$(':input').each(function(){
			if($(this).data('helptext') && $(this).data('helptext').length){
				var helptext = $(this).data('helptext');
				var $ele = $(this);
				$(this).on('focusout',function(){
					$('.formindicator[data-for="' + this.name + '"].notice').remove(); // remove helptext indicators
				});
				$(this).on('focusin',function(){
					// create an error indicator element
					var $indicator = $(document.createElement('div'));
					$indicator.attr('data-for',this.name); // add data attribute to associate to formfield
					$indicator.addClass('formindicator notice');
					$indicator.html(helptext);
					// remove data-helptext attribute so the helptext will not reappear
					$(this).removeData('helptext');
					$(this).after($indicator);
					// animate the notice indicator
					$indicator.css('opacity','0');
					$indicator.animate({'opacity':'1'},{queue:false, duration:700});
					
				});
			}
		});

	})();

});



function processPhone(countryCode,phone){
	/* validate and reformat phone number using PhoneFormat.js library 
		returns obj[str cleanPhone, str localFormat, bool valid, int countryCode] 
		Requires a country code (US, GB, AU, CA)
	*/
	var a = cleanPhone(phone);
	var b = formatLocal(countryCode, phone);
	var c = isValidNumber(countryCode, phone);
	var d =countryCode;
	return [a,b,c,d];
}

function requiredFields(fieldSelector,errorMsgSelector,allRequired) {
	/*	Supply a selector to gather all fields that are required
		if the fields are radio buttons or checkboxes, the validator
		will require that at least one is checked.
		If text fields are specified, all must contain a value.
		If a select field is specified, at least one non-empty value must be selected
		- The errorMsgSelector will be the area that is shown if the validation fails
	*/
	var $fields = $(fieldSelector);
	if($fields.length){
		var fieldtype = $fields[0].type;
		if(fieldtype && $fields[0].form){
			var sameFieldType = true;
				// test all fields for the same type
				for( var i = 0; i <= $fields.length; i++){
					if($fields[i] && $fields[i].type && $fields[i].type != fieldtype) sameFieldType = false;
				}
			if(sameFieldType && (fieldtype === 'checkbox' || fieldtype === 'radio')){
				var atLeastOneChecked = false;
				var allChecked = true;
					for( var i = 0; i <= $fields.length; i++){
						if($fields[i]){
							if($fields[i].checked) {
								atLeastOneChecked = true;
							} else {
								allChecked = false;
							}
						} 
					}
				if(allRequired){
					if(! allChecked) {
						// show error
						$(errorMsgSelector).show();
						return false;
					}
				} else if(! atLeastOneChecked){
					// show error
					$(errorMsgSelector).show();
					return false;
				} 
				// valid
				$(errorMsgSelector).hide();
				return true;
			}
		}
		
	}
	return true;
}


function formValidate (formField,validationMethod){
	/*	validation methods: 
			validphone - uses country code to validate local format
			validemail - works for most common email addresses
			validdate - if country code is present and not US, will use dd-mm-yyyy format, otherwise uses mm-dd-yyyy
			validdate2 - uses yyyy-mm-dd format
			validtime - hh:mm in 12hr format only, colon added
			validtimeampm - hh:mm in 12hr format only with am/pm required, colon added
			validcc - checks valid credit card numbers
			required - (use with validateonsubmit) checks for an empty field
	*/
	var showError = function(formField){
		$(formField).addClass('error'); // highlight error on formfield
		if($(formField).data('errortext')){
			// create an error indicator element
			$('.formindicator[data-for="' + formField.name + '"].error').remove(); // remove error indicators
			var $indicator = $(document.createElement('div'));
			$indicator.attr('data-for',formField.name); // add data attribute to associate to formfield
			$indicator.addClass('formindicator error');
			$indicator.html($(formField).data('errortext'));
			$(formField).after($indicator);
			// animate the  error indicator
			$indicator.css('opacity','0');
			$indicator.css('margin-left','-3px');
			$indicator.animate({'opacity':'1'},{queue:false, duration:250});
			$indicator.animate({'margin-left':'15px'},250);
			$indicator.animate({'margin-left':'10px'},50);
			$indicator.animate({'margin-left':'15px'},50);
		}
	};
	var clearError = function(formField){
		// clear error styles
		$(formField).removeClass('error');
		$('.formindicator[data-for="' + formField.name + '"].error').remove(); // remove error indicators
	}
	if(formField != null && formField != undefined) {
		if (formField.nodeName != "FORM" && formField.form) {
		    var frm = formField.form;
		    var frmType  = formField.type;
		    if(frmType.indexOf('select') != -1 &&  formField.options) {
		    	var frmVal = formField.options[formField.selectedIndex].value;
		    } else {
		    	var frmVal = formField.value;
		    }
			var frmVal = formField.value;
			var valid = (function(){
				switch (validationMethod) {
					case 'validphone':
						// PhoneFormat.js library must be available
						if(processPhone && $.isFunction(processPhone)){
							// to validate, needs country code
							if(frm.elements['country'] != undefined) {
								var countryCode = frm.elements['country'].value;
							} else {
								// default to US
								var countryCode = 'US';
							}
							var result = processPhone(countryCode,frmVal);
							formField.value = result[1]; // reformat phone field
							if(frm.cleanphone != null && frm.cleanphone != undefined ){
								frm.cleanphone.value = result[0]; //populate cleaned phone number
							}
							return result[2]; // isValidNumber
						}
							return true; // cannot validate
					case 'validemail':
						var testemail = frmVal.replace(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,"");//'
						if(! testemail.length){ 
							return true;
						}
						return false;
					case 'validdate': 
						// use country field to determine the format to validate against
						if(frm.elements['country'] != undefined) {
							var countryCode = frm.elements['country'].value;
						} else {
							// default to US
							var countryCode = 'US';
						}
				        var matches = /^(\d{2})[-\/](\d{2})[-\/](\d{4})$/.exec(frmVal); 
					    if (matches == null) return false;
					    if(countryCode == 'US') { // mm-dd-yyyy
					    	var d = matches[2];
					    	var m = matches[1] - 1;
					    	var y = matches[3];
					    } else {				 // dd-mm-yyyy
							var m = matches[2] - 1;
					    	var d = matches[1];
					    	var y = matches[3];
					    }
					    var composedDate = new Date(y, m, d);

					    var validDate = composedDate.getDate() == d &&
					            composedDate.getMonth() == m &&
					            composedDate.getFullYear() == y;

					    if(frm.cleandate != null && frm.cleandate != undefined && validDate){
							frm.cleandate.value = composedDate.getFullYear() + "-" + (composedDate.getMonth() +1)  + "-" + composedDate.getDate(); //populate cleaned date
						}

					    return validDate;

					case 'validdate2': //yyyy-mm-dd
				        var matches = /^(\d{4})[-\/](\d{2})[-\/](\d{2})$/.exec(frmVal); 
					    if (matches == null) return false;
					    var y = matches[1];
					    var m = matches[2] - 1;
					    var d = matches[3];
					    var composedDate = new Date(y, m, d);
					    return composedDate.getDate() == d &&
					            composedDate.getMonth() == m &&
					            composedDate.getFullYear() == y;
					case 'validtime': // 12 hr
						var matches = /^(1[012]|[1-9])(:)?([0-5][0-9])(\s+)?(am|pm)?$/i.exec(frmVal);
						if (matches == null) return false;
						formField.value = matches[1] + ":" + matches[3];
						return true;
					case 'validtimeampm': // 12 hr with required am/pm part
						matches = /^(1[012]|[1-9])(:)?([0-5][0-9])(\s+)?(am|pm)$/i.exec(frmVal);
						if (matches == null) return false;
						formField.value = matches[1] + ":" + matches[3] + ' ' + matches[5].toUpperCase();
						return true;
					case 'validtime24ampm': // 12 or 24 hr with am/pm part
						var matches = /^(0[0-9]|1[0-9]|2[0-4]|[1-9])(:)?([0-5][0-9])(\s+)?(am|pm)?$/i.exec(frmVal);
						if (matches == null) return false;
						if(matches[1] >= 13 || matches[1].charAt(0) == '0'){
							// 24hr
							if(matches[5] && matches[5].length) return false; // has a am/pm part
							formField.value = matches[1] + matches[3];
						} else {
							// 12hr
							if(!matches[5]) return false;
							formField.value = matches[1] + ":" + matches[3] + ' ' + matches[5].toUpperCase();
						}
						return true;

					case 'validcc': // credit card
						  var input = frmVal.replace(/[^0-9]/g,'');
						  var sum = 0;
						  var numdigits = input.length;
						  var parity = numdigits % 2;
						  for(var i=0; i < numdigits; i++) {
						    var digit = parseInt(input.charAt(i))
						    if(i % 2 == parity) digit *= 2;
						    if(digit > 9) digit -= 9;
						    sum += digit;
						  }
						  return input.length >= 10 && input.length <= 16 && ((sum % 10) == 0);
					case 'required':
							return frmVal.length >= 1;
				}
				return false;
			})();
			if(! valid){
				showError(formField);
				return false;
			} else {
				clearError(formField);
				return true;
			}
		}
	}
}
