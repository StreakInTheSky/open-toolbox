const apiBase = '/tools';
let state = {};

function getListings(callbackFn, query = '') {
	$.getJSON(apiBase + query, data => callbackFn(data)); // {disabled: 'false'}
}

// this function stays the same when we connect
// to real API later
function displayListings(data) {
  for (index in data) {
		// finds template elements in DOM
		// and replaces content with content from db
		var listEl = $('.templates .result-listing').clone();
		listEl.find('.tool-name').text(data[index].toolName);
		listEl.find('.rate').text('$' + ((data[index].rate)/Math.pow(10, 2)).toFixed(2) + '/day');
		listEl.find('img').attr('src', data[index].images[0]);
		listEl.find('.description').text(data[index].description);
		listEl.attr('data-id', data[index].id);

		if (data[index].disabled === true) {
			listEl.addClass('disabled');
			listEl.find('.button-disable').addClass('hidden');
			listEl.find('.button-enable').removeClass('hidden');
		}

    $('ol.results').append(listEl);
  }
}

function bindEventHandlers() {
	// Add new listing
	$('#add-new').click(function(event){
		event.preventDefault();
		window.location.pathname = '/add-listing/';
	})

	// Edit-button handler
	$('.edit-form').on('submit', function(event) {
		event.preventDefault();
	})
	$('.results').on('click', '.button-edit', function() {
		var listingId = $(this).closest('.result-listing').data('id');
		window.location.pathname = '/edit-listing/' + listingId;
	})

	// Disables listing
	$('.results').on('click', '.button-disable', function() {
		var listingId = $(this).closest('.result-listing').data('id');

		$(this).closest('.result-listing').toggleClass('disabled');
		$(this).addClass('hidden');
		$(this).siblings('.button-enable').removeClass('hidden');

		var disabledSettings = {
			method: 'PUT',
			data: JSON.stringify({
				id: listingId,
				disabled: true
			}),
			dataType: 'json',
			contentType: 'application/json; charset=utf-8'
		};
		console.log(disabledSettings);
		$.ajax(apiBase + '/' + listingId, disabledSettings)
	})

	// Enables listing
	$('.results').on('click', '.button-enable', function() {
		var listingId = $(this).closest('.result-listing').data('id');

		$(this).closest('.result-listing').toggleClass('disabled');
		$(this).addClass('hidden');
		$(this).siblings('.button-disable').removeClass('hidden');

		var disabledSettings = {
			method: 'PUT',
			data: JSON.stringify({
				id: listingId,
				disabled: false
			}),
			dataType: 'json',
			contentType: 'application/json; charset=utf-8'
		};

		$.ajax(apiBase + '/' + listingId, disabledSettings)
	})

	// Delete listing
	$('#button-delete').click(function() {
		var listingId = window.location.pathname.split('/')[2];

		var confirmDelete = confirm('Delete the listing?');

		if (confirmDelete === true) {
			$.ajax({
				url: apiBase + '/' + listingId,
				method: 'DELETE'
			})
			window.location.pathname = '/my-listings'
		}
	})

	//Filtering by category
	$('ul.filters li').on('click', function() {
		if($(this).attr('id') === 'show-all') {
			$('ol.results').empty();
			getAndDisplayListings();
		} else {
			filterListings([$(this).attr('id').replace(/\-/, ' ')]);
		}
	})

	$('#button-submit').click(function(){
		var method;
		switch(window.location.pathname.split('/')[1]) {
			case 'edit-listing':
				method = "PUT"
				submitData(method, state);
				return;
			case 'add-listing':
				method = "POST"
				submitData(method, state);
				window.location.pathname = 'my-listings';
		}
	})
}

function submitData(method, data) {
	var url;

	// change url depending on page
	if (method === "PUT") {
		url = apiBase + '/' + data.id;
	} else {
		url = apiBase;
	}

	//converts rate to cents
	if(data.rate) {
		data.rate = data.rate * 100;
	}

	if(data['availability-start']) {
		var availabilityStart = {
			start: Date.parse(data['availability-start'])
		}

		data['availability'] = availabilityStart;

		delete data['availability-start'];
	}

	if(data['availability-end']) {
		var availabilityEnd = {
			end: Date.parse(data['availability-end'])
		}

		data['availability'] = availabilityEnd;

		delete data['availability-end'];
	}

	var submitSettings = {
			url: url,
			method: method,
			data: JSON.stringify(data),
			dataType: 'json',
			contentType: 'application/json; charset=utf-8'
	};

	$.ajax(submitSettings);
	location.reload();
}

function populateEdit(data) {
	state.id = data.id;
	$('#tool-name').val(data.toolName);
	$('#rate').val((data.rate/Math.pow(10, 2)).toFixed(2));
	$('#description').val(data.description);
	$('#availability-start').val(moment(data.availability.start).format("YYYY-MM-DD"));
	$('#availability-end').val(moment(data.availability.end).format("YYYY-MM-DD"));
	$('.current-image img').attr('src', data.images[0]);
	data.category.forEach(function(item) {
		$('.edit-form input[value="' + item + '"]').attr("checked", true);
	})
}

function detectFieldChange() {
	$(".edit-form :input").change(function(){
		var input = $(this).attr('name');

		if (input === 'category') {
			return state[input] = $("input[name='category']:checked").map(function(){return $(this).val()}).get()
		}
		 state[input] = $(this).val();
	})
}

function getListingItem() {
	$(window).on('load', function(){
		$.getJSON(apiBase + '/' + window.location.pathname.split('/')[2]).done(function(data) {
			populateEdit(data);
		});
	})
}

function filterListings(filter) {
	$('ol.results').empty();

	switch(window.location.pathname.split('/')[1]) {
		case '':
			getListings(displayListings, '?disabled=false&category=' + encodeURI(filter));
			return
		case 'my-listings':
			getListings(displayListings, '?category=' + encodeURI(filter));
			return
	}
}

// this function can stay the same even when we
// are connecting to real API
function getAndDisplayListings() {
	switch(window.location.pathname.split('/')[1]) {
		case '':
			getListings(displayListings, '?disabled=false');
			return
		case 'my-listings':
			getListings(displayListings);
			return
		case 'edit-listing':
			getListingItem()
			return
	}
}


$(function() {
  getAndDisplayListings();
	bindEventHandlers();
	detectFieldChange();
})
