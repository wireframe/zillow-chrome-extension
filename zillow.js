(function($) {
  $(function() {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'address': '4611 zane ave north crystal, mn'}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var result = results[0]
        var address = result.formatted_address;
        console.log(results[0]);
        
        var options = {
          zoom: 8,
          center: result.geometry.location,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"), options);
      }
    });

    $('#form').submit(function() {

      return false;
    });
  });
})(jQuery);

// CmdUtils.CreateCommand({
//   name: "zillow",
//   icon: "http://www.zillow.com/favicon.ico",
//   homepage: "http://ryan.codecrate.com",
//   author: { name: "Ryan Sonnek", email: "ryan@codecrate.com"},
//   license: "MIT",
//   description: "Search for property value on zillow.com",
//   help: "select an address and invoke this command",
//   takes: {"address": noun_arb_text},
//   searchUrl: 'http://www.zillow.com/webservice/GetSearchResults.htm',
//   postData: function(input) {
//     var address = input.text;
//     var zipcode = address.substring(address.lastIndexOf(' '));
//     var street = address.substring(0, address.lastIndexOf(' '));
//     return {'zws-id': 'X1-ZWz1csm2cyipsb_6plsv', 'address': address, 'citystatezip': zipcode};
//   },
//   preview: function(pblock, address) {
//     pblock.innerHTML = 'Loading...';
//     
//     jQuery.get(this.searchUrl, this.postData(address), function(xml) {
//       var result = jQuery(xml).find('result');
// 
//       var html = '';
//       html += result.size() + ' result found. <br />';
// 
//       html += "<p>" + address.text + "</p>";
//       
//       html += "<b>$" + result.find('zestimate').find('amount').text() + "</b><br />";
//       html += "<i>($" + result.find('zestimate').find('valuationRange').find('low').text() + " - ";
//       html += "$" + result.find('zestimate').find('valuationRange').find('high').text() + ")</i>";
// 
//       pblock.innerHTML = html;
//     });
//   },
//   execute: function(address) {
//     jQuery.get(this.searchUrl, this.postData(address), function(xml) {
//       var result = jQuery(xml).find('result');
//       var url = result.find('links').find('homedetails').text();
//       Utils.openUrlInBrowser(url);
//     });
//   }
// });