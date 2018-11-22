

$(document).ready(function(e) {
    
    $('.pagination').click(function(e) {
        let clickedPage = $(e.target).text();
        let activPage = $('.pagination .page-item.active > a').text();
        let lastPage = $('.pagination .page-item:nth-last-child(2) > a').text();
        let typeFilter = $('#typeFilter').val();

        activPage = parseInt(activPage);
        if(!Number.isInteger(activPage)) {
            return; //nie je to cislo, chyba
        }

        if(clickedPage == 'Previous') {
            if(activPage > 1) {
                getTablePage((activPage - 1), typeFilter);
            } else {
                //return; //neda sa posuvat
            }
        } else if(clickedPage == 'Next') {
            if(activPage < lastPage) {
                getTablePage((activPage + 1), typeFilter);
            } else {
                //return; //neda sa posuvat
            }
        } else {
            getTablePage(clickedPage, typeFilter);
        }
    });

    function getTablePage(actualPage, typeFilter) {
        $.ajax({
			type: 'GET',
			contentType: 'application/json',
            url: '/dashboard?page=' + actualPage + '&typeFilter=' + typeFilter,
            dataType: 'json',
            data: typeFilter,
			success: function(result) {
                let tableBody = $('#activityTable tbody');
                tableBody.html(result.data.htmlTable);

                let paginationBody = $('.pagination');
                paginationBody.html(result.data.htmlPaginator);
			},
			error: function(e) {
				console.log('ERROR: ', e);
			}
		});
    }

    $('#typeFilter').change(function () {
        let typeFilter = $(this).val();
        getTablePage(1, typeFilter);
    });

    $('#activityTable').click(function(e) {
        let row = $(e.target).parent();
        let activityId = row.data('id');

        //let data = [];
        //let cells = row.find('td');
        //for(let i = 0; i < cells.length; i++) {
            //data.push(cells[i].innerHTML);
        //}
        //console.log('activityId: ' + activityId);
        //console.log(data);

        //let host =  window.location.hostname + ':' + window.location.port;
    	$.ajax({
			type: 'GET',
			contentType: 'application/json',
            url: '/api/activities/' + activityId,
            dataType: 'json',
			success: function(result) {
                let date = convertDate(result.data.date_time);
                $('#activityForm #activityId').val(result.data.id);
                $('#activityForm #type').val(result.data.type);
                $('#activityForm #description').val((result.data.description));
                $('#activityForm #duration').val(result.data.duration);
                $('#activityForm #dateTime').val(date);
                $('#activityForm #place').val(result.data.place);
			},
			error: function(e) {
				console.log('ERROR: ', e);
			}
		});
    });

    $("#btnAdd").click(function(event) {
        let formDataJSON = getFormData();
        formDataJSON.actualPage = $('.pagination .page-item.active > a').text();
        let typeFilter = $('#typeFilter').val();
        
    	$.ajax({
			type: 'POST',
			contentType: 'application/json',
            url: '/dashboard?typeFilter=' + typeFilter,
            dataType: 'json',
			data: JSON.stringify(formDataJSON),
			success: function(result) {
				let tableBody = $('#activityTable tbody');
                tableBody.html(result.data.htmlTable);

                let paginationBody = $('.pagination');
                paginationBody.html(result.data.htmlPaginator);
			},
			error: function(e) {
				console.log('ERROR: ', e);
			}
		});
    	
    	resetFormData();
    });

    $("#btnUpdate").click(function(event) {
        //event.preventDefault();
        
        let formDataJSON = getFormData();
        console.log(formDataJSON);
        $.ajax({
            type: 'PATCH',
            contentType: 'application/json',
            url: '/api/activities/' + formDataJSON.activityId,
            dataType: 'json',
            data: JSON.stringify(formDataJSON),
			success: function(activity) {
                console.log(activity);
                let cells = $('tr[data-id="' + formDataJSON.activityId + '"]').find("td");
                let date = viewDate(activity[0].date_time);
                cells.eq(0).html(activity[0].type);
                cells.eq(1).html(viewDate(activity[0].date_time));
			},
			error: function(e) {
				console.log('ERROR: ', e);
			}
		});
    });
    
    $("#btnDelete").click(function(event) {
        let formDataJSON = getFormData();
        formDataJSON.actualPage = $('.pagination .page-item.active > a').text();
        let typeFilter = $('#typeFilter').val();

        $.ajax({
            type: 'DELETE',
            contentType: 'application/json',
            url: '/dashboard/' + formDataJSON.activityId + '?typeFilter=' + typeFilter,
            dataType: 'json',
            data: JSON.stringify(formDataJSON),
			success: function(result) {
				let tableBody = $('#activityTable tbody');
                tableBody.html(result.data.htmlTable);

                let paginationBody = $('.pagination');
                paginationBody.html(result.data.htmlPaginator);
			},
			error : function(e) {
				console.log('ERROR: ', e);
			}
		});	
	});
    
    function getFormData() {
        return {
            activityId: $("#activityForm #activityId").val(),
    		type: $("#activityForm #type").val(),
            description: $("#activityForm #description").val(),
            duration: $("#activityForm #duration").val(),
            dateTime: $("#activityForm #dateTime").val(),
            place: $("#activityForm #place").val()
    	}
    }
    
    function resetFormData() {
        $("#activityId").val("");
    	$("#type").val("");
        $("#description").val("");
        $("#duration").val("");
        $("#dateTime").val("");
        $("#place").val("");
    }

    function convertDate(date) {
        let auxDate = new Date(Date.parse(date));
        return (auxDate.getFullYear() + '-' + addZero(auxDate.getMonth() + 1) + '-' + addZero(auxDate.getDate()) +
            'T' + addZero(auxDate.getHours()) + ':' + addZero(auxDate.getMinutes()));
    }

    function viewDate(date) {
        var auxDate = new Date(Date.parse(date));
        auxDate = auxDate.toString();
        return (auxDate.substr(8, 2) + ' ' + auxDate.substr(4, 3) + ' ' + auxDate.substr(11, 4) + ' ' +
            auxDate.substr(16, 2) + ':' + auxDate.substr(19, 2) + ':' + auxDate.substr(22, 2));
    }

    function addZero(value) {
        if(value < 10) {
            value = '0' + value;
        }
        return value;
    }    
    
})

