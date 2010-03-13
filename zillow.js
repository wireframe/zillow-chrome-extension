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
      console.log(result);

      callback(result);
    });
  };

  zillow.showMap = function(result, tooltip) {
    var address = result.formatted_address;
    var location = result.geometry.location;

    var map = new google.maps.Map(document.getElementById("map"), {
      zoom: 15,
      center: location,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false
    });
    var marker = new google.maps.Marker({
      position: location, 
      map: map
    });
    var infowindow = new google.maps.InfoWindow({
      content: tooltip.html()
    });
    infowindow.open(map, marker);
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map, marker);
    });

    $('#external_map').click(function() {
      chrome.tabs.create({
        url: 'http://maps.google.com?near=' + address
      });
      window.close();
      return false;
    });
  };

  /*
  lookup an estimate for a geocoded result.
  */
  zillow.findEstimate = function(result, callback) {
    $.ajax({
      url: 'http://www.zillow.com/webservice/GetSearchResults.htm',
      data: zillow.postParams(result),
      dataType: 'xml',
      type: 'GET',
      success: callback
    });
  };
  zillow.postParams = function(result) {
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
    return data;
  };
  zillow.formatEstimate = function(result, xml) {
    console.log(xml);

    var content = $('<div />');
    $('<h4 />').text(result.formatted_address).appendTo(content);

    if ($(xml).find('message code').text() != '0') {
      $('<b />').text($(xml).find('message text').text()).appendTo(content);
      var data = zillow.postParams(result);
      $('<p />').text('street: ' + data['address'] + ' zip: ' + data['citystatezip']).appendTo(content);
      return content;
    }
    var result = $(xml).find('result');
    var zestimate = result.find('zestimate');

    $('<h5 />').text('$' + zestimate.find('amount').text()).appendTo(content);
    var valuation = zestimate.find('valuationRange');
    $('<p />').append('$' + valuation.find('low').text() + ' - $' + valuation.find('high').text()).appendTo(content);

    $('<a href="#">view detailed estimate</a>').appendTo(content).click(function() {
      chrome.tabs.create({
        url: $(xml).find('links homedetails').text()
      });
      window.close();
      return false;
    });

    return content;
  };

  $(function() {
    $('#form').submit(function() {
      zillow.findAddress($('#address').val(), function(result) {
        zillow.findEstimate(result, function(xml) {
          zillow.showMap(result, zillow.formatEstimate(result, xml));
        });
      });
      return false;
    });
  });
})(jQuery);
