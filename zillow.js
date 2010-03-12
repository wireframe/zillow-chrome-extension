function isValidZipCode(value) {
  var re = /^\d{5}([\-]\d{4})?$/;
  return (re.test(value));
}

(function($) {
  var geocoder = null;
  zillow = {};
  zillow.api_key = 'X1-ZWz1csm2cyipsb_6plsv';
  zillow.findAddress = function(address, callback) {
    $('#map_area').hide();
    
    if (geocoder == null) { geocoder = new google.maps.Geocoder(); }
    geocoder.geocode({'address': address}, function(results, status) {
      if (status != google.maps.GeocoderStatus.OK) {
        $('#errors').show().text('Unable to locate address');
        return;
      }
      $('#map_area').show();

      var result = results[0]
      var address = result.formatted_address;
      var location = result.geometry.location;

      var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: location,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
      var marker = new google.maps.Marker({
        position: location, 
        map: map, 
        title: address
      });
      $('#external_map').click(function() {
        chrome.tabs.create({
          url: 'http://maps.google.com?near=' + address
        });
        return false;
      });
      
      callback(result);
    });
  };
  zillow.findEstimate = function(address) {
    $('#errors').hide();
    $('#zestimate').hide();
    
    zillow.findAddress(address, function(result) {
      var address = result.formatted_address;
      var street_address = address.split(',')[0];
      var zip = null;
      $.each(result.address_components, function() {
        if (isValidZipCode(this.short_name) && isValidZipCode(this.long_name)) {
          zip = this.short_name;
        }
      });
      var data = {
        'zws-id': zillow.api_key, 
        'address': street_address,
        'citystatezip': zip
      };
      $.ajax({
        url: 'http://www.zillow.com/webservice/GetSearchResults.htm',
        data: data,
        dataType: 'xml',
        type: 'GET',
        success: function(xml) {
          if ($(xml).find('message code').text() != '0') {
            $('#errors').show().text($(xml).find('message text').text());
            return;
          }
          $('#zestimate').show();
          $('#home_details').click(function() {
            chrome.tabs.create({
              url: $(xml).find('links homedetails').text()
            });
          });

          var result = $(xml).find('result');
          var zestimate = result.find('zestimate');

          $('#estimate').text(zestimate.find('amount').text());
          var valuation = zestimate.find('valuationRange');
          $('#estimate_low').text(valuation.find('low').text());
          $('#estimate_high').text(valuation.find('high').text());
        }
      });
    });
  };

  $(function() {
    $('#form').submit(function() {
      zillow.findEstimate($('#address').val());
      return false;
    });
  });
})(jQuery);
