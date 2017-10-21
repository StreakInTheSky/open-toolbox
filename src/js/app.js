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
		listEl.find('img').attr('src', data[index].image);
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

function capitalizeWords(str) {
	return str.split(' ')
						.map(function(word) {
					    return word.charAt(0).toUpperCase() + word.slice(1);
						})
						.join(' ');
}

function filterListings(filter) {
	$('ol.results').empty();

	switch(window.location.pathname.split('/')[1]) {
		case '':
			getListings(displayListings, '?disabled=false&category=' + encodeURI(filter));
			var newH2 = capitalizeWords(filter);
			$("main h2").text(newH2);
			return
		case 'my-listings':
			getListings(displayListings, '?category=' + encodeURI(filter));
			$("main h2").text('My Listings - ' + filter);
			return
	}
}

function getListingItem(callback) {
	$.getJSON(apiBase + '/' + window.location.pathname.split('/')[2]).done(function(data) {
		callback(data);
	});
}

function populateEdit(data) {
	state.id = data.id;
	state['availability-start'] = moment(data.availability.start).format("YYYY-MM-DD")
	state['availability-end'] = moment(data.availability.end).format("YYYY-MM-DD")
	$('#tool-name').val(data.toolName);
	$('#rate').val((data.rate/Math.pow(10, 2)).toFixed(2));
	$('#description').val(data.description);
	$('#availability-start').val(moment(data.availability.start).format("YYYY-MM-DD"));
	$('#availability-end').val(moment(data.availability.end).format("YYYY-MM-DD"));
	$('.current-image img').attr('src', data.image);
	data.category.forEach(function(item) {
		$('.edit-form input[value="' + item + '"]').attr("checked", true);
	})
}

// updates state when input detected in form fields
function detectFieldChange() {
	$(".edit-form :input").change(function(){
		var input = $(this).attr('name');

		if (input === 'category') {
			return state[input] = $("input[name='category']:checked").map(function(){return $(this).val()}).get()
		}
		 state[input] = $(this).val();
	})
}

function submitData(method, data) {
	var url;

	const requiredFields = ['tool-name', 'rate', 'description'];

	var missingFields = 0;
	requiredFields.forEach(function(field) {
		if ($('#' + field).val().length === 0) {
			// $('#' + field).after('<span style="color:red">*required</span>');
			missingFields++;
		}
	})

	if ($('input[name=category]:checked').length === 0) {
		alert("Please select at least one category");
		missingFields++;
	}

	if (missingFields > 0) {
		return;
	}

	// change url depending on page
	if (method === "PUT") {
		url = apiBase + '/' + data.id;
	} else if (method === "POST"){
		url = apiBase;
	}

	if (data.rate) {
		data.rate *= 100;
	}

	Object.assign(data, {
		availability: {
			start: data['availability-start'] ? data['availability-start'] : moment().format("YYYY-MM-DD"),
			end: data['availability-end'] ? data['availability-end'] : null
		},
	})

	delete data['availability-start'];
	delete data['availability-end'];

	var submitSettings = {
			url: url,
			method: method,
			data: JSON.stringify(data),
			dataType: 'json',
			contentType: 'application/json; charset=utf-8',
			success: function() {
									if (window.location.pathname.split('/')[1] === 'add-listing') {
										window.location.pathname = '/my-listings';
									} else {
										location.reload();
									}
							 }
	};

	$.ajax(submitSettings);
}

function populateListing(data) {
	console.log(data)

	$('.listing-title').text(data.toolName);
	$('.listing-image-wrapper img').attr('src', data.image);
	$('.listing-rate #rate').text((data.rate/Math.pow(10, 2)).toFixed(2));
	$('.description').text(data.description);
	$( "#start-datepicker" ).datepicker({
		minDate: new Date(data.userStart),
		maxDate: new Date(data.userEnd)
	});
	$( "#end-datepicker" ).datepicker({
		minDate: new Date(data.userStart),
		maxDate: new Date(data.userEnd)
	});
}

// this function can stay the same even when we
// are connecting to real API
function getAndDisplayListings() {
	switch(window.location.pathname.split('/')[1]) {
		case '':
			getListings(displayListings, '?disabled=false');
			$(".result-listing")
				.addClass("not-working")
				.css("cursor", "pointer");
			return
		case 'my-listings':
			getListings(displayListings);
			return
		case 'edit-listing':
			getListingItem(populateEdit);
			return
		case 'listing':
			getListingItem(populateListing);
			return
	}
}


function bindEventHandlers() {

	// // Shows overlay and pop-up when a non working feature is invoked.
	// $('.results').on('click', '.not-working', function() {
	// 	$('.overlay').css('width', '100%');
	// })

	// // Closes overlay and pop-up
	// $('.overlay').click(function() {
	// 	$(this).css('width', '0');
	// })

	// Goes to listing page when clicking listing card
	$('.results').on('click', '.result-listing:not(.my-listing)', function(){
		var listingId = $(this).closest('.result-listing').data('id');
		window.location.pathname = '/listing/' + listingId;
	})
	$('.results').on('click', '.tool-name', function(){
		var listingId = $(this).closest('.result-listing').data('id');
		window.location.pathname = '/listing/' + listingId;
	})
	$('.results').on('click', '.result-listing .image-wrapper', function(){
		var listingId = $(this).closest('.result-listing').data('id');
		window.location.pathname = '/listing/' + listingId;
	})

	// Handles uploading of new image
	$('#image').on('change', function() {
		if (this.files && this.files[0]) {
			var reader = new FileReader()
			reader.addEventListener('load', function(event) {
				state.image = event.target.result;
			})
		}
		reader.readAsDataURL(this.files[0])
	})

	// Go to add listing page
	$('#add-new').click(function(event){
		event.preventDefault();
		window.location.pathname = '/add-listing/';
	})

	$('.edit-form').on('submit', function(event) {
		event.preventDefault();
	})

	// Goes to edit page when edit button is clicked
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
			if (window.location.pathname.split('/')[1] === "") {
				$('main h2').text('All Listings');
			} else {
				$('main h2').text('My Listings');
			}
		} else {
			filterListings($(this).attr('id').replace(/\-/, ' '));
		}
	})

	// Handles sumbiting data
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
				return;
		}
	})

	// toggles aside on mobile
	$('.logo i').click(function() {
		$("aside").toggleClass("is-open");
	})
}

$(function() {
	// if (window.location.pathname.split('/')[1] === 'listing') {
	// 	$( "#start-datepicker" ).datepicker();
	// 	$( "#end-datepicker" ).datepicker();
	// }
  getAndDisplayListings();
	bindEventHandlers();
	detectFieldChange();
})
