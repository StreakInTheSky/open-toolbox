var MOCK_DATA = {
	listings: [
		{
			id: 'aaaaaaa',
			userId: 111111,
			category: 'home tools',
			toolName: 'screwdriver',
			description: 'brand new',
			rate: 1,
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
			rate: 1,
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
			rate: 1,
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
       $('body').append(
       	'<h3>' + data.listings[index].toolName + '</h3>' +
        '<p>' + data.listings[index].description + '</p>');
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