function isValidZipCode(value) {
  var re = /^\d{5}([\-]\d{4})?$/;
  return (re.test(value));
}

(function($) {
  var geocoder = null;
  zillow = {};
  zillow.lookup = function(address) {
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
      
      var street_address = address.split(',')[0];
      var zip = null;
      $.each(result.address_components, function() {
        if (isValidZipCode(this.short_name) && isValidZipCode(this.long_name)) {
          zip = this.short_name;
        }
      });
      var data = {
        'zws-id': 'X1-ZWz1csm2cyipsb_6plsv', 
        'address': street_address,
        'citystatezip': zip
      };
      $.get('http://www.zillow.com/webservice/GetSearchResults.htm', data, function(xml) {
        if ($(xml).find('message code').text() != '0') {
          $('#errors').show().text($(xml).find('message text').text());
          return;
        }
        $('#errors').hide();
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
      });
    });
  };
  $(function() {
    $('#form').submit(function() {
      zillow.lookup($('#address').val());
      return false;
    });
    geocoder = new google.maps.Geocoder();
  });
})(jQuery);
