var MOCK_DATA = {
	listings: [
		{
			id: 'aaaaaaa',
			userId: 111111,
			category: 'home tools',
			toolName: 'screwdriver',
			description: 'brand new',
			rate: 100,
			availability: [
				{
					start: '1486006623722',
					end: '1486006683723'
				}
			],
			images: ['../images/screwdriver1.jpg']
		},
		{
			id: 'bbbbbbb',
			userId: 111111,
			category: 'home tools',
			toolName: 'screwdriver',
			description: 'brand new',
			rate: 50,
			availability: [
				{
					start: '1486006623722',
					end: '1486006683723'
				}
			],
			images: ['../images/screwdriver1.jpg']
		},
		{
			id: 'ccccccc',
			userId: 111111,
			category: 'home tools',
			toolName: 'screwdriver',
			description: 'brand new',
			rate: 25,
			availability: [
				{
					start: '1486006623722',
					end: '1486006683723'
				}
			],
			images: ['../images/screwdriver1.jpg']
		}
	]
}

function getListings(callbackFn) {
    setTimeout(function(){ callbackFn(MOCK_DATA)}, 100);
}

// this function stays the same when we connect
// to real API later
function displayListings(data) {
    for (index in data.listings) {
       $('ul.results').append(
       	'<div class="result-listing">' +
       		'<h3 class="tool-name">' + data.listings[index].toolName + '</h3>' +
       		'<p class="tool-rate">$' + ((data.listings[index].rate)/Math.pow(10, 2)).toFixed(2) + '/day</p>' +
       		'<img src="' + data.listings[index].images[0] + '"></img>' +
        	'<p class="tool-description">' + data.listings[index].description + '</p>'+
        '</div>');
    }
}

// this function can stay the same even when we
// are connecting to real API
function getAndDisplayListings() {
    getListings(displayListings);
}

$(function() {
    getAndDisplayListings();
})