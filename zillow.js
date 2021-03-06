(function($) {
  /*
  see http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
  */
  Number.prototype.formatMoney = function(c, d, t){
    var n = this;
    c = isNaN(c = Math.abs(c)) ? 2 : c;
    d = d == undefined ? "," : d;
    t = t == undefined ? "." : t;
    s = n < 0 ? "-" : "";
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "";
    j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
  };

  var geocoder = null;
  zillow = {};
  zillow.api_key = 'X1-ZWz1csm2cyipsb_6plsv';

  zillow.findAddress = function(address, callback) {
    $('#map_area').hide();
    $('#errors').hide();

    if (geocoder == null) { geocoder = new google.maps.Geocoder(); }
    geocoder.geocode({'address': address}, function(results, status) {
      console.log(results);
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
    var zip = address.match(/(\d{5}),/)[1];
    var data = {
      'zws-id': zillow.api_key, 
      'address': street_address,
      'citystatezip': zip
    };
    return data;
  };
  /*
  see http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
  */
  zillow.formatMoney = function(string) {
    var currency = "$";
    var separator = ',';
    return currency + new Number(string).formatMoney(0, '.', separator);
  },
  zillow.formatEstimate = function(result, xml) {
    console.log(xml);

    var data = zillow.postParams(result);
    var content = $('<div />');
    $('<h1 style="font-weight: normal; font-size: 0.8em; margin-bottom: 3px" />').text(data['address']).appendTo(content);

    if ($(xml).find('message code').text() != '0') {
      $('<b />').text($(xml).find('message text').text()).appendTo(content);
      $('<p />').text('street: ' + data['address'] + ' zip: ' + data['citystatezip']).appendTo(content);
      return content;
    }
    var result = $(xml).find('result');
    var zestimate = result.find('zestimate');

    $('<h2 style="font-size: 0.9em; margin-top: 3px; margin-bottom: 3px" />').text(zillow.formatMoney(zestimate.find('amount').text())).appendTo(content);
    var valuation = zestimate.find('valuationRange');
    $('<h3 style="font-size: 0.7em; color: #333; margin-top: 2px; margin-bottom: 2px" />').append(zillow.formatMoney(valuation.find('low').text()) + ' - ' + zillow.formatMoney(valuation.find('high').text())).appendTo(content);

    $('<a target="zillow" style="font-size: 0.7em; float: right; clear: both">view detailed estimate</a>').attr('href', $(xml).find('links homedetails').text()).appendTo(content);

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
