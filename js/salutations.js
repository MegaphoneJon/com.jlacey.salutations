(function ($) {
  //Initial salutation processing
  CRM.api3('CustomField', 'getsingle', {
    "return": ["id"],
    "name": "salutation_type"
  }).done(function(salutationTypeField) {
    //Page load
    salutation_type(salutationTypeField.id);
    //When the salutation type changes
    CRM.$("select[id*='custom_" + salutationTypeField.id + "']").change(function() {
      salutation_type(salutationTypeField.id);
    });
  });
  //Changing the wrench path for greetings
  CRM.api3('CustomField', 'getsingle', {
    "return": ["id"],
    "name": "salutation_postal_greeting"
  }).done(function(salutationPostalGreetingField) {
    CRM.$("tr[class*='custom_" + salutationPostalGreetingField.id + "'] .crm-option-edit-link").attr({
      'data-option-edit-path': 'civicrm/admin/options/postal_greeting',
      href: '/civicrm/admin/options/postal_greeting?reset=1'
    });
  });
  //Changing the wrench path for addressees
  CRM.api3('CustomField', 'getsingle', {
    "return": ["id"],
    "name": "salutation_addressee"
  }).done(function(salutationAddresseeField) {
    CRM.$("tr[class*='custom_" + salutationAddresseeField.id + "'] .crm-option-edit-link").attr({
      'data-option-edit-path': 'civicrm/admin/options/addressee',
      href: '/civicrm/admin/options/addressee?reset=1'
    });
  });
})(CRM.$);

/*
 * Salutation Type handling
 */
function salutation_type (fieldId){
  //Process the selected option
  //Addressee
  if (CRM.$("select[id*='custom_" + fieldId + "'] option:selected").val() == 'salutation_addressee') {
    CRM.api3('CustomField', 'getsingle', {
      "return": ["id"],
      "name": 'salutation_addressee'
    }).done(function(selectedGreetingField) {
      //Hide greeting options
      CRM.api3('CustomField', 'getsingle', {
        "return": ["id"],
        "name": 'salutation_postal_greeting'
      }).done(function(unselectedGreetingField) {
        CRM.$("tr[class*='custom_" + unselectedGreetingField.id + "']").hide();
      });
      //Show addressee options
      CRM.$("tr[class*='custom_" + selectedGreetingField.id + "']").show();

      //Generate the selected option
      //Page Load
      process_salutation(CRM.$("select[id*='custom_" + selectedGreetingField.id + "']").children('option:selected').text());
      //When the salutation option changes
      CRM.$("select[id*='custom_" + selectedGreetingField.id + "']").change(function() {
        process_salutation(CRM.$(this).children('option:selected').text());
      });
    });
  //Other greetings
  } else {
    CRM.api3('CustomField', 'getsingle', {
      "return": ["id"],
      "name": 'salutation_postal_greeting'
    }).done(function(selectedGreetingField) {
      //Hide addressee options
      CRM.api3('CustomField', 'getsingle', {
        "return": ["id"],
        "name": 'salutation_addressee'
      }).done(function(unselectedGreetingField) {
        CRM.$("tr[class*='custom_" + unselectedGreetingField.id + "']").hide();
      });
      //Show greeting options
      CRM.$("tr[class*='custom_" + selectedGreetingField.id + "']").show();

      //Generate the selected option
      //Page Load
      process_salutation(CRM.$("select[id*='custom_" + selectedGreetingField.id + "']").children('option:selected').text());
      //When the salutation option changes
      CRM.$("select[id*='custom_" + selectedGreetingField.id + "']").change(function() {
        process_salutation(CRM.$(this).children('option:selected').text());
      });
    });
  }
}

/*
 * Process the salutation option
 */
function process_salutation(greetingToken){
  //Selected the salutation field
  CRM.api3('CustomField', 'getsingle', {
    "return": ["id"],
    "name": "salutation"
  }).done(function(salutationField) {
    //For non-customized options,
    if (greetingToken != 'Customized') {
      //Set the salutation field read only
      CRM.$("input[id*='custom_" + salutationField.id + "']").prop('readonly', 'readonly');
      //Process the salutation tokens
      CRM.api3('Salutation', 'process', {
        "contactId": get_url_vars()['cid'],
        "greetingString": greetingToken,
      }).done(function(result) {
        //And the set the value
        CRM.$("input[id*='custom_" + salutationField.id + "']").val(result.values.greeting);
      });
    } else {
      //If customized is selected, remove the read only restriction from field
      CRM.$("input[id*='custom_" + salutationField.id + "']").removeProp('readonly');
    }
  });
}

/*
 * Helper function to get URL variables
 *
 * Needed to get the contact id for proper token processing
 */
function get_url_vars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
  });
  return vars;
}
